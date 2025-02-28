export default interface UserPreferences {
  showAllTasks: boolean,
  showTaskType: 'any' | 'completed' | 'uncompleted',
  sortTasksBy: 'default' | 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc'
}


export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  showAllTasks: true,
  showTaskType: 'any',
  sortTasksBy: 'default'
}
