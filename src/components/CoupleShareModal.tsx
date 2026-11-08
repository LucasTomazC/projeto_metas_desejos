'use client';

import React, { useState } from 'react';
import { X, Heart, Mail, Users, Check, Trash2, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { Goal, GoalShare } from '@/types/database';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ToastContext';
import { soundFX } from '@/lib/soundEffects';
import confetti from 'canvas-confetti';

interface CoupleShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
  user: any;
  onRefreshData: () => void;
  onOpenAuth: () => void;
  initialGoalId?: string | null;
}

export function CoupleShareModal({
  isOpen,
  onClose,
  goals,
  user,
  onRefreshData,
  onOpenAuth,
  initialGoalId,
}: CoupleShareModalProps) {
  const { showToast } = useToast();
  const [selectedGoalId, setSelectedGoalId] = useState<string>(initialGoalId || goals[0]?.id || '');
  const [partnerEmail, setPartnerEmail] = useState<string>('');
  const [partnerNameLocal, setPartnerNameLocal] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jennyfer_partner_name') || 'Jennyfer';
    }
    return 'Jennyfer';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Se não houver metas criadas
  if (goals.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center border border-peach-200 shadow-xl">
          <Heart className="w-12 h-12 text-coral-400 mx-auto mb-3" />
          <h3 className="text-base font-black text-gray-800 mb-1">Crie sua primeira meta!</h3>
          <p className="text-xs text-gray-500 mb-4">
            Você precisa criar ao menos uma meta antes de ativar o Modo Casal.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-coral-500 text-white font-bold rounded-2xl text-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  const currentGoal = goals.find(g => g.id === selectedGoalId) || goals[0];

  // Adicionar parceiro(a) via Supabase
  const handleInviteSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerEmail.trim()) {
      showToast('Digite o e-mail do seu parceiro(a)', 'warn');
      return;
    }

    if (!user) {
      showToast('Faça login para compartilhar na nuvem!', 'info');
      onOpenAuth();
      return;
    }

    if (partnerEmail.toLowerCase() === user.email?.toLowerCase()) {
      showToast('Você não pode compartilhar uma meta com você mesmo!', 'warn');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('goal_shares')
        .insert({
          goal_id: currentGoal.id,
          owner_id: user.id,
          shared_with_email: partnerEmail.trim().toLowerCase(),
          status: 'accepted'
        });

      if (error) {
        if (error.code === '23505') {
          showToast('Esta meta já está compartilhada com esse e-mail!', 'info');
        } else {
          throw error;
        }
      } else {
        soundFX.playFanfare();
        confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
        showToast(`💕 Meta compartilhada com sucesso com ${partnerEmail}!`, 'success');
        setPartnerEmail('');
        onRefreshData();
      }
    } catch (err: any) {
      console.error('Erro ao compartilhar meta:', err);
      showToast('Não foi possível compartilhar a meta. Tente novamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remover compartilhamento
  const handleRemoveShare = async (shareId: string, email: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('goal_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;

      showToast(`Compartilhamento com ${email} removido.`, 'info');
      onRefreshData();
    } catch (err) {
      console.error('Erro ao remover compartilhamento:', err);
      showToast('Erro ao remover compartilhamento.', 'error');
    }
  };

  // Modo Local/Offline (Simulação do Modo Casal)
  const handleSaveLocalCoupleMode = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('jennyfer_partner_name', partnerNameLocal.trim() || 'Parceiro(a)');
      localStorage.setItem('jennyfer_couple_mode_enabled', 'true');
    }
    soundFX.playCelebration();
    confetti({ particleCount: 30, spread: 60 });
    showToast(`💕 Modo Casal ativado com ${partnerNameLocal}!`, 'success');
    onRefreshData();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-peach-100 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-coral-100 via-peach-100 to-rose-100 border-b border-coral-200/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl">
              💕
            </div>
            <div>
              <h2 className="text-base font-black text-gray-800 flex items-center gap-1.5">
                Modo Casal & Metas a Dois
                <Sparkles className="w-3.5 h-3.5 text-coral-500 fill-coral-400" />
              </h2>
              <p className="text-[11px] font-semibold text-gray-500">
                Compartilhe e conquistem sonhos juntos
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

        {/* Conteúdo com Scroll */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Seletor de Meta */}
          <div>
            <label className="block text-xs font-black text-gray-700 mb-1.5">
              Escolha a Meta para Compartilhar:
            </label>
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-bold text-gray-800 bg-peach-50/50 border border-peach-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral-400"
            >
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.category_icon} {goal.title}
                </option>
              ))}
            </select>
          </div>

          {/* Se estiver logado no Supabase */}
          {user ? (
            <div className="bg-gradient-to-br from-peach-50/80 to-coral-50/40 p-4 rounded-2xl border border-peach-200">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-coral-600" />
                <h4 className="text-xs font-black text-gray-800">
                  Convidar por E-mail (Sincronização em Nuvem)
                </h4>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
                Ao convidar seu parceiro(a), ele poderá acessar esta meta, adicionar itens e acompanhar o cofrinho em tempo real direto do celular dele!
              </p>

              <form onSubmit={handleInviteSupabase} className="flex gap-2">
                <input
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="ex: jennyfer@email.com"
                  className="flex-1 px-3 py-2 text-xs bg-white border border-peach-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral-400 text-gray-800"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  {isSubmitting ? 'Enviando...' : 'Convidar'}
                </button>
              </form>

              {/* Lista de pessoas compartilhadas nesta meta */}
              <div className="mt-4 pt-3 border-t border-peach-200/60">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-2">
                  Pessoas com acesso a esta meta:
                </span>
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-peach-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-mint-500" />
                      <span className="font-bold text-gray-700">{user.email} (Você - Dono)</span>
                    </div>
                    <span className="text-[10px] font-bold text-mint-600 bg-mint-50 px-2 py-0.5 rounded-md">
                      Criador
                    </span>
                  </div>

                  {currentGoal.shares && currentGoal.shares.length > 0 ? (
                    currentGoal.shares.map((share) => (
                      <div key={share.id} className="flex items-center justify-between p-2 bg-white rounded-xl border border-peach-100 text-xs">
                        <div className="flex items-center gap-2">
                          <Heart className="w-3.5 h-3.5 text-coral-500 fill-coral-400" />
                          <span className="font-bold text-gray-700">{share.shared_with_email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveShare(share.id, share.shared_with_email)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remover acesso"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-gray-400 italic py-1">
                      Nenhum parceiro convidado para esta meta ainda.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Se for modo Visitante/Offline */
            <div className="space-y-3">
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200/70 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-900 leading-snug">
                  <strong className="block mb-0.5">Sincronização em Tempo Real na Nuvem</strong>
                  Para sincronizar instantaneamente entre dois celulares diferentes, faça login gratuito com o Supabase.
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="block text-coral-600 font-bold underline mt-1"
                  >
                    Fazer Login ou Criar Conta
                  </button>
                </div>
              </div>

              {/* Personalização Local do Modo Casal */}
              <div className="bg-gradient-to-br from-peach-50 to-white p-4 rounded-2xl border border-peach-200">
                <label className="block text-xs font-black text-gray-800 mb-1">
                  Nome do seu Amor / Parceiro(a):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={partnerNameLocal}
                    onChange={(e) => setPartnerNameLocal(e.target.value)}
                    placeholder="ex: Jennyfer"
                    className="flex-1 px-3 py-2 text-xs bg-white border border-peach-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral-400 text-gray-800 font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleSaveLocalCoupleMode}
                    className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Ativar
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  O aplicativo ativará badges e carinho a dois nos cards das suas metas!
                </p>
              </div>
            </div>
          )}

          {/* Dica de Segurança & Privacidade */}
          <div className="flex items-center gap-2 p-3 bg-mint-50/70 border border-mint-200/60 rounded-2xl text-[11px] text-mint-900">
            <ShieldCheck className="w-4 h-4 text-mint-600 shrink-0" />
            <span>
              Suas metas compartilhadas são protegidas por criptografia e Row Level Security (RLS) no Supabase.
            </span>
          </div>

        </div>

        {/* Rodapé */}
        <div className="px-5 py-3 bg-peach-50/50 border-t border-peach-200/50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-all"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}

