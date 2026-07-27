import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const POLL_INTERVAL_MS = 30_000; // 30 secondes

/**
 * Hook de polling des notifications.
 * S'utilise dans App.jsx et passe les données à Navbar et NotificationPanel.
 *
 * @returns {object} { notifications, unreadCount, refresh, markRead, markAllRead }
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Silently fail — on ne veut pas casser l'app si les notifs sont indisponibles
    }
  }, []);

  // Polling initial + récurrent
  useEffect(() => {
    refresh(); // Chargement immédiat au montage
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const markRead = useCallback(async (id) => {
    await api.markNotificationRead(id);
    // Mise à jour locale sans attendre le prochain poll
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, refresh, markRead, markAllRead };
}
