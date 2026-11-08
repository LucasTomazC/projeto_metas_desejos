'use client';

import React from 'react';
import { Calendar, ChevronRight, CheckCircle2, ShoppingBag, Sparkles } from 'lucide-react';
import { Goal } from '@/types/database';
import { calculateGoalStats, formatCurrencyBRL } from '@/lib/calculations';

interface GoalCardProps {
  goal: Goal;
  salary: number;
  onClick: () => void;
  onOpenPiggyBank?: (e: React.MouseEvent) => void;
}

const themeStyles = {
  coral: {
    bg: 'bg-gradient-to-br from-coral-50/90 via-white to-peach-50/70',
    border: 'border-coral-200/80',
    accentText: 'text-coral-600',
    badge: 'bg-coral-100 text-coral-700',
    progress: 'bg-gradient-to-r from-coral-400 to-coral-500',
    iconBg: 'bg-coral-500 text-white',
  },
  peach: {
    bg: 'bg-gradient-to-br from-peach-50 via-white to-peach-100/60',
    border: 'border-peach-200',
    accentText: 'text-peach-600',
    badge: 'bg-peach-100 text-peach-700',
    progress: 'bg-gradient-to-r from-peach-400 to-coral-400',
    iconBg: 'bg-peach-500 text-white',
  },
  butter: {
    bg: 'bg-gradient-to-br from-butter-50 via-white to-butter-100/70',
    border: 'border-butter-200',
    accentText: 'text-amber-600',
    badge: 'bg-butter-100 text-amber-800',
    progress: 'bg-gradient-to-r from-butter-300 to-amber-500',
    iconBg: 'bg-amber-500 text-white',
  },
  mint: {
    bg: 'bg-gradient-to-br from-mint-50 via-white to-mint-100/70',
    border: 'border-mint-200',
    accentText: 'text-mint-600',
    badge: 'bg-mint-100 text-mint-700',
    progress: 'bg-gradient-to-r from-mint-400 to-mint-500',
    iconBg: 'bg-mint-500 text-white',
  },
};

export function GoalCard({ goal, salary, onClick, onOpenPiggyBank }: GoalCardProps) {
  const stats = calculateGoalStats(goal, salary);
  const theme = themeStyles[goal.color_theme] || themeStyles.coral;
  const items = goal.items || [];

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-3xl p-5 border ${theme.border} ${theme.bg} shadow-soft hover:shadow-card transition-all duration-200 active:scale-[0.98] relative overflow-hidden`}
    >
      {/* Topo do Card: Ícone, Título e Prazo */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl ${theme.iconBg} flex items-center justify-center shadow-sm text-lg font-bold`}>
            {goal.category_icon || '✨'}
          </div>
          <div>
            <span className={`text-[11px] font-bold tracking-wider uppercase ${theme.accentText}`}>
              Meta Planejada
            </span>
            <h3 className="text-base font-extrabold text-cream-900 leading-tight">
              {goal.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-white/80 px-2.5 py-1 rounded-xl border border-cream-200 shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-coral-500" />
          <span>{goal.deadline_months} {goal.deadline_months === 1 ? 'mês' : 'meses'}</span>
        </div>
      </div>

      {/* Destaque Financeiro Principal */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-cream-200/60 my-3 shadow-sm">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs font-semibold text-gray-500">Guardar do salário:</span>
          <span className="text-[11px] font-medium text-gray-400">
            {stats.salaryImpactPercentage}% da renda
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-coral-600 tracking-tight">
              {formatCurrencyBRL(stats.monthlyQuota)}
            </span>
            <span className="text-xs font-semibold text-gray-500">/ mês</span>
          </div>

          <div className="text-right">
            <span className="text-xs text-gray-400 block">Total da meta</span>
            <span className="text-xs font-bold text-cream-900">{formatCurrencyBRL(stats.totalCost)}</span>
          </div>
        </div>

        {/* Badge do Cofrinho (Etapa 3) */}
        <div className="mt-3 pt-2.5 border-t border-cream-200/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-amber-800 font-bold">
            <span>🐷 No Cofrinho:</span>
            <span className="text-amber-900 font-black">{formatCurrencyBRL(stats.savedAmount)}</span>
          </div>

          {onOpenPiggyBank && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPiggyBank(e);
              }}
              className="text-[11px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-xl transition-colors active:scale-95"
            >
              + Guardar
            </button>
          )}
        </div>

        {stats.affordableItems.length > 0 && (
          <div className="mt-2 bg-mint-50 border border-mint-200 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-[11px] text-mint-800 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-mint-600 shrink-0" />
            <span>Você já tem saldo para comprar <strong>{stats.affordableItems[0].title}</strong>!</span>
          </div>
        )}
      </div>

      {/* Miniatura dos Itens da Meta */}
      {items.length > 0 ? (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="flex items-center gap-1 font-medium">
              <ShoppingBag className="w-3.5 h-3.5 text-coral-500" />
              {items.length} {items.length === 1 ? 'item' : 'itens'} na lista
            </span>
            <span>{stats.purchasedItemsCount} de {stats.totalItemsCount} comprados</span>
          </div>

          {/* Carrossel de fotos dos itens */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {items.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="relative shrink-0 w-12 h-12 rounded-xl bg-white border border-cream-200 overflow-hidden shadow-sm flex items-center justify-center"
                title={`${item.title} - ${formatCurrencyBRL(item.price)}`}
              >
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className={`w-full h-full object-cover ${item.is_purchased ? 'grayscale opacity-60' : ''}`}
                  />
                ) : (
                  <span className="text-xs font-bold text-gray-400">
                    {item.title.charAt(0).toUpperCase()}
                  </span>
                )}

                {item.is_purchased && (
                  <div className="absolute inset-0 bg-mint-500/20 backdrop-blur-[1px] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-mint-600 bg-white rounded-full" />
                  </div>
                )}
              </div>
            ))}

            {items.length > 5 && (
              <div className="w-12 h-12 rounded-xl bg-cream-200/80 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                +{items.length - 5}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white/60 border border-dashed border-peach-200 rounded-xl p-3 text-center my-2">
          <span className="text-xs text-gray-400">Nenhum item adicionado ainda. Toque para incluir itens com fotos e links!</span>
        </div>
      )}

      {/* Barra de Progresso da Meta */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] font-medium text-gray-500 mb-1.5">
          <span>Progresso global (compras + cofrinho)</span>
          <span className="font-bold text-cream-900">{stats.progressPercentage}%</span>
        </div>
        <div className="w-full bg-cream-200/70 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full ${theme.progress} rounded-full transition-all duration-300`}
            style={{ width: `${stats.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Botão Ver Detalhes */}
      <div className="mt-4 pt-3 border-t border-cream-200/80 flex items-center justify-between text-xs font-bold text-coral-600">
        <span>Ver itens, cofrinho & simulador</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
