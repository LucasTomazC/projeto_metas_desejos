import { Goal, GoalItem } from '@/types/database';

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export interface GoalCalculations {
  totalCost: number;             // Total somado de todos os itens
  purchasedCost: number;         // Total dos itens já comprados
  savedAmount: number;           // Dinheiro já guardado fisicamente no cofrinho
  remainingCost: number;         // Valor dos itens pendentes (totalCost - purchasedCost)
  neededFromFutureSalary: number;// Quanto ainda precisa poupar dos próximos salários
  monthlyQuota: number;          // Valor real a guardar por mês
  totalItemsCount: number;
  purchasedItemsCount: number;
  progressPercentage: number;    // % de conclusão global (comprados + cofrinho)
  salaryImpactPercentage: number;// % do salário comprometido por essa meta
  affordableItems: GoalItem[];   // Itens pendentes que já podem ser comprados com o saldo do cofrinho
}

export function calculateGoalStats(goal: Goal, salary: number): GoalCalculations {
  const items = goal.items || [];
  const deadline = Math.max(goal.deadline_months || 1, 1);
  const savedAmount = Number(goal.saved_amount) || 0;
  
  const totalCost = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const purchasedCost = items
    .filter(item => item.is_purchased)
    .reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  
  const remainingCost = Math.max(totalCost - purchasedCost, 0);
  
  // O que ainda precisa poupar do salário leva em conta o que já está guardado no cofrinho
  const neededFromFutureSalary = Math.max(remainingCost - savedAmount, 0);
  const monthlyQuota = neededFromFutureSalary > 0 ? neededFromFutureSalary / deadline : 0;
  
  const totalItemsCount = items.length;
  const purchasedItemsCount = items.filter(item => item.is_purchased).length;
  
  // Progresso total: itens comprados + dinheiro já guardado no cofrinho
  const totalAchievedValue = purchasedCost + Math.min(savedAmount, remainingCost);
  const progressPercentage = totalCost > 0 
    ? Math.min(Math.round((totalAchievedValue / totalCost) * 100), 100) 
    : 0;

  const validSalary = salary > 0 ? salary : 1;
  const salaryImpactPercentage = Number(((monthlyQuota / validSalary) * 100).toFixed(1));

  // Itens pendentes que cabem no saldo atual do cofrinho
  const pendingItems = items.filter(it => !it.is_purchased);
  const affordableItems = pendingItems.filter(it => Number(it.price) <= savedAmount);

  return {
    totalCost,
    purchasedCost,
    savedAmount,
    remainingCost,
    neededFromFutureSalary,
    monthlyQuota,
    totalItemsCount,
    purchasedItemsCount,
    progressPercentage,
    salaryImpactPercentage,
    affordableItems,
  };
}

export function calculateGlobalBudget(goals: Goal[], salary: number) {
  let totalMonthlyNeeded = 0;
  let totalRemainingAmount = 0;
  let totalSavedAmount = 0;
  let totalCompletedItems = 0;
  let totalItemsCount = 0;

  goals.forEach(goal => {
    const stats = calculateGoalStats(goal, salary);
    totalMonthlyNeeded += stats.monthlyQuota;
    totalRemainingAmount += stats.neededFromFutureSalary;
    totalSavedAmount += stats.savedAmount;
    totalCompletedItems += stats.purchasedItemsCount;
    totalItemsCount += stats.totalItemsCount;
  });

  const validSalary = salary > 0 ? salary : 1;
  const totalSalaryImpact = Number(((totalMonthlyNeeded / validSalary) * 100).toFixed(1));
  const isOverBudget = totalMonthlyNeeded > salary;

  return {
    totalMonthlyNeeded,
    totalRemainingAmount,
    totalSavedAmount,
    totalCompletedItems,
    totalItemsCount,
    totalSalaryImpact,
    isOverBudget,
  };
}
