import { Goal, Badge } from '@/types/database';

export function calculateBadges(goals: Goal[], isCoupleActive: boolean = false): Badge[] {
  const totalGoals = goals.length;
  const allItems = goals.flatMap(g => g.items || []);
  const totalItems = allItems.length;
  const totalSaved = goals.reduce((acc, g) => acc + (Number(g.saved_amount) || 0), 0);

  // Verifica se alguma meta chegou a 50%
  const hasHalfway = goals.some(g => {
    const cost = (g.items || []).reduce((acc, it) => acc + Number(it.price || 0), 0);
    const saved = Number(g.saved_amount) || 0;
    return cost > 0 && (saved / cost) >= 0.5;
  });

  // Verifica se alguma meta foi concluída (100% dos itens comprados ou 100% guardado)
  const hasCompleted = goals.some(g => {
    const items = g.items || [];
    const cost = items.reduce((acc, it) => acc + Number(it.price || 0), 0);
    const saved = Number(g.saved_amount) || 0;
    const allPurchased = items.length > 0 && items.every(it => it.is_purchased);
    const fullSaved = cost > 0 && saved >= cost;
    return allPurchased || fullSaved;
  });

  // Verifica se simulador ou acelerador foi utilizado
  let acceleratorUsed = false;
  if (typeof window !== 'undefined') {
    acceleratorUsed = localStorage.getItem('jennyfer_accelerator_used') === 'true';
  }

  // Verifica se tem meta compartilhada ou modo casal
  const hasSharedGoal = isCoupleActive || goals.some(g => (g.shares && g.shares.length > 0) || g.is_shared);

  return [
    {
      id: 'first_goal',
      icon: '🥉',
      title: 'Primeiro Passo',
      description: 'Criou sua primeira grande meta no aplicativo',
      category: 'início',
      color: 'coral',
      unlocked: totalGoals >= 1,
      progress: Math.min(100, (totalGoals / 1) * 100),
      progressText: `${totalGoals >= 1 ? '1/1' : '0/1'} meta criada`
    },
    {
      id: 'first_item',
      icon: '🛍️',
      title: 'Desejo no Papel',
      description: 'Adicionou o primeiro item ou link com foto e preço',
      category: 'início',
      color: 'peach',
      unlocked: totalItems >= 1,
      progress: Math.min(100, (totalItems / 1) * 100),
      progressText: `${totalItems >= 1 ? '1/1' : '0/1'} item adicionado`
    },
    {
      id: 'first_piggy',
      icon: '🐷',
      title: 'Poupador Nato',
      description: 'Fez o primeiro depósito no Cofrinho Virtual',
      category: 'economia',
      color: 'butter',
      unlocked: totalSaved > 0,
      progress: totalSaved > 0 ? 100 : 0,
      progressText: totalSaved > 0 ? 'Depósito efetuado' : 'Aguardando 1º depósito'
    },
    {
      id: 'accelerator',
      icon: '⚡',
      title: 'Acelerador',
      description: 'Simulou e ajustou o prazo da meta para conquistar mais rápido',
      category: 'economia',
      color: 'coral',
      unlocked: acceleratorUsed,
      progress: acceleratorUsed ? 100 : 0,
      progressText: acceleratorUsed ? 'Prazo acelerado' : 'Use o simulador'
    },
    {
      id: 'halfway',
      icon: '🌟',
      title: 'Meio Caminho',
      description: 'Alcançou 50% do valor necessário em uma meta',
      category: 'conquista',
      color: 'mint',
      unlocked: hasHalfway,
      progress: hasHalfway ? 100 : 0,
      progressText: hasHalfway ? '50% acumulado' : 'Rumo aos 50%'
    },
    {
      id: 'shared_couple',
      icon: '💕',
      title: 'Juntos pelo Sonho',
      description: 'Ativou o Modo Casal ou convidou seu parceiro(a) para uma meta',
      category: 'parceria',
      color: 'coral',
      unlocked: hasSharedGoal,
      progress: hasSharedGoal ? 100 : 0,
      progressText: hasSharedGoal ? 'Meta compartilhada' : 'Convide o parceiro(a)'
    },
    {
      id: 'multi_planner',
      icon: '🎯',
      title: 'Mestre do Foco',
      description: 'Possui 3 ou mais metas planejadas e organizadas',
      category: 'conquista',
      color: 'butter',
      unlocked: totalGoals >= 3,
      progress: Math.min(100, Math.round((totalGoals / 3) * 100)),
      progressText: `${Math.min(3, totalGoals)}/3 metas`
    },
    {
      id: 'goal_completed',
      icon: '👑',
      title: 'Sonho Realizado!',
      description: 'Conquistou 100% de uma meta comprando todos os itens ou completando o cofrinho',
      category: 'conquista',
      color: 'mint',
      unlocked: hasCompleted,
      progress: hasCompleted ? 100 : 0,
      progressText: hasCompleted ? 'Meta conquistada!' : 'Em andamento'
    }
  ];
}

