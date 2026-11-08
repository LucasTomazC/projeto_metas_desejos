# Plano de Desenvolvimento: Aplicativo de Gestão de Metas & Economia Mobile-First

> **Projeto:** Web-App Mobile-First de Gestão de Metas, Poupança e Lista de Desejos  
> **Status:** Planejamento Aprovado - Validação de Edge Cases & Setup Supabase  
> **Stack Base:** Next.js (App Router), React, Tailwind CSS, Lucide React, Framer Motion, Supabase (Auth + PostgreSQL + Storage)  

---

## 🎯 Decisões de Arquitetura Alinhadas
1. **Autenticação & Banco de Dados:** Nuvem com Supabase (PostgreSQL com RLS - Row Level Security, garantindo que cada usuário só veja suas próprias metas).
2. **Identidade Visual Pastel Calorosa:** Coral vibrante suave (`#FF7A59`), Pêssego aveludado (`#FFD8C7`), Amarelo Manteiga solar (`#FBE08D`) e base Off-White acolhedora (`#FAF8F5`). Sem clichês de roxo ou azul corporativo.
3. **Cálculo Financeiro Transparente:** Valor real em Reais em destaque absoluto (ex: **"Guardar R$ 450,00/mês do seu salário"**), com barra de impacto salarial e total restante.
4. **Mobile-First Real:** Projetado nativamente para telas de celular, com botões de polegar, bottom sheets e cartões táteis.

---

## 🗄️ Esquema de Dados Supabase (SQL)

```sql
-- Perfil do Usuário
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  monthly_salary numeric(10, 2) default 0.00,
  full_name text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Metas
create table public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,               -- Ex: "Salão", "Computador Gamer"
  category_icon text default 'target',
  color_theme text default 'peach',   -- 'peach' | 'coral' | 'butter' | 'mint'
  deadline_months integer not null,  -- Ex: 6
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Itens da Meta
create table public.goal_items (
  id uuid default gen_random_uuid() primary key,
  goal_id uuid references public.goals(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,               -- Ex: "Penteadeira Camarim"
  price numeric(10, 2) not null,     -- Ex: 650.00
  product_url text,                  -- Link da loja (Amazon, Shopee, etc.)
  image_url text,                    -- Imagem no bucket ou URL externa
  is_purchased boolean default false,
  priority text default 'media',     -- 'alta' | 'media' | 'baixa'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Políticas RLS (Row Level Security ativado para proteção total)
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.goal_items enable row level security;
```

---

## 🧮 Motor de Cálculo Financeiro

- **Total da Meta ($T$):**
  $$T = \sum \text{preço de cada item não comprado}$$
- **Aporte Mensal Real ($A$):**
  $$A = \frac{T}{\text{prazo em meses}}$$
  *Exemplo:* 3 itens somando R$ 2.700 em 6 meses $\rightarrow$ **R$ 450,00 / mês**.
- **Impacto no Salário:**
  $$\% = \left(\frac{A}{\text{salário mensal}}\right) \times 100$$
  *Exemplo:* R$ 450 de R$ 1.500 $\rightarrow$ **30,0% do salário**.
- **Impacto Global (Multi-Metas):**
  Soma de todos os aportes mensais de todas as metas abertas vs. salário total.

---

## 🚀 Fases de Implementação

### 📍 ETAPA 1: Setup Supabase, Auth & Core MVP Mobile-First (CONCLUÍDA ✅)
- [x] Configuração e aplicação do schema PostgreSQL no Supabase (`profiles`, `goals`, `goal_items`, RLS e triggers).
- [x] Inicialização do projeto Next.js 14 com App Router, TypeScript e Tailwind CSS na paleta personalizada Coral/Pêssego/Manteiga.
- [x] Criação do cliente Supabase e suporte híbrido (Supabase Auth/DB + persistência LocalStorage).
- [x] Header com Salário Mensal interativo (R$ 1.500,00) e cálculo automático de comprometimento de renda.
- [x] Cards de Metas independentes com valor real a guardar por mês em destaque (ex: R$ 450,00/mês), barra de progresso e miniaturas de fotos.
- [x] Modal de Detalhes da Meta com listagem de produtos, links de lojas, fotos e checkbox de compra com confetes.
- [x] Regra de recálculo dinâmico (Opção A): marcar item como comprado alivia o valor da parcela mensal nos meses restantes.
- [x] Modal de Adição de Produtos com upload de foto da galeria ou URL.
- [x] Modal de Criação de Novas Metas com escolha de prazos, ícones e temas pastel.
- [x] Modal de Login e Cadastro integrado ao Supabase Auth.
- [x] Build de produção testado e validado com sucesso sem erros (`npm run build`).

