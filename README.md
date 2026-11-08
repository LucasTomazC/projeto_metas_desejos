# 🌸 Meus Sonhos & Metas — Planejador Financeiro Mobile-First

> Aplicativo web progressivo (PWA) e mobile-first projetado para transformar desejos materiais em metas financeiras tangíveis, visualmente estimulantes e matematicamente realizáveis.

---

## 🎨 Identidade Visual & Design System

Projetado exclusivamente para uso fluido em smartphones, com estética acolhedora, cores vivas e tons pastel delicados:
- **Base Acolhedora:** Off-White / Creme suave (`#FAF8F5`)
- **Coral Vibrante:** Cor de ação, dinamismo e calor (`#FF6B4A`)
- **Pêssego Aveludado:** Tons suaves para cartões e destaques (`#FFD8C7`)
- **Amarelo Manteiga Solar:** Destaque para cofrinhos e alertas amigáveis (`#FBE08D`)
- **Verde Menta:** Sucesso, compras concluídas e saldo positivo (`#4EBA87`)
- **Tipografia Escura:** Cinza ardósia (`#1E242B`) para alto contraste e legibilidade.

---

## ✨ Principais Funcionalidades

### 1. 🎯 Metas Independentes & Salário Dinâmico
- Cadastre metas separadas (ex: **META: SALÃO**, **META: COMPUTADOR**, **META: VIAGEM**), cada uma com seus próprios itens, prazos e tema pastel.
- **Painel de Salário**: Defina ou edite seu salário mensal (ex: `R$ 1.500,00`) e visualize em tempo real a parcela necessária (`R$ 450,00/mês`) e a porcentagem de comprometimento da sua renda.
- **Edição Livre de Prazos**: Ajuste o tempo de qualquer meta para qualquer valor entre **1 e 36 meses** a qualquer momento, recalculando os valores instantaneamente.

### 2. 🛍️ Lista de Desejos com Fotos, Links & Preços
- Adicione itens sonhados (ex: *"Penteadeira Camarim"*, *"Espelho LED"*, *"Cadeira Hidráulica"*).
- **Web Scraper Inteligente (`/api/scrape-product`)**: Cole o link do produto de lojas como Mercado Livre, Shopee, Amazon ou Shein e clique em **"✨ Preencher"** para extrair foto, título e preço automaticamente!
- **Upload de Fotos da Galeria**: Tire fotos ou escolha imagens do seu celular, salvas no Supabase Storage com zoom em tela cheia ao tocar.
- **Filtros por Prioridade**: Organize itens por 🔥 *Essencial*, ⭐ *Importante*, 🌸 *Desejo* ou ✅ *Comprados*.
- **Comemoração de Conquista**: Ao marcar um item como comprado, celebre com confetes e o app recalcula a parcela dos meses restantes aliviando seu bolso!

### 3. 🐷 Cofrinho Real de Aportes & Simulador de Aceleração
- **Cofrinho Acumulado**: Registre o dinheiro que você já guardou de verdade na sua conta ou caixinha, com atalhos de depósitos rápidos (`+ R$ 50`, `+ R$ 100`, `+ valor da parcela do mês`).
- **Alerta de Compra Imediata**: O app notifica quando o dinheiro no cofrinho já for suficiente para comprar um dos produtos desejados da lista!
- **⚡ Simulador de Aceleração**: Teste cenários (*"E se eu guardar R$ 50 a mais por mês?"*) e veja quantos meses antes você conquista o seu sonho.

### 4. 📲 PWA Instalável & Backup em JSON
- **Instale como App Nativo**: Adicione à tela de início no iPhone (Safari) ou Android (Chrome) para rodar em tela cheia sem barra de navegador.
- **Exportação & Restauração**: Baixe backups em formato JSON de todos os seus dados a qualquer momento e restaure com 1 clique em outro aparelho.

### 5. 🛡️ Segurança de Nível Bancário & Zero-Secrets
- **Row Level Security (RLS)** ativo no Supabase PostgreSQL: cada usuário só tem acesso aos seus próprios dados.
- **Proteção Anti-SSRF**: O web scraper bloqueia requisições a redes internas, localhost ou metadados de nuvem.
- **Cabeçalhos HTTP Defensivos**: Anti-Clickjacking (`X-Frame-Options: DENY`), Anti-Sniffing e ocultação de assinaturas de servidor.
- **Zero Segredos**: Nenhuma chave ou token sensível é exposto no código ou versionado no Git.

---

## 🛠️ Stack Tecnológica

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com paleta personalizada
- **Banco de Dados & Autenticação:** [Supabase](https://supabase.com/) (PostgreSQL com RLS + Supabase Storage)
- **Efeitos Sonoros:** Web Audio API nativa do navegador (ultra-leve, zero downloads de áudio)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Animações:** Canvas Confetti

---

## 🚀 Como Executar o Projeto

### 1. Clonar e Instalar Dependências
```bash
git clone <URL_DO_REPOSITORIO>
cd JennyferPlanejamento
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto com as chaves do seu projeto Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### 3. Executar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse **`http://localhost:3000`** no seu navegador.

### 4. Executar Auditoria de Segurança
Para verificar a integridade e proteção de segredos:
```bash
node scripts/audit-security-and-perf.js
```

### 5. Build de Produção
```bash
npm run build
npm start
```

