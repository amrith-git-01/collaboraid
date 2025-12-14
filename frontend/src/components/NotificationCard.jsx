import React from 'react';
import { Check, Trash2, Clock, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const NotificationCard = ({ notification, onMarkAsRead, onDelete }) => {
  const formatTime = timestamp => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={`bg-white border border-gray-200 rounded-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
        !notification.read ? 'bg-purple-50/10' : ''
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3
                className={`text-base font-semibold ${
                  !notification.read ? 'text-gray-900' : 'text-gray-700'
                }`}
              >
                {notification.title}
              </h3>
              {notification.isOrganizationNotification && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-full">
                  <Users className="w-3 h-3" />
                  Organization
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {notification.message}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>
                {formatTime(notification.createdAt || notification.timestamp)}
              </span>
            </div>

            {/* Unread indicator - Subtle dot */}
            {!notification.read && (
              <div className="mt-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-purple-600 font-medium">
                  Unread
                </span>
              </div>
            )}

            {/* Action button if available */}
            {notification.action && (
              <div className="mt-3">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (notification.action.onClick)
                      notification.action.onClick();
                  }}
                  className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors hover:underline"
                >
                  {notification.action.label || 'View Details'} &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0 self-center">
            {!notification.read && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onMarkAsRead(notification._id || notification.id);
                }}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Mark as read"
              >
                <Check className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={e => {
                e.stopPropagation();
                onDelete(notification._id || notification.id);
              }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete notification"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationCard;
