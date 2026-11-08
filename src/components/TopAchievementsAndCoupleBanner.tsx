'use client';

import React, { useEffect, useState } from 'react';
import { Award, Heart, Sparkles, ChevronRight, Lock } from 'lucide-react';
import { Goal, Badge } from '@/types/database';
import { calculateBadges } from '@/lib/badges';
import { useToast } from '@/components/ToastContext';
import { soundFX } from '@/lib/soundEffects';
import confetti from 'canvas-confetti';

interface TopAchievementsAndCoupleBannerProps {
  goals: Goal[];
  user: any;
  onOpenBadges: () => void;
  onOpenCoupleModal: () => void;
}

export function TopAchievementsAndCoupleBanner({
  goals,
  user,
  onOpenBadges,
  onOpenCoupleModal,
}: TopAchievementsAndCoupleBannerProps) {
  const { showToast } = useToast();
  const [partnerName, setPartnerName] = useState<string>('Jennyfer');
  const [coupleActive, setCoupleActive] = useState<boolean>(false);

  // Carregar dados de casal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('jennyfer_partner_name') || 'Jennyfer';
      const isLocalCouple = localStorage.getItem('jennyfer_couple_mode_enabled') === 'true';
      setPartnerName(name);

      const hasSharedGoals = goals.some(g => (g.shares && g.shares.length > 0) || g.is_shared);
      setCoupleActive(isLocalCouple || hasSharedGoals);
    }
  }, [goals]);

  // Calcular badges
  const badges = calculateBadges(goals, coupleActive);
  const unlockedBadges = badges.filter(b => b.unlocked);
  const totalBadges = badges.length;
  const progressPercent = Math.round((unlockedBadges.length / totalBadges) * 100);

  // Detecção de nova conquista recém-desbloqueada
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const rawSeen = localStorage.getItem('jennyfer_seen_badges');
      const seenIds: string[] = rawSeen ? JSON.parse(rawSeen) : [];

      // Identifica quais badges desbloqueadas ainda não foram vistas
      const newUnlocks = unlockedBadges.filter(b => !seenIds.includes(b.id));

      if (newUnlocks.length > 0) {
        // Pega a mais recente
        const newest = newUnlocks[0];
        
        // Dispara efeito sonoro e confetes
        soundFX.playFanfare();
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.25 }
        });

        showToast(`🏆 Conquista Desbloqueada: ${newest.title}!`, 'success');

        // Atualiza a lista de vistos
        const updatedSeen = Array.from(new Set([...seenIds, ...newUnlocks.map(b => b.id)]));
        localStorage.setItem('jennyfer_seen_badges', JSON.stringify(updatedSeen));
      }
    } catch (err) {
      console.error('Erro ao verificar novas badges:', err);
    }
  }, [unlockedBadges.length]);

  const sharedGoalsCount = goals.filter(g => (g.shares && g.shares.length > 0) || g.is_shared).length;

  return (
    <div className="w-full mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* Card 1: Conquistas & Gamificação */}
        <div
          onClick={onOpenBadges}
          className="group relative bg-gradient-to-br from-white via-peach-50/50 to-amber-50/40 border border-peach-200/80 rounded-2xl p-3.5 shadow-sm hover:shadow-md hover:border-coral-300 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Ícone com indicador de nível */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-peach-300 text-white flex items-center justify-center text-xl shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              🏆
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-gray-800">
                  Conquistas
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  {unlockedBadges.length}/{totalBadges}
                </span>
              </div>

              {/* Mini barra de progresso */}
              <div className="w-28 bg-gray-200/80 rounded-full h-1.5 overflow-hidden my-1">
                <div
                  className="bg-gradient-to-r from-coral-400 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Prévia dos ícones das conquistas */}
              <div className="flex items-center gap-1 text-[11px]">
                {badges.slice(0, 4).map(b => (
                  <span
                    key={b.id}
                    className={`inline-block transition-transform ${b.unlocked ? 'opacity-100' : 'opacity-30 grayscale'}`}
                    title={b.title}
                  >
                    {b.icon}
                  </span>
                ))}
                <span className="text-[10px] font-semibold text-gray-400 ml-1">
                  Ver todas
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center text-gray-400 group-hover:text-coral-500 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Modo Casal / Metas a Dois */}
        <div
          onClick={onOpenCoupleModal}
          className="group relative bg-gradient-to-br from-white via-rose-50/40 to-peach-50/60 border border-peach-200/80 rounded-2xl p-3.5 shadow-sm hover:shadow-md hover:border-coral-300 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Ícone de Coração */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-coral-400 to-rose-300 text-white flex items-center justify-center text-xl shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              💕
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-gray-800">
                  Modo Casal
                </span>
                {coupleActive ? (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 fill-rose-500" /> Ativo
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    Conectar
                  </span>
                )}
              </div>

              <p className="text-[11px] font-semibold text-gray-500 truncate mt-0.5">
                {coupleActive
                  ? sharedGoalsCount > 0
                    ? `${sharedGoalsCount} ${sharedGoalsCount === 1 ? 'meta compartilhada' : 'metas compartilhadas'} a dois`
                    : `Planejando com ${partnerName} 💕`
                  : 'Compartilhe metas em tempo real'}
              </p>

              <span className="text-[10px] font-bold text-coral-600 group-hover:underline block mt-0.5">
                {coupleActive ? 'Gerenciar parceria' : 'Convidar parceiro(a)'}
              </span>
            </div>
          </div>

          <div className="flex items-center text-gray-400 group-hover:text-coral-500 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

      </div>
    </div>
  );
}

