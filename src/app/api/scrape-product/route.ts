import { NextRequest, NextResponse } from 'next/server';

function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().trim();
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    return true;
  }

  // Verificar faixas de IP privadas e AWS/Cloud metadata (169.254.x)
  if (
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
  ) {
    return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL do produto é obrigatória.' },
        { status: 400 }
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      return NextResponse.json(
        { success: false, error: 'URL inválida.' },
        { status: 400 }
      );
    }

    // Proteção contra SSRF: apenas HTTP e HTTPS públicos
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { success: false, error: 'Apenas protocolos HTTP e HTTPS são permitidos.' },
        { status: 400 }
      );
    }

    if (isPrivateHost(parsedUrl.hostname)) {
      return NextResponse.json(
        { success: false, error: 'Acesso a endereços locais ou internos é proibido.' },
        { status: 403 }
      );
    }

    // Timeout de 5 segundos para não travar a experiência do usuário
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `A loja retornou status ${response.status}. Preencha os dados manualmente.`,
      });
    }

    // Limitar leitura a 1MB para proteção contra DoS
    const html = (await response.text()).slice(0, 1024 * 1024);

    // 1. Extração de Imagem (og:image, twitter:image, link rel=image_src)
    let imageUrl = '';
    const ogImageMatch =
      html.match(/<meta[^>]*property=["'](?:og:image|og:image:secure_url)["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["'](?:og:image|og:image:secure_url)["']/i) ||
      html.match(/<meta[^>]*name=["'](?:twitter:image|twitter:image:src)["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<link[^>]*rel=["']image_src["'][^>]*href=["']([^"']+)["']/i);

    if (ogImageMatch && ogImageMatch[1]) {
      try {
        imageUrl = new URL(ogImageMatch[1], parsedUrl.origin).href;
      } catch {
        imageUrl = ogImageMatch[1];
      }
    }

    // 2. Extração de Título (og:title, twitter:title, <title>)
    let title = '';
    const ogTitleMatch =
      html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i) ||
      html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i);

    if (ogTitleMatch && ogTitleMatch[1]) {
      title = ogTitleMatch[1]
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();

      // Limpar sufixos comuns de lojas como " | Mercado Livre", " - Shopee Brasil"
      title = title.replace(/\s*[-|–—]\s*(Mercado Livre|Shopee|Amazon|Magalu|Casas Bahia|Shein).*$/i, '').trim();
    }

    // 3. Extração de Preço (product:price:amount, og:price:amount, Schema.org JSON-LD)
    let price: number | null = null;
    const priceMetaMatch =
      html.match(/<meta[^>]*property=["'](?:product:price:amount|og:price:amount)["'][^>]*content=["']([\d.,]+)["']/i) ||
      html.match(/<meta[^>]*content=["']([\d.,]+)["'][^>]*property=["'](?:product:price:amount|og:price:amount)["']/i);

    if (priceMetaMatch && priceMetaMatch[1]) {
      const cleanPrice = parseFloat(priceMetaMatch[1].replace(',', '.'));
      if (!isNaN(cleanPrice) && cleanPrice > 0) {
        price = cleanPrice;
      }
    }

    // Se não achou em meta tags, tentar extrair de scripts JSON-LD (Schema.org Product)
    if (!price) {
      const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
      let match: RegExpExecArray | null;
      while ((match = jsonLdRegex.exec(html)) !== null) {
        try {
          const data = JSON.parse(match[1]);
          const product = Array.isArray(data) ? data.find((d) => d['@type'] === 'Product') : data;
          if (product && product.offers) {
            const offers = Array.isArray(product.offers) ? product.offers[0] : product.offers;
            const parsedOfferPrice = parseFloat(offers.price || offers.lowPrice);
            if (!isNaN(parsedOfferPrice) && parsedOfferPrice > 0) {
              price = parsedOfferPrice;
              break;
            }
          }
          if (!imageUrl && product && product.image) {
            const img = Array.isArray(product.image) ? product.image[0] : product.image;
            if (typeof img === 'string') imageUrl = img;
            else if (img && img.url) imageUrl = img.url;
          }
        } catch {
          // JSON-LD mal formatado, continuar
        }
      }
    }

    // Se ainda não encontrou preço, buscar por seletores comuns do Mercado Livre, Shopee, Amazon
    if (!price) {
      const mlPriceMatch = html.match(/class=["'][^"']*(?:andes-money-amount__fraction|ui-pdp-price__second-line)[^"']*["'][^>]*>([\d.]+)/i);
      if (mlPriceMatch && mlPriceMatch[1]) {
        const raw = mlPriceMatch[1].replace(/\./g, '');
        const parsed = parseFloat(raw);
        if (!isNaN(parsed) && parsed > 0) {
          price = parsed;
        }
      }
    }

    if (!price) {
      const brlMatch = html.match(/R\$\s*([\d.]+,\d{2})/i);
      if (brlMatch && brlMatch[1]) {
        const raw = brlMatch[1].replace(/\./g, '').replace(',', '.');
        const parsed = parseFloat(raw);
        if (!isNaN(parsed) && parsed > 0) {
          price = parsed;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        title: title || undefined,
        imageUrl: imageUrl || undefined,
        price: price || undefined,
        siteName: parsedUrl.hostname.replace(/^www\./, ''),
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.name === 'AbortError' ? 'A loja demorou muito para responder.' : error.message,
    });
  }
}
