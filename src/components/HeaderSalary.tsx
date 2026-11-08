'use client';

import React, { useState } from 'react';
import { Wallet, Sparkles, User, AlertCircle, CheckCircle2, TrendingUp, LogOut, ChevronDown, ChevronUp, PieChart, Smartphone } from 'lucide-react';
import { Goal } from '@/types/database';
import { calculateGoalStats, formatCurrencyBRL } from '@/lib/calculations';
import { useToast } from '@/components/ToastContext';

interface HeaderSalaryProps {
  salary: number;
  onUpdateSalary: (newSalary: number) => void;
  totalMonthlyNeeded: number;
  totalSalaryImpact: number;
  totalSavedAmount: number;
  isOverBudget: boolean;
  goals: Goal[];
  userEmail?: string | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenSettings?: () => void;
}

const colorClassMap = {
  coral: 'bg-coral-500',
  peach: 'bg-peach-400',
  butter: 'bg-amber-400',
  mint: 'bg-mint-500',
};

export function HeaderSalary({
  salary,
  onUpdateSalary,
  totalMonthlyNeeded,
  totalSalaryImpact,
  totalSavedAmount,
  isOverBudget,
  goals,
  userEmail,
  onOpenAuth,
  onSignOut,
  onOpenSettings,
}: HeaderSalaryProps) {
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [tempSalary, setTempSalary] = useState(salary.toString());
  const [showMultiGoalBreakdown, setShowMultiGoalBreakdown] = useState(false);

  const handleSave = () => {
    const parsed = parseFloat(tempSalary.replace(',', '.'));
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateSalary(parsed);
      showToast(`Salário base atualizado para ${formatCurrencyBRL(parsed)}!`, 'success');
    } else {
      showToast('Por favor, informe um valor de salário válido.', 'warn');
    }
    setIsEditing(false);
  };

  const freeSalary = Math.max(salary - totalMonthlyNeeded, 0);

  return (
    <header className="w-full bg-gradient-to-b from-peach-100/80 to-cream-100 px-4 pt-5 pb-6 border-b border-peach-200/60">
      <div className="max-w-md mx-auto">
        {/* Top bar com saudação e usuário */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-coral-500 text-white flex items-center justify-center shadow-button">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-semibold text-coral-600 tracking-wider uppercase">Meus Desejos & Metas</span>
              <h1 className="text-lg font-black text-cream-900 leading-tight">Olá, Jennyfer! ✨</h1>
            </div>
          </div>

          {/* Ações do Topo: Ajustes/PWA e Login */}
          <div className="flex items-center gap-1.5">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                title="Instalar App e Backup"
                className="w-9 h-9 rounded-2xl bg-white/90 hover:bg-white text-gray-500 hover:text-coral-500 flex items-center justify-center border border-peach-200 shadow-soft transition-all active:scale-95"
              >
                <Smartphone className="w-4 h-4 text-coral-500" />
              </button>
            )}

            {userEmail ? (
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-peach-200 px-2.5 py-1.5 rounded-2xl shadow-soft">
                <div className="w-2 h-2 rounded-full bg-mint-500 animate-ping" />
                <span className="text-xs font-medium text-cream-900 truncate max-w-[100px]">{userEmail.split('@')[0]}</span>
                <button
                  onClick={onSignOut}
                  title="Sair da conta"
                  className="text-gray-400 hover:text-coral-500 p-1 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-xs font-semibold text-cream-900 px-3 py-2 rounded-2xl border border-peach-200 shadow-soft transition-all active:scale-95"
              >
                <User className="w-3.5 h-3.5 text-coral-500" />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>

        {/* Card Principal: Salário & Visão Orçamentária Multi-Metas */}
        <div className="bg-white rounded-3xl p-5 shadow-card border border-peach-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-butter-200/40 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-coral-100/50 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none" />

          <div className="relative z-10">
            {/* Bloco do Salário Editável */}
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-butter-100 flex items-center justify-center text-butter-500">
                  <Wallet className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-xs font-medium text-gray-500">Salário Base Mensal</span>
              </div>

              {isEditing ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-cream-900">R$</span>
                  <input
                    type="number"
                    value={tempSalary}
                    onChange={(e) => setTempSalary(e.target.value)}
                    className="w-24 px-2 py-1 text-sm font-bold bg-cream-50 border border-coral-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral-400 text-cream-900"
                    autoFocus
                  />
                  <button
                    onClick={handleSave}
                    className="bg-coral-500 text-white p-1 rounded-xl hover:bg-coral-600 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setTempSalary(salary.toString());
                    setIsEditing(true);
                  }}
                  className="group flex items-center gap-1 hover:opacity-80 transition-opacity"
                  title="Clique para editar seu salário"
                >
                  <span className="text-base font-extrabold text-cream-900">{formatCurrencyBRL(salary)}</span>
                  <span className="text-[10px] text-coral-500 font-medium underline group-hover:text-coral-600">alterar</span>
                </button>
              )}
            </div>

            {/* Bloco de Aporte Global das Metas */}
            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-gray-500 block">Guardar por mês (Total):</span>
                <span className="text-xl font-black text-coral-600 tracking-tight">
                  {formatCurrencyBRL(totalMonthlyNeeded)}
                  <span className="text-xs font-normal text-gray-400">/mês</span>
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-medium text-gray-500 block">Comprometimento</span>
                <span className={`text-base font-extrabold ${isOverBudget ? 'text-rose-600' : 'text-mint-600'}`}>
                  {totalSalaryImpact}% <span className="text-xs font-normal text-gray-400">da renda</span>
                </span>
              </div>
            </div>

            {/* Barra Segmentada Multi-Metas (Etapa 3) */}
            <div className="mt-3 w-full bg-cream-200/80 h-3 rounded-full overflow-hidden flex shadow-inner">
              {goals.map((g) => {
                const gStats = calculateGoalStats(g, salary);
                const widthPercent = Math.min(gStats.salaryImpactPercentage, 100);
                if (widthPercent <= 0) return null;
                const barColor = colorClassMap[g.color_theme] || 'bg-coral-500';

                return (
                  <div
                    key={g.id}
                    className={`h-full ${barColor} transition-all duration-500 relative group`}
                    style={{ width: `${widthPercent}%` }}
                    title={`${g.title}: ${formatCurrencyBRL(gStats.monthlyQuota)}/mês (${widthPercent}%)`}
                  />
                );
              })}
            </div>

            {/* Indicador de Cofrinho Acumulado Total */}
            {totalSavedAmount > 0 && (
              <div className="mt-2.5 flex items-center justify-between bg-amber-50/80 border border-amber-200/70 px-3 py-1.5 rounded-xl text-xs">
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  <span>🐷 Saldo Total nos Cofrinhos:</span>
                </span>
                <span className="font-black text-amber-950">{formatCurrencyBRL(totalSavedAmount)}</span>
              </div>
            )}

            {/* Alerta inteligente caso ultrapasse */}
            {isOverBudget ? (
              <div className="mt-3 flex items-start gap-1.5 bg-rose-50 border border-rose-200 p-2.5 rounded-2xl text-[11px] text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>
                  O total mensal (<strong>{formatCurrencyBRL(totalMonthlyNeeded)}</strong>) ultrapassa seu salário.
                  Use o simulador de aceleração para ajustar os prazos.
                </span>
              </div>
            ) : totalMonthlyNeeded > 0 ? (
              <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                <span className="flex items-center gap-1 text-mint-600 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" /> Orçamento saudável
                </span>
                <span>Sobra livre: <strong>{formatCurrencyBRL(freeSalary)}</strong></span>
              </div>
            ) : null}

            {/* Botão de Expansão: Comparativo Multi-Metas */}
            {goals.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setShowMultiGoalBreakdown(!showMultiGoalBreakdown)}
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-500 hover:text-coral-600 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <PieChart className="w-3.5 h-3.5 text-coral-500" />
                    Comparativo entre Metas ({goals.length})
                  </span>
                  {showMultiGoalBreakdown ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showMultiGoalBreakdown && (
                  <div className="mt-2.5 space-y-1.5 pt-1 animate-in fade-in duration-200">
                    {goals.map((g) => {
                      const gStats = calculateGoalStats(g, salary);
                      const dotColor = colorClassMap[g.color_theme] || 'bg-coral-500';

                      return (
                        <div
                          key={g.id}
                          className="flex items-center justify-between text-[11px] bg-cream-50 p-2 rounded-xl border border-cream-200/70"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
                            <span className="font-bold text-cream-900 truncate">{g.title}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-black text-coral-600">{formatCurrencyBRL(gStats.monthlyQuota)}</span>
                            <span className="text-[10px] text-gray-400 ml-1">({gStats.salaryImpactPercentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