### 📍 ETAPA 2: Inteligência de Links (Web Scraper) & Supabase Storage (CONCLUÍDA ✅)
- [x] Endpoint `/api/scrape-product` para preenchimento automático de foto, título e preço via link (OpenGraph, Twitter Cards, Schema.org JSON-LD e seletores BRL).
- [x] Input inteligente com botão mágico de preenchimento automático ao colar URL de lojas (Shopee, Mercado Livre, Amazon, etc.).
- [x] Criação do bucket público `goal-images` no Supabase Storage e upload direto de fotos da galeria do celular ou câmera (com fallback Base64).
- [x] Sistema de zoom em fotos de produtos ao tocar nas miniaturas.
- [x] Filtros interativos por prioridade na lista de itens da meta (🔥 Essenciais, ⭐ Importantes, 🌸 Desejos, ✅ Comprados).
- [x] Check-off de itens comprados com recálculo automático da parcela restante (Opção A: alívio na parcela mensal) e comemoração de confetes.

### 📍 ETAPA 3: Visão Orçamentária Multi-Metas & Cofrinho (CONCLUÍDA ✅)
- [x] Adicionada coluna `saved_amount` na tabela `goals` do Supabase via DDL API.
- [x] Componente `PiggyBankModal` (Cofrinho real por meta com atalhos de depósitos rápidos, retirada e confetes).
- [x] Componente `AccelerationSimulator` (Simulador "E se eu economizar mais?", demonstrando antecipação de prazo e opção de aplicar novo prazo à meta).
- [x] Barra orçamentária segmentada multi-metas no topo com cores individuais e indicador de saldo total acumulado em cofrinhos.
- [x] Lista sanfonada de Comparativo entre Metas (% de salário e valor mensal individual).
- [x] Notificação inteligente quando o saldo do cofrinho já é suficiente para comprar itens da lista de desejos.

### 📍 RECURSOS EXTRAS ADICIONADOS (CONCLUÍDO ✅)
- [x] Edição livre do prazo de qualquer meta criada com qualquer número entre 1 e 36 meses (com salvamento imediato no Supabase e LocalStorage).
- [x] Criação de novas metas com campo numérico livre (1 a 36 meses) e atalhos rápidos.
- [x] Efeitos sonoros táteis via Web Audio API (som de moeda no cofrinho e sino triunfante ao conquistar itens).

### 📍 ETAPA 4: Gamificação & Conquistas (Badges) + Modo Casal & Metas Compartilhadas (CONCLUÍDA ✅)
- [x] Tabela `public.goal_shares` e políticas RLS criadas no Supabase com permissões granulares para proprietário e parceiro(a).
- [x] Componente `TopAchievementsAndCoupleBanner` integrado no topo da tela inicial com progresso de selos e status do Modo Casal.
- [x] Sistema dinâmico de Conquistas (`src/lib/badges.ts` e `BadgesModal.tsx`): 8 selos fofos em tons pastel com detecção automática de conquistas inéditas, confetes e fanfarra triunfal.
- [x] Componente `CoupleShareModal.tsx`: convite de parceiro por e-mail em nuvem via Supabase e suporte offline/local com personalização afetiva.
- [x] Badges visuais `"💕 A Dois"` nos cards de metas (`GoalCard.tsx`) e botão de gerenciamento de parceria dentro de `GoalDetailsModal.tsx`.


