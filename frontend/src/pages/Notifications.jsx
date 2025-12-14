import React, { useState, useMemo } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationCard from '../components/NotificationCard';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { AnimatePresence } from 'framer-motion';

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all');

  // Filter notifications based on active tab
  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'read':
        return notifications.filter(n => n.read);
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const handleTabChange = tab => {
    setActiveTab(tab);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
    }
  };

  const handleMarkAsRead = async id => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDelete = async id => {
    try {
      await removeNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
                Notifications
              </h1>
              <p className="text-base text-gray-600">
                Stay updated with your latest activities
              </p>
            </div>
            <div className="flex flex-row gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-sm"
                  icon={<CheckCheck className="w-4 h-4" />}
                  iconPosition="left"
                >
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-sm text-red-600 hover:text-red-700 hover:border-red-300"
                  icon={<Trash2 className="w-4 h-4" />}
                  iconPosition="left"
                >
                  Delete all
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <nav className="flex space-x-1 p-1">
            <button
              onClick={() => handleTabChange('all')}
              className={`relative flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-purple-50 text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
              }`}
            >
              All
              {activeTab === 'all' && (
                <span className="absolute inset-0 rounded-md ring-1 ring-purple-200 ring-inset"></span>
              )}
              {notifications.length > 0 && (
                <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange('unread')}
              className={`relative flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'unread'
                  ? 'bg-purple-50 text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
              }`}
            >
              Unread
              {activeTab === 'unread' && (
                <span className="absolute inset-0 rounded-md ring-1 ring-purple-200 ring-inset"></span>
              )}
              {unreadNotifications.length > 0 && (
                <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange('read')}
              className={`relative flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'read'
                  ? 'bg-purple-50 text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
              }`}
            >
              Read
              {activeTab === 'read' && (
                <span className="absolute inset-0 rounded-md ring-1 ring-purple-200 ring-inset"></span>
              )}
              {readNotifications.length > 0 && (
                <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                  {readNotifications.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Content */}
        {loading && notifications.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-6 px-4 mt-6">
            <div className="text-gray-400 mb-3">
              <Bell className="mx-auto h-8 w-8 animate-float-up-down" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1.5">
              {activeTab === 'unread'
                ? 'No unread notifications'
                : activeTab === 'read'
                  ? 'No read notifications'
                  : 'No notifications'}
            </h3>
            <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
              {activeTab === 'unread'
                ? "You're all caught up! No unread notifications."
                : activeTab === 'read'
                  ? "You haven't read any notifications yet."
                  : "You're all caught up! Check back later for updates."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map(notification => (
                <NotificationCard
                  key={notification._id || notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
