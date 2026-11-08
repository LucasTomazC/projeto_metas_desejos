'use client';

import React, { useState } from 'react';
import { X, Plus, ExternalLink, Trash2, CheckCircle2, Circle, Sparkles, Zap, ArrowLeft, ZoomIn } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Goal } from '@/types/database';
import { calculateGoalStats, formatCurrencyBRL } from '@/lib/calculations';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';
import { useToast } from '@/components/ToastContext';
import { AccelerationSimulator } from '@/components/AccelerationSimulator';
import { soundFX } from '@/lib/soundEffects';

interface GoalDetailsModalProps {
  goal: Goal;
  salary: number;
  isOpen: boolean;
  onClose: () => void;
  onToggleItemPurchased: (itemId: string, currentState: boolean) => void;
  onDeleteItem: (itemId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  onOpenAddItem: (goalId: string) => void;
  onOpenPiggyBank?: (goal: Goal) => void;
  onUpdateDeadline?: (goalId: string, newMonths: number) => void;
}

export function GoalDetailsModal({
  goal,
  salary,
  isOpen,
  onClose,
  onToggleItemPurchased,
  onDeleteItem,
  onDeleteGoal,
  onOpenAddItem,
  onOpenPiggyBank,
  onUpdateDeadline,
}: GoalDetailsModalProps) {
  useBodyScrollLock(isOpen);
  const { showToast, confirmDialog } = useToast();

  const [filter, setFilter] = useState<'todos' | 'alta' | 'media' | 'baixa' | 'comprados'>('todos');
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [isEditingDeadline, setIsEditingDeadline] = useState(false);
  const [tempDeadline, setTempDeadline] = useState(goal.deadline_months.toString());

  if (!isOpen) return null;

  const stats = calculateGoalStats(goal, salary);
  const items = goal.items || [];

  const filteredItems = items.filter((item) => {
    if (filter === 'todos') return true;
    if (filter === 'comprados') return item.is_purchased;
    if (filter === 'alta') return item.priority === 'alta' && !item.is_purchased;
    if (filter === 'media') return item.priority === 'media' && !item.is_purchased;
    if (filter === 'baixa') return item.priority === 'baixa' && !item.is_purchased;
    return true;
  });

  const handleToggle = (itemId: string, current: boolean, title: string) => {
    if (!current) {
      soundFX.playCelebration();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF6B4A', '#FBE08D', '#4EBA87', '#FFD8C7'],
        });
      } catch (e) {
        console.error('Confetti error', e);
      }
      showToast(`Parabéns! "${title}" conquistado!`, 'success', 'Conquista desbloqueada! 🎉');
    } else {
      soundFX.playPop();
      showToast(`Item "${title}" marcado como pendente.`, 'info');
    }
    onToggleItemPurchased(itemId, current);
  };

  const handleSaveDeadline = () => {
    const parsed = parseInt(tempDeadline, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 36) {
      showToast('O prazo deve ser um número inteiro entre 1 e 36 meses.', 'warn');
      return;
    }
    if (onUpdateDeadline) {
      onUpdateDeadline(goal.id, parsed);
      showToast(`Prazo da meta atualizado para ${parsed} ${parsed === 1 ? 'mês' : 'meses'}!`, 'success');
    }
    setIsEditingDeadline(false);
  };

  const handleDeleteItemClick = (itemId: string, itemTitle: string) => {
    confirmDialog({
      title: 'Excluir item',
      message: `Tem certeza que deseja remover "${itemTitle}" desta meta?`,
      confirmText: 'Sim, excluir',
      onConfirm: () => {
        onDeleteItem(itemId);
        showToast('Item removido com sucesso.', 'info');
      },
    });
  };

  const handleDeleteGoalClick = () => {
    confirmDialog({
      title: 'Excluir meta completa',
      message: `Tem certeza que deseja apagar a meta "${goal.title}" e todos os seus itens?`,
      confirmText: 'Excluir Meta',
      onConfirm: () => {
        onDeleteGoal(goal.id);
        onClose();
        showToast('Meta excluída com sucesso.', 'info');
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4">
      <div className="bg-cream-50 w-full max-w-xl sm:max-w-2xl h-[95vh] sm:h-[90vh] rounded-t-4xl sm:rounded-4xl flex flex-col shadow-2xl border border-peach-200 overflow-hidden relative animate-in slide-in-from-bottom duration-300">
        
        {/* Header Fixo e Elegante */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-peach-100 via-white to-butter-100 border-b border-peach-200/80 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-coral-500 text-white flex items-center justify-center text-2xl shadow-button shrink-0">
              {goal.category_icon || '🎯'}
            </div>
            <div>
              <span className="text-[11px] font-bold text-coral-600 uppercase tracking-wider">
                Planejamento de Metas
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-cream-900 leading-tight">
                {goal.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-500 hover:text-cream-900 flex items-center justify-center border border-peach-200 transition-colors shadow-soft"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Unificado com Rolagem Fluida e Completa */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          
          {/* Card 1: Resumo Financeiro & Métricas */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-coral-200/70 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-3">
              <div>
                <span className="text-xs font-semibold text-gray-500 block">Esforço Mensal Recomendado:</span>
                <span className="text-2xl sm:text-3xl font-black text-coral-600 tracking-tight">
                  {formatCurrencyBRL(stats.monthlyQuota)}
                  <span className="text-xs font-bold text-gray-500"> / mês</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">Prazo:</span>
                {isEditingDeadline ? (
                  <div className="flex items-center gap-1.5 bg-cream-50 p-1 rounded-xl border border-coral-400 shadow-sm">
                    <input
                      type="number"
                      min={1}
                      max={36}
                      value={tempDeadline}
                      onChange={(e) => setTempDeadline(e.target.value)}
                      className="w-14 px-1.5 py-0.5 text-xs font-black text-center bg-white border border-peach-200 rounded-lg text-cream-900 focus:outline-none focus:ring-1 focus:ring-coral-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveDeadline();
                        if (e.key === 'Escape') setIsEditingDeadline(false);
                      }}
                    />
                    <span className="text-[10px] font-bold text-gray-500">meses</span>
                    <button
                      type="button"
                      onClick={handleSaveDeadline}
                      className="bg-coral-500 text-white p-1 rounded-lg hover:bg-coral-600 transition-colors shadow-sm"
                      title="Salvar novo prazo"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingDeadline(false)}
                      className="text-gray-400 hover:text-gray-600 p-0.5"
                      title="Cancelar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setTempDeadline(goal.deadline_months.toString());
                      setIsEditingDeadline(true);
                    }}
                    className="group flex items-center gap-1.5 bg-peach-100/70 hover:bg-peach-200/80 px-2.5 py-1 rounded-xl border border-peach-200 transition-all active:scale-95"
                    title="Clique para alterar o prazo desta meta (1 a 36 meses)"
                  >
                    <span className="text-xs font-extrabold text-cream-900">
                      {goal.deadline_months} {goal.deadline_months === 1 ? 'mês' : 'meses'}
                    </span>
                    <span className="text-[10px] font-bold text-coral-600 underline group-hover:text-coral-700">
                      alterar
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Comparativo de 4 Valores */}
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-cream-200 text-center">
              <div className="bg-cream-50 p-2 rounded-2xl border border-cream-200/60">
                <span className="text-[10px] text-gray-400 block font-semibold">Total</span>
                <span className="text-xs sm:text-sm font-extrabold text-cream-900">{formatCurrencyBRL(stats.totalCost)}</span>
              </div>
              <div className="bg-mint-50/60 p-2 rounded-2xl border border-mint-200/60">
                <span className="text-[10px] text-mint-700 block font-semibold">Comprado</span>
                <span className="text-xs sm:text-sm font-extrabold text-mint-700">{formatCurrencyBRL(stats.purchasedCost)}</span>
              </div>
              <div className="bg-amber-50/60 p-2 rounded-2xl border border-amber-200/60">
                <span className="text-[10px] text-amber-800 block font-semibold">Cofrinho</span>
                <span className="text-xs sm:text-sm font-extrabold text-amber-900">{formatCurrencyBRL(stats.savedAmount)}</span>
              </div>
              <div className="bg-coral-50/60 p-2 rounded-2xl border border-coral-200/60">
                <span className="text-[10px] text-coral-700 block font-semibold">A Poupar</span>
                <span className="text-xs sm:text-sm font-extrabold text-coral-700">{formatCurrencyBRL(stats.neededFromFutureSalary)}</span>
              </div>
            </div>

            {/* Barra de Progresso Geral */}
            <div className="mt-3.5">
              <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
                <span>Progresso global da meta ({stats.purchasedItemsCount} de {stats.totalItemsCount} comprados)</span>
                <span className="font-extrabold text-coral-600">{stats.progressPercentage}%</span>
              </div>
              <div className="w-full bg-cream-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-butter-300 via-coral-400 to-coral-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${stats.progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Cofrinho & Simulador de Aceleração */}
          <div className="bg-white rounded-3xl p-4 border border-peach-200 shadow-soft space-y-3">
            <div className="flex items-center gap-2">
              {onOpenPiggyBank && (
                <button
                  type="button"
                  onClick={() => onOpenPiggyBank(goal)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-butter-100 to-amber-100 hover:from-butter-200 hover:to-amber-200 border border-amber-200 text-amber-950 text-xs font-black flex items-center justify-between transition-all active:scale-95 shadow-soft"
                >
                  <span className="flex items-center gap-1.5 text-sm">
                    <span>🐷 Saldo no Cofrinho:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black">{formatCurrencyBRL(stats.savedAmount)}</span>
                    <span className="text-[10px] bg-amber-400 text-amber-950 px-2 py-0.5 rounded-lg font-black">+ Aportar</span>
                  </div>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowSimulator(!showSimulator)}
                className={`py-3 px-3.5 rounded-2xl border text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                  showSimulator
                    ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-sm'
                    : 'bg-cream-100 text-gray-700 hover:bg-cream-200 border-cream-200'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>Simulador</span>
              </button>
            </div>

            {/* Simulador Expansível */}
            {showSimulator && (
              <AccelerationSimulator
                currentMonthlyQuota={stats.monthlyQuota}
                currentDeadlineMonths={goal.deadline_months}
                remainingCost={stats.neededFromFutureSalary}
                salary={salary}
                onApplyNewDeadline={(newMonths) => {
                  if (onUpdateDeadline) {
                    onUpdateDeadline(goal.id, newMonths);
                    showToast(`Prazo da meta ajustado para ${newMonths} meses! 🚀`, 'success');
                  }
                }}
              />
            )}
          </div>

          {/* Seção 3: Lista de Produtos com Abas de Filtro */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-peach-200 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-cream-200">
              <div>
                <h3 className="text-base font-black text-cream-900 flex items-center gap-2">
                  <span>Lista de Desejos</span>
                  <span className="text-xs font-bold text-coral-600 bg-coral-100 px-2 py-0.5 rounded-full">
                    {items.length} {items.length === 1 ? 'item' : 'itens'}
                  </span>
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Marque como comprado conforme for conquistando</p>
              </div>

              <button
                onClick={() => onOpenAddItem(goal.id)}
                className="flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-coral-500 hover:bg-coral-600 px-4 py-2.5 rounded-2xl shadow-button transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" /> Adicionar Produto
              </button>
            </div>

            {/* Abas de Filtro de Prioridade */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar text-xs">
              {[
                { id: 'todos', label: `Todos (${items.length})` },
                { id: 'alta', label: '🔥 Essenciais' },
                { id: 'media', label: '⭐ Importantes' },
                { id: 'baixa', label: '🌸 Desejos' },
                { id: 'comprados', label: `✅ Comprados (${stats.purchasedItemsCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    filter === tab.id
                      ? 'bg-coral-500 text-white shadow-button'
                      : 'bg-cream-100 text-gray-600 hover:bg-cream-200/80 border border-cream-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Listagem de Itens Confortável */}
            <div className="space-y-3 pt-1">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center bg-cream-50 rounded-3xl border border-dashed border-peach-200 my-2">
                  <div className="w-12 h-12 rounded-2xl bg-peach-100 text-coral-500 mx-auto flex items-center justify-center mb-2">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-cream-900">Nenhum item nesta visualização</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                    {filter === 'comprados'
                      ? 'Você ainda não marcou nenhum item como comprado nesta meta.'
                      : 'Adicione novos produtos com foto e link para começar seu planejamento.'}
                  </p>
                  {filter === 'todos' && (
                    <button
                      onClick={() => onOpenAddItem(goal.id)}
                      className="mt-4 px-4 py-2.5 rounded-2xl bg-coral-500 text-white text-xs font-bold shadow-button hover:bg-coral-600 transition-all active:scale-95"
                    >
                      + Adicionar Produto à Lista
                    </button>
                  )}
                </div>
              ) : (
                filteredItems.map((item) => {
                  const priorityBadges = {
                    alta: { label: '🔥 Essencial', style: 'bg-coral-50 text-coral-600 border-coral-200' },
                    media: { label: '⭐ Importante', style: 'bg-butter-50 text-amber-700 border-butter-200' },
                    baixa: { label: '🌸 Desejo', style: 'bg-peach-50 text-peach-700 border-peach-200' },
                  }[item.priority || 'media'];

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all ${
                        item.is_purchased
                          ? 'bg-mint-50/50 border-mint-200 opacity-75'
                          : 'bg-cream-50/60 border-cream-200 hover:border-peach-300 shadow-soft'
                      }`}
                    >
                      {/* Checkbox de compra */}
                      <button
                        onClick={() => handleToggle(item.id, item.is_purchased, item.title)}
                        className="shrink-0 p-1 text-coral-500 hover:scale-110 active:scale-90 transition-transform"
                        title={item.is_purchased ? 'Desmarcar compra' : 'Marcar como comprado'}
                      >
                        {item.is_purchased ? (
                          <CheckCircle2 className="w-6 h-6 text-mint-600 fill-mint-100" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-300 hover:text-coral-400" />
                        )}
                      </button>

                      {/* Imagem do Item em tamanho generoso */}
                      <div
                        onClick={() => item.image_url && setPreviewImage({ url: item.image_url, title: item.title })}
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-cream-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-sm group ${
                          item.image_url ? 'cursor-zoom-in' : ''
                        }`}
                      >
                        {item.image_url ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <ZoomIn className="w-4 h-4" />
                            </div>
                          </>
                        ) : (
                          <span className="text-base font-bold text-gray-400">
                            {item.title.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Dados do Item */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className={`text-sm font-extrabold text-cream-900 leading-snug line-clamp-2 ${item.is_purchased ? 'line-through text-gray-400' : ''}`}>
                            {item.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-base font-black text-coral-600">
                            {formatCurrencyBRL(item.price)}
                          </span>

                          {!item.is_purchased && (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border ${priorityBadges.style}`}>
                              {priorityBadges.label}
                            </span>
                          )}

                          {item.product_url && (
                            <a
                              href={item.product_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-coral-500 bg-white px-2.5 py-1 rounded-xl border border-cream-200 shadow-sm transition-colors"
                            >
                              <ExternalLink className="w-3 h-3 text-coral-500" />
                              <span>Ver Loja</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Botão de Excluir */}
                      <button
                        onClick={() => handleDeleteItemClick(item.id, item.title)}
                        className="p-2.5 text-gray-300 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-colors shrink-0"
                        title="Excluir produto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Rodapé Fixo e Confortável */}
        <div className="p-4 bg-white border-t border-peach-200 flex items-center justify-between shrink-0 z-20">
          <button
            onClick={handleDeleteGoalClick}
            className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Excluir esta meta
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAddItem(goal.id)}
              className="px-4 py-2.5 rounded-2xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-extrabold shadow-button transition-all active:scale-95 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Adicionar Produto
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-cream-900 text-white text-xs font-bold hover:bg-cream-800 transition-all active:scale-95"
            >
              Concluir
            </button>
          </div>
        </div>

        {/* Modal de Zoom da Foto do Produto */}
        {previewImage && (
          <div
            onClick={() => setPreviewImage(null)}
            className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md p-4 flex flex-col items-center justify-center animate-in fade-in duration-200"
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2.5 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="max-w-full max-h-[75vh] rounded-2xl object-contain shadow-2xl"
            />
            <p className="text-white text-sm font-bold mt-3 text-center px-4">{previewImage.title}</p>
          </div>
        )}
      </div>
    </div>
  );
}
