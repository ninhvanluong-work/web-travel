import { create } from 'zustand';

export interface AlertAction {
  label: string;
  onClick: () => void;
}

export interface AlertItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: AlertAction;
}

interface AlertState {
  alerts: AlertItem[];
  addAlert: (alert: Omit<AlertItem, 'id'>) => void;
  removeAlert: (id: string) => void;
  clearAll: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  addAlert: (alert) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => {
      const newAlerts = [{ ...alert, id }, ...state.alerts];
      if (newAlerts.length > 3) newAlerts.pop();
      return { alerts: newAlerts };
    });
  },
  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((item) => item.id !== id),
    })),
  clearAll: () => set({ alerts: [] }),
}));
