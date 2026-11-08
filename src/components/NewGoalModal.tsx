'use client';

import React, { useState } from 'react';
import { X, Calendar, Palette, Sparkles } from 'lucide-react';
import { ColorTheme } from '@/types/database';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';
import { useToast } from '@/components/ToastContext';

interface NewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGoal: (data: {
    title: string;
    deadlineMonths: number;
    colorTheme: ColorTheme;
    categoryIcon: string;
  }) => void;
}

const icons = ['💇‍♀️', '💻', '💄', '👗', '✨', '✈️', '🏠', '📱', '🎧', '💍', '🚗', '🎓'];

const themes: { id: ColorTheme; label: string; bg: string; border: string }[] = [
  { id: 'coral', label: 'Coral Vibrante', bg: 'bg-coral-400', border: 'border-coral-500' },
  { id: 'peach', label: 'Pêssego Aveludado', bg: 'bg-peach-300', border: 'border-peach-400' },
  { id: 'butter', label: 'Amarelo Manteiga', bg: 'bg-butter-300', border: 'border-amber-400' },
  { id: 'mint', label: 'Menta Conquista', bg: 'bg-mint-400', border: 'border-mint-500' },
];

export function NewGoalModal({ isOpen, onClose, onCreateGoal }: NewGoalModalProps) {
  useBodyScrollLock(isOpen);
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [deadlineMonths, setDeadlineMonths] = useState<number>(6);
  const [colorTheme, setColorTheme] = useState<ColorTheme>('coral');
  const [categoryIcon, setCategoryIcon] = useState('💇‍♀️');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Por favor, informe um nome para a meta.', 'warn');
      return;
    }

    onCreateGoal({
      title: title.trim(),
      deadlineMonths: Number(deadlineMonths),
      colorTheme,
      categoryIcon,
    });

    showToast(`Meta "${title.trim()}" criada com sucesso! ✨`, 'success');

    setTitle('');
    setDeadlineMonths(6);
    setColorTheme('coral');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 overscroll-contain">
      <div className="bg-cream-50 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-4xl sm:rounded-4xl p-6 shadow-2xl border border-peach-200 animate-in slide-in-from-bottom duration-300 overscroll-contain">
        
        <div className="flex items-center justify-between pb-4 border-b border-peach-200/80">
          <div>
            <span className="text-[11px] font-bold text-coral-600 uppercase tracking-wider">Novo Planejamento</span>
            <h3 className="text-lg font-black text-cream-900 leading-tight">Criar Nova Meta</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-gray-400 hover:text-cream-900 flex items-center justify-center border border-peach-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Título da Meta */}
          <div>
            <label className="block text-xs font-bold text-cream-900 mb-1">
              Nome da Meta *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Reforma do Salão, Computador Novo..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-white border border-peach-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral-400 text-cream-900 shadow-soft"
              autoFocus
            />
          </div>

          {/* Escolha do Ícone */}
          <div>
            <label className="block text-xs font-bold text-cream-900 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-coral-500" />
              Escolha um Ícone de Destaque
            </label>
            <div className="grid grid-cols-6 gap-2">
              {icons.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setCategoryIcon(ic)}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-all ${
                    categoryIcon === ic
                      ? 'bg-coral-500 text-white scale-110 shadow-button ring-2 ring-coral-400 ring-offset-2'
                      : 'bg-white hover:bg-peach-100 text-gray-700 border border-cream-200'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Prazo em Meses (1 a 36 meses) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-cream-900 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-coral-500" />
                Tempo da Meta (1 a 36 meses)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={36}
                  value={deadlineMonths}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v)) setDeadlineMonths(Math.min(Math.max(v, 1), 36));
                  }}
                  className="w-14 px-2 py-0.5 text-xs font-black text-center bg-white border border-coral-300 rounded-lg text-coral-600 focus:outline-none focus:ring-1 focus:ring-coral-500"
                />
                <span className="text-xs font-extrabold text-coral-600">
                  {deadlineMonths === 1 ? 'mês' : 'meses'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1.5 mt-2">
              {[3, 6, 12, 18, 24].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setDeadlineMonths(m)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    deadlineMonths === m
                      ? 'bg-coral-500 text-white shadow-button'
                      : 'bg-white border border-peach-200 text-gray-600 hover:bg-peach-50'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Tema Pastel */}
          <div>
            <label className="block text-xs font-bold text-cream-900 mb-1.5 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-coral-500" />
              Tom Pastel do Card
            </label>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setColorTheme(t.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-2xl border transition-all ${
                    colorTheme === t.id
                      ? 'bg-white border-coral-500 shadow-soft ring-2 ring-coral-400/40'
                      : 'bg-white/60 border-cream-200 hover:bg-white'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${t.bg} border ${t.border}`} />
                  <span className="text-xs font-semibold text-cream-900">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className="pt-3 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-white border border-peach-200 text-xs font-bold text-gray-500 hover:bg-cream-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-coral-500 text-white text-xs font-bold shadow-button hover:bg-coral-600 active:scale-95 transition-all"
            >
              Criar Meta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
