'use client';

import React, { useState } from 'react';
import { X, Upload, Link as LinkIcon, Sparkles, RefreshCw, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';
import { useToast } from '@/components/ToastContext';

interface NewItemModalProps {
  isOpen: boolean;
  goalId: string;
  onClose: () => void;
  onAddItem: (itemData: {
    goalId: string;
    title: string;
    price: number;
    productUrl?: string;
    imageUrl?: string;
    priority: 'alta' | 'media' | 'baixa';
  }) => void;
}

export function NewItemModal({
  isOpen,
  goalId,
  onClose,
  onAddItem,
}: NewItemModalProps) {
  useBodyScrollLock(isOpen);
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [priority, setPriority] = useState<'alta' | 'media' | 'baixa'>('media');
  const [isScraping, setIsScraping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [scrapeFeedback, setScrapeFeedback] = useState<{ type: 'success' | 'warn'; message: string } | null>(null);

  if (!isOpen) return null;

  // Extração inteligente de link via API
  const handleScrapeProduct = async () => {
    if (!productUrl.trim()) {
      showToast('Cole o link de uma loja antes de extrair.', 'warn');
      return;
    }

    setIsScraping(true);
    setScrapeFeedback(null);

    try {
      const res = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: productUrl.trim() }),
      });

      const data = await res.json();

      if (data.success && data.data) {
        let extractedCount = 0;
        if (data.data.title && !title) {
          setTitle(data.data.title);
          extractedCount++;
        }
        if (data.data.imageUrl) {
          setImageUrl(data.data.imageUrl);
          setImagePreview(data.data.imageUrl);
          extractedCount++;
        }
        if (data.data.price && !price) {
          setPrice(data.data.price.toString());
          extractedCount++;
        }

        if (extractedCount > 0) {
          showToast(`Dados extraídos de ${data.data.siteName || 'loja'}!`, 'success');
          setScrapeFeedback({
            type: 'success',
            message: `Dados preenchidos automaticamente de ${data.data.siteName || 'loja'}!`,
          });
        } else {
          showToast('A loja protege os dados de pré-visualização.', 'warn');
          setScrapeFeedback({
            type: 'warn',
            message: 'A loja protege os dados de pré-visualização. Preencha os campos abaixo manualmente.',
          });
        }
      } else {
        showToast(data.error || 'Não foi possível extrair dados automáticos.', 'warn');
        setScrapeFeedback({
          type: 'warn',
          message: data.error || 'Não foi possível extrair dados automáticos desta loja.',
        });
      }
    } catch {
      showToast('Falha na conexão com a loja.', 'error');
    } finally {
      setIsScraping(false);
    }
  };

  // Upload de Imagem para o Supabase Storage
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `items/${fileName}`;

      const { data, error } = await supabase.storage
        .from('goal-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (error) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
        showToast('Foto salva localmente na lista.', 'info');
      } else if (data) {
        const { data: publicUrlData } = supabase.storage
          .from('goal-images')
          .getPublicUrl(data.path);

        setImageUrl(publicUrlData.publicUrl);
        showToast('Foto enviada para a nuvem com sucesso!', 'success');
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;

    const parsedPrice = parseFloat(price.replace(',', '.'));
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showToast('Por favor, informe um valor válido em reais (ex: 650,00).', 'warn', 'Valor inválido');
      return;
    }

    onAddItem({
      goalId,
      title: title.trim(),
      price: parsedPrice,
      productUrl: productUrl.trim() || undefined,
      imageUrl: imageUrl.trim() || imagePreview || undefined,
      priority,
    });

    showToast(`"${title}" adicionado à sua meta!`, 'success');

    // Limpar campos
    setTitle('');
    setPrice('');
    setProductUrl('');
    setImageUrl('');
    setImagePreview(null);
    setScrapeFeedback(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4">
      <div className="bg-cream-50 w-full max-w-lg sm:max-w-xl max-h-[92vh] flex flex-col rounded-t-4xl sm:rounded-4xl shadow-2xl border border-peach-200 animate-in slide-in-from-bottom duration-300 overflow-hidden">
        
        {/* Header Fixo */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-peach-100 via-white to-butter-100 border-b border-peach-200/80 flex items-center justify-between shrink-0 z-10">
          <div>
            <span className="text-[11px] font-bold text-coral-600 uppercase tracking-wider">Novo Desejo</span>
            <h3 className="text-lg font-black text-cream-900 leading-tight">Adicionar Produto à Meta</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-500 hover:text-cream-900 flex items-center justify-center border border-peach-200 transition-colors shadow-soft"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário com Scroll Suave */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Link do Produto & Botão Mágico de Extração */}
          <div className="bg-gradient-to-r from-peach-100/70 to-butter-100/70 p-4 rounded-3xl border border-peach-200 shadow-soft">
            <label className="block text-xs font-black text-cream-900 mb-1 flex items-center gap-1.5">
              <LinkIcon className="w-4 h-4 text-coral-500" />
              Link do Produto (Shopee, Mercado Livre, Amazon...)
            </label>
            <div className="flex gap-2 mt-2">
              <input
                type="url"
                placeholder="Cole o link da loja aqui..."
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs bg-white border border-peach-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral-400 text-cream-900 shadow-sm"
              />
              <button
                type="button"
                onClick={handleScrapeProduct}
                disabled={isScraping || !productUrl.trim()}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-coral-500 hover:bg-coral-600 text-white text-xs font-black rounded-xl shadow-button disabled:opacity-50 transition-all shrink-0"
              >
                {isScraping ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-butter-200" />
                )}
                <span>{isScraping ? 'Buscando...' : 'Preencher'}</span>
              </button>
            </div>

            {scrapeFeedback && (
              <div
                className={`mt-2.5 p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  scrapeFeedback.type === 'success'
                    ? 'bg-mint-50 text-mint-800 border border-mint-200'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                {scrapeFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-mint-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                )}
                <span>{scrapeFeedback.message}</span>
              </div>
            )}
          </div>

          {/* Título do Produto */}
          <div>
            <label className="block text-xs font-black text-cream-900 mb-1.5">
              Nome do Produto / Item *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Penteadeira Camarim Suspensa com Led"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-white border border-peach-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral-400 text-cream-900 shadow-soft"
            />
          </div>

          {/* Preço */}
          <div>
            <label className="block text-xs font-black text-cream-900 mb-1.5">
              Preço Estimado (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-sm font-black text-coral-600">R$</span>
              <input
                type="number"
                step="0.01"
                required
                placeholder="650,00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-sm font-black bg-white border border-peach-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral-400 text-cream-900 shadow-soft"
              />
            </div>
          </div>

          {/* Prioridade do Item */}
          <div>
            <label className="block text-xs font-black text-cream-900 mb-1.5">
              Prioridade deste Item
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'alta', label: '🔥 Essencial', color: 'border-coral-400 text-coral-600' },
                { id: 'media', label: '⭐ Importante', color: 'border-butter-400 text-amber-700' },
                { id: 'baixa', label: '🌸 Desejo', color: 'border-peach-300 text-peach-700' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPriority(p.id as any)}
                  className={`py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                    priority === p.id
                      ? `bg-white shadow-soft ring-2 ring-coral-400 ${p.color}`
                      : 'bg-white/60 border-cream-200 text-gray-500 hover:bg-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Foto do Produto */}
          <div>
            <label className="block text-xs font-black text-cream-900 mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-coral-500" />
              Foto do Produto
            </label>

            {imagePreview ? (
              <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-peach-200 bg-white mb-2 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Prévia" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageUrl('');
                  }}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition-colors shadow-sm"
                  title="Remover foto"
                >
                  <X className="w-4 h-4" />
                </button>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-coral-400" />
                    <span>Salvando imagem no Supabase...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="Ou cole a URL direta de uma imagem da internet..."
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value || null);
                  }}
                  className="w-full px-4 py-2.5 text-xs bg-white border border-peach-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral-400 text-cream-900 shadow-soft"
                />

                <label className="cursor-pointer flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl border border-dashed border-coral-300 bg-coral-50/60 hover:bg-coral-100/60 text-coral-700 text-xs font-bold transition-colors shadow-sm">
                  <Upload className="w-4 h-4" />
                  <span>Escolher foto da galeria do celular</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </form>

        {/* Rodapé Fixo com Botões Grandes */}
        <div className="p-4 bg-white border-t border-peach-200 flex gap-2 shrink-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl bg-cream-100 hover:bg-cream-200 border border-peach-200 text-xs font-bold text-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isUploading}
            className="flex-1 py-3.5 rounded-2xl bg-coral-500 text-white text-xs font-black shadow-button hover:bg-coral-600 active:scale-95 transition-all disabled:opacity-50"
          >
            Salvar Item na Meta
          </button>
        </div>
      </div>
    </div>
  );
}
