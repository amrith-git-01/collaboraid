import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationService } from "../services/notificationService";

// Fetch notifications from API
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const data = await notificationService.getMyNotifications();
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
        }
    }
);

// Create notification (saves to backend)
export const createNotification = createAsyncThunk(
    'notifications/createNotification',
    async (notificationData, { rejectWithValue }) => {
        try {
            const data = await notificationService.createNotification(notificationData);
            return data;
        } catch (error) {
            // Even if backend save fails, we still want to show the notification locally
            console.error('Failed to save notification to backend:', error);
            // Return the notification data so it can still be added locally
            return { data: { notification: notificationData } };
        }
    }
);

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId, { rejectWithValue }) => {
        try {
            await notificationService.markAsRead(notificationId);
            return notificationId;
        } catch (error) {
            // Even if backend update fails, mark as read locally
            console.error('Failed to mark notification as read in backend:', error);
            return notificationId;
        }
    }
);

// Mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            await notificationService.markAllAsRead();
            return true;
        } catch (error) {
            // Even if backend update fails, mark all as read locally
            console.error('Failed to mark all notifications as read in backend:', error);
            return true;
        }
    }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
    'notifications/deleteNotification',
    async (notificationId, { rejectWithValue }) => {
        try {
            await notificationService.deleteNotification(notificationId);
            return notificationId;
        } catch (error) {
            // Even if backend delete fails, remove locally
            console.error('Failed to delete notification from backend:', error);
            return notificationId;
        }
    }
);

// Delete all notifications
export const deleteAllNotifications = createAsyncThunk(
    'notifications/deleteAllNotifications',
    async (_, { rejectWithValue }) => {
        try {
            await notificationService.deleteAllNotifications();
            return true;
        } catch (error) {
            // Even if backend delete fails, clear locally
            console.error('Failed to delete all notifications from backend:', error);
            return true;
        }
    }
);

const initialState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
};

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        // Add notification locally (for immediate UI update, will sync with backend)
        addNotificationLocal: (state, action) => {
            const notification = {
                id: action.payload.id || Date.now() + Math.random(),
                title: action.payload.title,
                message: action.payload.message,
                timestamp: action.payload.timestamp || new Date().toISOString(),
                read: false,
                action: action.payload.action,
                ...action.payload,
            };
            state.notifications.unshift(notification);
            state.unreadCount += 1;

            // Limit to 100 notifications
            if (state.notifications.length > 100) {
                state.notifications = state.notifications.slice(0, 100);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                // Filter out deleted notifications (backend should already do this, but filter here for safety)
                const notifications = (action.payload.data?.notifications || []).filter(
                    n => !n.deleted
                );
                // Normalize read status - use isRead if available, otherwise use read
                const normalizedNotifications = notifications.map(n => ({
                    ...n,
                    read: n.isRead !== undefined ? n.isRead : n.read,
                }));
                state.notifications = normalizedNotifications;
                state.unreadCount = action.payload.data?.unreadCount || 0;
                state.error = null;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create notification
            .addCase(createNotification.fulfilled, (state, action) => {
                const notification = action.payload.data?.notification;
                if (notification && !notification.deleted) {
                    // Check if notification already exists (avoid duplicates)
                    const exists = state.notifications.some(n =>
                        n._id === notification._id ||
                        (n.id === notification.id && n.title === notification.title)
                    );
                    if (!exists) {
                        state.notifications.unshift(notification);
                        if (!notification.read) {
                            state.unreadCount += 1;
                        }
                    }
                }
            })
            // Mark as read
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find(n =>
                    n.id === action.payload || n._id === action.payload
                );
                if (notification && !notification.read) {
                    notification.read = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            // Mark all as read
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                state.notifications.forEach(notification => {
                    notification.read = true;
                });
                state.unreadCount = 0;
            })
            // Delete notification
            .addCase(deleteNotification.fulfilled, (state, action) => {
                const notificationId = action.payload;
                const index = state.notifications.findIndex(n =>
                    n.id === notificationId || n._id === notificationId
                );
                if (index !== -1) {
                    const notification = state.notifications[index];
                    if (!notification.read) {
                        state.unreadCount = Math.max(0, state.unreadCount - 1);
                    }
                    state.notifications.splice(index, 1);
                }
            })
            // Delete all notifications
            .addCase(deleteAllNotifications.fulfilled, (state) => {
                state.notifications = [];
                state.unreadCount = 0;
            });
    },
});

export const {
    addNotificationLocal,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
