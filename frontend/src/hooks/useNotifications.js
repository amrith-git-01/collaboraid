import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
    fetchNotifications,
    createNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications,
    addNotificationLocal,
} from '../store/notificationsSlice';

export const useNotifications = () => {
    const dispatch = useDispatch();
    const notificationsState = useSelector((state) => state.notifications);
    const notifications = notificationsState?.notifications || [];
    const unreadCount = notificationsState?.unreadCount || 0;
    const loading = notificationsState?.loading || false;
    const error = notificationsState?.error || null;

    const showNotification = useCallback((notification) => {
        // Then save to backend
        dispatch(createNotification(notification));
    }, [dispatch]);

    const showSuccess = useCallback((title, message, options = {}) => {
        const notification = {
            title,
            message,
            ...options,
        };
        dispatch(createNotification(notification));
    }, [dispatch]);

    const showError = useCallback((title, message, options = {}) => {
        const notification = {
            title,
            message,
            ...options,
        };
        dispatch(createNotification(notification));
    }, [dispatch]);

    const showWarning = useCallback((title, message, options = {}) => {
        const notification = {
            title,
            message,
            ...options,
        };
        dispatch(createNotification(notification));
    }, [dispatch]);

    const showInfo = useCallback((title, message, options = {}) => {
        const notification = {
            title,
            message,
            ...options,
        };
        dispatch(createNotification(notification));
    }, [dispatch]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications: useCallback(() => dispatch(fetchNotifications()), [dispatch]),
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        markAsRead: useCallback((id) => dispatch(markNotificationAsRead(id)), [dispatch]),
        markAllAsRead: useCallback(() => dispatch(markAllNotificationsAsRead()), [dispatch]),
        removeNotification: useCallback((id) => dispatch(deleteNotification(id)), [dispatch]),
        clearAllNotifications: useCallback(() => dispatch(deleteAllNotifications()), [dispatch]),
    };
};
