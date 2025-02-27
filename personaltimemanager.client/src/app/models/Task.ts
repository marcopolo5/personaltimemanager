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


export const DEFAULT_TASK: Task = {
  id: '',
  userId: '',
  name: '',
  description: '',
  type: '',
  startTime: '',
  endTime: '',
  dates: [],
  isCompleted: false
}
