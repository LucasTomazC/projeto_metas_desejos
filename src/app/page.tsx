'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Goal, GoalItem } from '@/types/database';
import { calculateGlobalBudget } from '@/lib/calculations';
import { HeaderSalary } from '@/components/HeaderSalary';
import { GoalCard } from '@/components/GoalCard';
import { GoalDetailsModal } from '@/components/GoalDetailsModal';
import { NewGoalModal } from '@/components/NewGoalModal';
import { NewItemModal } from '@/components/NewItemModal';
import { AuthModal } from '@/components/AuthModal';
import { PiggyBankModal } from '@/components/PiggyBankModal';
import { PwaAndBackupModal } from '@/components/PwaAndBackupModal';
import { BadgesModal } from '@/components/BadgesModal';
import { CoupleShareModal } from '@/components/CoupleShareModal';
import { TopAchievementsAndCoupleBanner } from '@/components/TopAchievementsAndCoupleBanner';
import { calculateBadges } from '@/lib/badges';

const DEFAULT_DEMO_GOALS: Goal[] = [
  {
    id: 'demo-salao',
    user_id: 'local',
    title: 'SALÃO DOS SONHOS',
    category_icon: '💇‍♀️',
    color_theme: 'coral',
    deadline_months: 6,
    saved_amount: 450.0,
    items: [
      {
        id: 'item-1',
        goal_id: 'demo-salao',
        user_id: 'local',
        title: 'Penteadeira Camarim com Espelho e Luzes LED',
        price: 650.0,
        product_url: 'https://www.mercadolivre.com.br',
        image_url: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=400&auto=format&fit=crop&q=80',
        is_purchased: false,
        priority: 'alta',
      },
      {
        id: 'item-2',
        goal_id: 'demo-salao',
        user_id: 'local',
        title: 'Cadeira Hidráulica Reclinável Rose Gold',
        price: 980.0,
        product_url: 'https://www.shopee.com.br',
        image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&auto=format&fit=crop&q=80',
        is_purchased: false,
        priority: 'alta',
      },
      {
        id: 'item-3',
        goal_id: 'demo-salao',
        user_id: 'local',
        title: 'Lavatório de Cabelo Cuba Porcelana',
        price: 1070.0,
        product_url: 'https://www.amazon.com.br',
        image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=80',
        is_purchased: false,
        priority: 'media',
      },
    ],
  },
  {
    id: 'demo-pc',
    user_id: 'local',
    title: 'MEU NOVO COMPUTADOR',
    category_icon: '💻',
    color_theme: 'butter',
    deadline_months: 10,
    saved_amount: 300.0,
    items: [
      {
        id: 'item-4',
        goal_id: 'demo-pc',
        user_id: 'local',
        title: 'Notebook Ultrafino Rápido para Trabalho',
        price: 3200.0,
        product_url: 'https://www.amazon.com.br',
        image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&auto=format&fit=crop&q=80',
        is_purchased: false,
        priority: 'alta',
      },
      {
        id: 'item-5',
        goal_id: 'demo-pc',
        user_id: 'local',
        title: 'Monitor 24 Polegadas IPS Full HD',
        price: 650.0,
        product_url: 'https://www.mercadolivre.com.br',
        image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&auto=format&fit=crop&q=80',
        is_purchased: false,
        priority: 'media',
      },
    ],
  },
];

