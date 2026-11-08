'use client';

import React, { useState } from 'react';
import { X, Sparkles, TrendingUp, ArrowDownLeft, ArrowUpRight, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Goal } from '@/types/database';
import { calculateGoalStats, formatCurrencyBRL } from '@/lib/calculations';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';
import { useToast } from '@/components/ToastContext';

interface PiggyBankModalProps {
  goal: Goal;
  salary: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSavedAmount: (goalId: string, newTotalSaved: number) => void;
}

export function PiggyBankModal({
  goal,
  salary,
  isOpen,
  onClose,
  onUpdateSavedAmount,
}: PiggyBankModalProps) {
  useBodyScrollLock(isOpen);
  const { showToast } = useToast();

  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const stats = calculateGoalStats(goal, salary);
  const currentSaved = Number(goal.saved_amount) || 0;

  const handleAction = (customVal?: number) => {
    const val = customVal !== undefined ? customVal : parseFloat(amount.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      showToast('Informe um valor válido em reais.', 'warn');
      return;
    }

    if (mode === 'withdraw' && val > currentSaved) {
      showToast(`Você só tem ${formatCurrencyBRL(currentSaved)} guardados nesta meta.`, 'warn');
      return;
    }

    const nextSaved = mode === 'deposit' ? currentSaved + val : Math.max(currentSaved - val, 0);

    onUpdateSavedAmount(goal.id, nextSaved);

    if (mode === 'deposit') {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#4EBA87', '#F5CE42', '#FF6B4A'],
        });
      } catch {}
      showToast(`Você guardou ${formatCurrencyBRL(val)} no cofrinho da meta "${goal.title}"! 🎉`, 'success', 'Cofrinho abastecido!');
    } else {
      showToast(`Retirado ${formatCurrencyBRL(val)} do cofrinho.`, 'info');
    }

    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 overscroll-contain">
      <div className="bg-cream-50 w-full max-w-sm rounded-t-4xl sm:rounded-4xl p-6 shadow-2xl border border-peach-200 animate-in slide-in-from-bottom duration-300 overscroll-contain">
        
        {/* Topo com Ícone de Porquinho e Título */}
        <div className="flex items-center justify-between pb-3 border-b border-peach-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-xl shadow-button">
              🐷
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Cofrinho da Meta</span>
              <h3 className="text-base font-black text-cream-900 leading-tight">{goal.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-gray-400 hover:text-cream-900 flex items-center justify-center border border-peach-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Saldo Atual Guardado */}
        <div className="my-4 p-4 rounded-3xl bg-gradient-to-br from-butter-100/90 to-peach-100/80 border border-butter-200 text-center shadow-soft">
          <span className="text-xs font-semibold text-gray-500 block mb-1">Saldo Total no Cofrinho</span>
          <span className="text-3xl font-black text-cream-900 tracking-tight block">
            {formatCurrencyBRL(currentSaved)}
          </span>

          {stats.affordableItems.length > 0 && (
            <div className="mt-3 bg-white/90 rounded-2xl p-2.5 border border-mint-200 text-left flex items-start gap-2 shadow-sm">
              <Sparkles className="w-4 h-4 text-mint-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-mint-800 leading-snug">
                Você já tem saldo suficiente para comprar: <strong>{stats.affordableItems[0].title}</strong>!
              </p>
            </div>
          )}
        </div>

        {/* Alternador: Depositar vs Retirar */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-cream-200/70 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => setMode('deposit')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'deposit'
                ? 'bg-white text-cream-900 shadow-sm'
                : 'text-gray-500 hover:text-cream-900'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-mint-600" />
            <span>Guardar Dinheiro</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('withdraw')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'withdraw'
                ? 'bg-white text-cream-900 shadow-sm'
                : 'text-gray-500 hover:text-cream-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
            <span>Retirar Saldo</span>
          </button>
        </div>

        {/* Atalhos Rápidos de Depósito */}
        {mode === 'deposit' && (
          <div className="mb-4">
            <span className="text-[11px] font-bold text-gray-500 block mb-2">Aportes Rápidos:</span>
            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 200].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleAction(v)}
                  className="py-2.5 px-2 rounded-2xl bg-white border border-peach-200 hover:border-coral-400 text-xs font-bold text-cream-900 shadow-soft active:scale-95 transition-all"
                >
                  + R$ {v}
                </button>
              ))}
            </div>

            {stats.monthlyQuota > 0 && (
              <button
                type="button"
                onClick={() => handleAction(stats.monthlyQuota)}
                className="w-full mt-2 py-2 px-3 rounded-2xl bg-mint-50 border border-mint-200 hover:bg-mint-100 text-xs font-bold text-mint-800 transition-colors flex items-center justify-between"
              >
                <span>Guardar parcela do mês:</span>
                <span className="font-extrabold">{formatCurrencyBRL(stats.monthlyQuota)}</span>
              </button>
            )}
          </div>
        )}

        {/* Campo de Valor Personalizado */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-cream-900 mb-1">
              {mode === 'deposit' ? 'Outro valor para guardar' : 'Valor a retirar'}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-xs font-extrabold text-coral-600">R$</span>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm font-bold bg-white border border-peach-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral-400 text-cream-900 shadow-soft"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleAction()}
            className={`w-full py-3 rounded-2xl text-white text-xs font-bold shadow-button active:scale-95 transition-all ${
              mode === 'deposit'
                ? 'bg-mint-600 hover:bg-mint-700'
                : 'bg-rose-500 hover:bg-rose-600'
            }`}
          >
            {mode === 'deposit' ? 'Confirmar Depósito no Cofrinho' : 'Confirmar Retirada'}
          </button>
        </div>
      </div>
    </div>
  );
}

