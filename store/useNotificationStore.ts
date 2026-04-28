import { create } from 'zustand';
import api from '@/lib/api';

export interface Notification {
  _id: string;
  recipientId: string;
  senderId?: {
    _id: string;
    name: string;
    displayName: string;
    username: string;
    avatar?: string;
  };
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'SYSTEM';
  referenceId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  currentPage: number;
  hasMore: boolean;
  
  fetchNotifications: (reset?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  currentPage: 1,
  hasMore: false,

  fetchNotifications: async (reset = true) => {
    const page = reset ? 1 : get().currentPage + 1;
    set({ isLoading: true });
    
    try {
      const { data } = await api.get(`/notifications?page=${page}&limit=20`);
      const newNotifications = data.data.data;
      const pagination = data.data.pagination;
      
      set((state) => ({
        notifications: reset ? newNotifications : [...state.notifications, ...newNotifications],
        currentPage: page,
        hasMore: pagination.hasNext,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      set({ unreadCount: data.data.count });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  markAsRead: async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.put('/notifications/read-all');
      
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },
}));