export default function HomePage() {
  const [salary, setSalary] = useState<number>(1500.0);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [piggyBankGoal, setPiggyBankGoal] = useState<Goal | null>(null);
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);
  const [newItemGoalId, setNewItemGoalId] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [isCoupleModalOpen, setIsCoupleModalOpen] = useState(false);
  const [coupleInitialGoalId, setCoupleInitialGoalId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Carregar Sessão do Supabase e Dados
  useEffect(() => {
    async function initAuthAndData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await loadSupabaseData(session.user.id);
        } else {
          loadLocalData();
        }
      } catch (err) {
        console.error('Erro ao verificar sessão Supabase:', err);
        loadLocalData();
      } finally {
        setIsLoading(false);
      }
    }

    initAuthAndData();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadSupabaseData(session.user.id);
      } else {
        setUser(null);
        loadLocalData();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Carregar do Supabase (quando logado)
  async function loadSupabaseData(userId: string) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile && profile.monthly_salary) {
        setSalary(Number(profile.monthly_salary));
      }

      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select(`
          id,
          user_id,
          title,
          category_icon,
          color_theme,
          deadline_months,
          saved_amount,
          created_at,
          items:goal_items(*),
          shares:goal_shares(*)
        `)
        .order('created_at', { ascending: true });

      if (!goalsError && goalsData) {
        const enriched = (goalsData as any[]).map(g => ({
          ...g,
          is_owner: g.user_id === userId,
          is_shared: (g.shares && g.shares.length > 0) || g.user_id !== userId
        }));
        setGoals(enriched as Goal[]);
      }
    } catch (err) {
      console.error('Erro ao buscar dados no Supabase:', err);
    }
  }

  // Carregar do LocalStorage (modo visitante/offline)
  function loadLocalData() {
    if (typeof window === 'undefined') return;
    const savedSalary = localStorage.getItem('jennyfer_salary');
    if (savedSalary) {
      setSalary(parseFloat(savedSalary));
    }

    const savedGoals = localStorage.getItem('jennyfer_goals');
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch {
        setGoals(DEFAULT_DEMO_GOALS);
      }
    } else {
      setGoals(DEFAULT_DEMO_GOALS);
      localStorage.setItem('jennyfer_goals', JSON.stringify(DEFAULT_DEMO_GOALS));
    }
  }

  // Salvar Metas localmente
  function persistGoalsLocally(updatedGoals: Goal[]) {
    setGoals(updatedGoals);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jennyfer_goals', JSON.stringify(updatedGoals));
    }
  }

  // Atualizar Salário
  const handleUpdateSalary = async (newSalary: number) => {
    setSalary(newSalary);
    if (user) {
      await supabase
        .from('profiles')
        .update({ monthly_salary: newSalary })
        .eq('id', user.id);
    } else {
      localStorage.setItem('jennyfer_salary', newSalary.toString());
    }
  };

  // Atualizar Saldo do Cofrinho (Etapa 3)
  const handleUpdateSavedAmount = async (goalId: string, newTotalSaved: number) => {
    if (user) {
      await supabase
        .from('goals')
        .update({ saved_amount: newTotalSaved })
        .eq('id', goalId);
    }

    const updated = goals.map((g) => {
      if (g.id === goalId) {
        const upGoal = { ...g, saved_amount: newTotalSaved };
        if (selectedGoal?.id === g.id) setSelectedGoal(upGoal);
        return upGoal;
      }
      return g;
    });

    if (!user) persistGoalsLocally(updated);
    else setGoals(updated);
  };

  // Atualizar Prazo da Meta (Simulador de Aceleração - Etapa 3)
  const handleUpdateDeadline = async (goalId: string, newMonths: number) => {
    if (user) {
      await supabase
        .from('goals')
        .update({ deadline_months: newMonths })
        .eq('id', goalId);
    }

    const updated = goals.map((g) => {
      if (g.id === goalId) {
        const upGoal = { ...g, deadline_months: newMonths };
        if (selectedGoal?.id === g.id) setSelectedGoal(upGoal);
        return upGoal;
      }
      return g;
    });

    if (!user) persistGoalsLocally(updated);
    else setGoals(updated);
  };

  // Criar Nova Meta
  const handleCreateGoal = async (data: {
    title: string;
    deadlineMonths: number;
    colorTheme: any;
    categoryIcon: string;
  }) => {
    if (user) {
      const { data: newGoal, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: data.title,
          deadline_months: data.deadlineMonths,
          color_theme: data.colorTheme,
          category_icon: data.categoryIcon,
          saved_amount: 0.0,
        })
        .select()
        .single();

      if (!error && newGoal) {
        const goalWithItems: Goal = { ...newGoal, items: [] };
        setGoals((prev) => [...prev, goalWithItems]);
      }
    } else {
      const newGoal: Goal = {
        id: 'goal_' + Date.now(),
        user_id: 'local',
        title: data.title,
        deadline_months: data.deadlineMonths,
        color_theme: data.colorTheme,
        category_icon: data.categoryIcon,
        saved_amount: 0.0,
        items: [],
      };
      persistGoalsLocally([...goals, newGoal]);
    }
  };

  // Adicionar Item a uma Meta
  const handleAddItem = async (itemData: {
    goalId: string;
    title: string;
    price: number;
    productUrl?: string;
    imageUrl?: string;
    priority: 'alta' | 'media' | 'baixa';
  }) => {
    if (user) {
      const { data: newItem, error } = await supabase
        .from('goal_items')
        .insert({
          goal_id: itemData.goalId,
          user_id: user.id,
          title: itemData.title,
          price: itemData.price,
          product_url: itemData.productUrl,
          image_url: itemData.imageUrl,
          priority: itemData.priority,
          is_purchased: false,
        })
        .select()
        .single();

      if (!error && newItem) {
        setGoals((prev) =>
          prev.map((g) => {
            if (g.id === itemData.goalId) {
              const updated = { ...g, items: [...(g.items || []), newItem] };
              if (selectedGoal?.id === g.id) setSelectedGoal(updated);
              return updated;
            }
            return g;
          })
        );
      }
    } else {
      const newItem: GoalItem = {
        id: 'item_' + Date.now(),
        goal_id: itemData.goalId,
        user_id: 'local',
        title: itemData.title,
        price: itemData.price,
        product_url: itemData.productUrl,
        image_url: itemData.imageUrl,
        priority: itemData.priority,
        is_purchased: false,
      };

      const updated = goals.map((g) => {
        if (g.id === itemData.goalId) {
          const upGoal = { ...g, items: [...(g.items || []), newItem] };
          if (selectedGoal?.id === g.id) setSelectedGoal(upGoal);
          return upGoal;
        }
        return g;
      });
      persistGoalsLocally(updated);
    }
  };

  // Marcar / Desmarcar Item como Comprado
  const handleToggleItemPurchased = async (itemId: string, currentState: boolean) => {
    const nextState = !currentState;

    if (user) {
      await supabase
        .from('goal_items')
        .update({ is_purchased: nextState })
        .eq('id', itemId);
    }

    const updated = goals.map((g) => {
      const updatedItems = (g.items || []).map((it) => {
        if (it.id === itemId) {
          return { ...it, is_purchased: nextState };
        }
        return it;
      });

      const upGoal = { ...g, items: updatedItems };
      if (selectedGoal?.id === g.id) {
        setSelectedGoal(upGoal);
      }
      return upGoal;
    });

    if (!user) persistGoalsLocally(updated);
    else setGoals(updated);
  };

  // Excluir Item
  const handleDeleteItem = async (itemId: string) => {
    if (user) {
      await supabase.from('goal_items').delete().eq('id', itemId);
    }

    const updated = goals.map((g) => {
      const updatedItems = (g.items || []).filter((it) => it.id !== itemId);
      const upGoal = { ...g, items: updatedItems };
      if (selectedGoal?.id === g.id) setSelectedGoal(upGoal);
      return upGoal;
    });

    if (!user) persistGoalsLocally(updated);
    else setGoals(updated);
  };

  // Excluir Meta
  const handleDeleteGoal = async (goalId: string) => {
    if (user) {
      await supabase.from('goals').delete().eq('id', goalId);
    }

    const updated = goals.filter((g) => g.id !== goalId);
    if (!user) persistGoalsLocally(updated);
    else setGoals(updated);
    setSelectedGoal(null);
  };

  // Restaurar Backup JSON
  const handleRestoreBackup = (data: { goals: Goal[]; salary: number }) => {
    setSalary(data.salary);
    persistGoalsLocally(data.goals);
  };

  // Logout Supabase
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    loadLocalData();
  };

  const globalBudget = calculateGlobalBudget(goals, salary);

  return (
    <main className="min-h-screen pb-28 bg-cream-100 flex flex-col">
      {/* Header com Salário e Resumo Orçamentário Multi-Metas */}
      <HeaderSalary
        salary={salary}
        onUpdateSalary={handleUpdateSalary}
        totalMonthlyNeeded={globalBudget.totalMonthlyNeeded}
        totalSalaryImpact={globalBudget.totalSalaryImpact}
        totalSavedAmount={globalBudget.totalSavedAmount}
        isOverBudget={globalBudget.isOverBudget}
        goals={goals}
        userEmail={user?.email}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        onOpenSettings={() => setIsPwaModalOpen(true)}
      />

      {/* Conteúdo Principal Mobile-First */}
      <div className="w-full max-w-md mx-auto px-4 mt-5 flex-1 flex flex-col">
        {/* Painel de Topo: Conquistas & Modo Casal 💕 */}
        <TopAchievementsAndCoupleBanner
          goals={goals}
          user={user}
          onOpenBadges={() => setIsBadgesOpen(true)}
          onOpenCoupleModal={() => {
            setCoupleInitialGoalId(null);
            setIsCoupleModalOpen(true);
          }}
        />

        {/* Título da Seção */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-cream-900 tracking-tight flex items-center gap-1.5">
              <span>Minhas Metas</span>
              <span className="text-xs font-bold text-coral-600 bg-coral-100 px-2 py-0.5 rounded-full">
                {goals.length}
              </span>
            </h2>
            <p className="text-xs text-gray-500 font-medium">Toque em uma meta para ver produtos, cofrinho e prazos</p>
          </div>

          <button
            onClick={() => setIsNewGoalOpen(true)}
            className="flex items-center gap-1 bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold px-3 py-2 rounded-2xl shadow-button transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Meta</span>
          </button>
        </div>

        {/* Lista de Metas */}
        {isLoading ? (
          <div className="p-10 text-center text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-coral-500 mb-2" />
            <span className="text-xs font-medium">Carregando seus sonhos...</span>
          </div>
        ) : goals.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-4xl border border-dashed border-peach-200 my-6 shadow-soft">
            <div className="w-14 h-14 rounded-3xl bg-peach-100 text-coral-500 mx-auto flex items-center justify-center mb-3">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-cream-900">Nenhuma meta criada ainda</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              Crie sua primeira meta (como seu Salão, Computador, Viagem) e comece a ver quanto guardar por mês.
            </p>
            <button
              onClick={() => setIsNewGoalOpen(true)}
              className="mt-4 px-5 py-3 rounded-2xl bg-coral-500 text-white text-xs font-bold shadow-button hover:bg-coral-600 active:scale-95 transition-all"
            >
              + Criar Minha Primeira Meta
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                salary={salary}
                onClick={() => setSelectedGoal(goal)}
                onOpenPiggyBank={() => setPiggyBankGoal(goal)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Barra de Ação Flutuante Mobile no Rodapé */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-cream-100 via-cream-100/90 to-transparent pointer-events-none z-30">
        <div className="max-w-md mx-auto pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setIsNewGoalOpen(true)}
            className="w-full py-4 px-6 rounded-3xl bg-coral-500 text-white font-extrabold text-sm shadow-button hover:bg-coral-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Criar Nova Meta de Economia</span>
          </button>
        </div>
      </div>

      {/* Modais */}
      {selectedGoal && (
        <GoalDetailsModal
          goal={selectedGoal}
          salary={salary}
          isOpen={!!selectedGoal}
          onClose={() => setSelectedGoal(null)}
          onToggleItemPurchased={handleToggleItemPurchased}
          onDeleteItem={handleDeleteItem}
          onDeleteGoal={handleDeleteGoal}
          onOpenAddItem={(goalId) => setNewItemGoalId(goalId)}
          onOpenPiggyBank={(goal) => setPiggyBankGoal(goal)}
          onUpdateDeadline={handleUpdateDeadline}
          onOpenCoupleModal={(goalId) => {
            setSelectedGoal(null);
            setCoupleInitialGoalId(goalId);
            setIsCoupleModalOpen(true);
          }}
        />
      )}

      {/* Modal de Conquistas & Gamificação */}
      <BadgesModal
        isOpen={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
        badges={calculateBadges(goals, false)}
      />

      {/* Modal de Casal & Compartilhamento */}
      <CoupleShareModal
        isOpen={isCoupleModalOpen}
        onClose={() => {
          setIsCoupleModalOpen(false);
          setCoupleInitialGoalId(null);
        }}
        goals={goals}
        user={user}
        initialGoalId={coupleInitialGoalId}
        onRefreshData={() => {
          if (user) loadSupabaseData(user.id);
          else loadLocalData();
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {piggyBankGoal && (
        <PiggyBankModal
          goal={piggyBankGoal}
          salary={salary}
          isOpen={!!piggyBankGoal}
          onClose={() => setPiggyBankGoal(null)}
          onUpdateSavedAmount={handleUpdateSavedAmount}
        />
      )}

      <NewGoalModal
        isOpen={isNewGoalOpen}
        onClose={() => setIsNewGoalOpen(false)}
        onCreateGoal={handleCreateGoal}
      />

      <NewItemModal
        isOpen={!!newItemGoalId}
        goalId={newItemGoalId || ''}
        onClose={() => setNewItemGoalId(null)}
        onAddItem={handleAddItem}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
        }}
      />

      <PwaAndBackupModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
        goals={goals}
        salary={salary}
        onRestoreBackup={handleRestoreBackup}
      />
    </main>
  );
}
