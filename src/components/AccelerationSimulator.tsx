'use client';

import React, { useState } from 'react';
import { Zap, Clock, TrendingUp, Sparkles, Check } from 'lucide-react';
import { formatCurrencyBRL } from '@/lib/calculations';

interface AccelerationSimulatorProps {
  currentMonthlyQuota: number;
  currentDeadlineMonths: number;
  remainingCost: number;
  salary: number;
  onApplyNewDeadline?: (newMonths: number) => void;
}

export function AccelerationSimulator({
  currentMonthlyQuota,
  currentDeadlineMonths,
  remainingCost,
  salary,
  onApplyNewDeadline,
}: AccelerationSimulatorProps) {
  const [extraMonthly, setExtraMonthly] = useState<number>(50);

  if (remainingCost <= 0) return null;

  const simulatedMonthly = currentMonthlyQuota + extraMonthly;
  const simulatedMonths = Math.max(Math.ceil(remainingCost / simulatedMonthly), 1);
  const monthsSaved = Math.max(currentDeadlineMonths - simulatedMonths, 0);

  const newSalaryImpact = Number(((simulatedMonthly / (salary || 1)) * 100).toFixed(1));

  return (
    <div className="bg-gradient-to-br from-butter-50 via-white to-peach-50 rounded-2xl p-4 border border-butter-200 shadow-sm mt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
          <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>Simulador de Aceleração</span>
        </div>
        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
          E se eu guardar mais?
        </span>
      </div>

      <p className="text-[11px] text-gray-500 leading-snug mb-3">
        Descubra como pequenos aportes extras antecipam a conquista dos seus itens.
      </p>

      {/* Seletor de valor extra */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {[20, 50, 100, 150].map((extra) => (
          <button
            key={extra}
            type="button"
            onClick={() => setExtraMonthly(extra)}
            className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
              extraMonthly === extra
                ? 'bg-amber-400 border-amber-500 text-amber-950 shadow-sm scale-105'
                : 'bg-white border-butter-200 text-gray-600 hover:bg-butter-50'
            }`}
          >
            + R$ {extra}
          </button>
        ))}
      </div>

      {/* Resultado da Simulação */}
      <div className="bg-white/90 rounded-xl p-3 border border-amber-200/60 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-gray-400 block font-semibold">Guardando {formatCurrencyBRL(simulatedMonthly)}/mês:</span>
          <span className="text-sm font-black text-amber-900 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Meta em {simulatedMonths} {simulatedMonths === 1 ? 'mês' : 'meses'}
          </span>
          <span className="text-[10px] text-gray-400 block mt-0.5">({newSalaryImpact}% do seu salário)</span>
        </div>

        {monthsSaved > 0 ? (
          <div className="text-right">
            <span className="text-xs font-black text-mint-600 bg-mint-50 border border-mint-200 px-2.5 py-1 rounded-xl inline-block shadow-sm">
              🚀 {monthsSaved} {monthsSaved === 1 ? 'mês' : 'meses'} antes!
            </span>
            {onApplyNewDeadline && (
              <button
                type="button"
                onClick={() => onApplyNewDeadline(simulatedMonths)}
                className="block text-[10px] font-bold text-coral-600 hover:text-coral-700 underline mt-1.5"
              >
                Adotar este prazo
              </button>
            )}
          </div>
        ) : (
          <span className="text-[11px] font-semibold text-gray-400">Prazo mantido</span>
        )}
      </div>
    </div>
  );
}

