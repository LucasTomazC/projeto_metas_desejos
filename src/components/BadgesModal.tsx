'use client';

import React, { useState } from 'react';
import { X, Award, Sparkles, CheckCircle2, Lock, Flame } from 'lucide-react';
import { Badge } from '@/types/database';
import confetti from 'canvas-confetti';
import { soundFX } from '@/lib/soundEffects';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: Badge[];
}

export function BadgesModal({ isOpen, onClose, badges }: BadgesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  if (!isOpen) return null;

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const progressPercent = Math.round((unlockedCount / badges.length) * 100);

  const categories = [
    { id: 'todas', label: 'Todas' },
    { id: 'início', label: 'Início' },
    { id: 'economia', label: 'Economia' },
    { id: 'parceria', label: 'Casal 💕' },
    { id: 'conquista', label: 'Mestrado' },
  ];

  const filteredBadges = selectedCategory === 'todas'
    ? badges
    : badges.filter(b => b.category === selectedCategory);

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    if (badge.unlocked) {
      soundFX.playPop();
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-peach-100 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com visual acolhedor */}
        <div className="px-5 py-4 bg-gradient-to-r from-peach-100 via-butter-100 to-mint-100 border-b border-peach-200/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">
              🏆
            </div>
            <div>
              <h2 className="text-base font-black text-gray-800 flex items-center gap-1.5">
                Suas Conquistas
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              </h2>
              <p className="text-[11px] font-semibold text-gray-500">
                {unlockedCount} de {badges.length} selos desbloqueados ({progressPercent}%)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-800 flex items-center justify-center transition-all shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de Progresso Geral */}
        <div className="px-5 pt-3 pb-2 bg-gradient-to-b from-peach-50/50 to-white shrink-0">
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-gray-200/60">
            <div 
              className="bg-gradient-to-r from-coral-400 via-amber-400 to-mint-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          
          {/* Filtros em Abas */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-coral-500 text-white shadow-sm scale-105'
                    : 'bg-peach-50 text-gray-600 hover:bg-peach-100/70 border border-peach-200/40'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Conquistas em Grid */}
        <div className="p-4 overflow-y-auto space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredBadges.map((badge) => {
              const isUnlocked = badge.unlocked;

              return (
                <div
                  key={badge.id}
                  onClick={() => handleBadgeClick(badge)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex items-center gap-3 ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-white to-peach-50/60 border-peach-200 hover:border-coral-300 hover:shadow-md'
                      : 'bg-gray-50/70 border-gray-200/80 opacity-70 hover:opacity-90'
                  }`}
                >
                  {/* Ícone com Badge */}
                  <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center text-2xl shadow-sm relative ${
                    isUnlocked 
                      ? 'bg-white border border-peach-200' 
                      : 'bg-gray-200 border border-gray-300 text-gray-400 grayscale'
                  }`}>
                    {badge.icon}
                    {isUnlocked ? (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-mint-500 text-white rounded-full flex items-center justify-center text-[10px] ring-2 ring-white">
                        ✓
                      </span>
                    ) : (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-400 text-white rounded-full flex items-center justify-center text-[9px] ring-2 ring-white">
                        <Lock className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className={`text-xs font-black truncate ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                        {badge.title}
                      </h4>
                    </div>
                    <p className="text-[10px] text-gray-500 line-clamp-2 leading-tight mt-0.5">
                      {badge.description}
                    </p>
                    <span className={`text-[9px] font-bold mt-1 inline-block px-1.5 py-0.5 rounded-md ${
                      isUnlocked 
                        ? 'text-mint-700 bg-mint-100/70' 
                        : 'text-gray-500 bg-gray-100'
                    }`}>
                      {isUnlocked ? 'Desbloqueado 🎉' : badge.progressText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rodapé informativo */}
        <div className="px-5 py-3 bg-peach-50/70 border-t border-peach-200/50 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-coral-500" />
            Continue guardando para desbloquear todas!
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-coral-700 bg-white border border-coral-200 rounded-xl hover:bg-coral-50 shadow-sm"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

