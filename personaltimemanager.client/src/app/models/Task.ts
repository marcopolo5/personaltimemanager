export interface Task {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: 'ongoing' | 'one-time' | '';
  startTime: string;
  endTime: string;
  dates: string[];
  isCompleted: boolean;
}
