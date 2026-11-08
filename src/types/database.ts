export type ColorTheme = 'coral' | 'peach' | 'butter' | 'mint';

export interface Profile {
  id: string;
  monthly_salary: number;
  full_name?: string | null;
  updated_at?: string;
}

export interface GoalItem {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  price: number;
  product_url?: string | null;
  image_url?: string | null;
  is_purchased: boolean;
  priority: 'alta' | 'media' | 'baixa';
  created_at?: string;
}

export interface GoalShare {
  id: string;
  goal_id: string;
  owner_id: string;
  shared_with_email: string;
  shared_with_user_id?: string | null;
  status: 'pending' | 'accepted';
  created_at?: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  category_icon: string;
  color_theme: ColorTheme;
  deadline_months: number;
  saved_amount?: number;
  created_at?: string;
  items?: GoalItem[];
  shares?: GoalShare[];
  is_shared?: boolean;
  is_owner?: boolean;
}

export interface Badge {
  id: string;
  icon: string;
  title: string;
  description: string;
  category: 'início' | 'economia' | 'parceria' | 'conquista';
  color: ColorTheme;
  unlocked: boolean;
  progress: number; // 0 to 100
  progressText: string;
}
