export interface ProgressEntry {
  id: number;
  entryDate: string;
  value: number;
  notes?: string;
}

export interface Objective {
  id: number;
  name: string;
  description?: string;
  category: string;
  initialValue?: number;
  currentValue?: number;
  targetValue?: number;
  isLowerBetter: boolean;
  unit?: string;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'completed' | 'archived' | 'paused';
  userId: number;
  progressPercentage?: number;
  progressEntries?: ProgressEntry[];
}
