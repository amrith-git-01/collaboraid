import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [isToastVisible, setIsToastVisible] = useState(false);
  const timeoutRefs = useRef({});
  const progressRefs = useRef({});

  const hideToast = useCallback(id => {
    setToasts(prev => {
      const updatedToasts = prev.map(toast =>
        toast.id === id ? { ...toast, visible: false } : toast
      );

      // Check if any toasts are still visible
      const hasVisibleToasts = updatedToasts.some(toast => toast.visible);
      if (!hasVisibleToasts) {
        setIsToastVisible(false);
      }

      return updatedToasts;
    });

    // Remove toast after fade out animation
    setTimeout(() => {
      setToasts(prev => {
        const filteredToasts = prev.filter(toast => toast.id !== id);

        // Update isToastVisible based on remaining toasts
        const hasVisibleToasts = filteredToasts.some(toast => toast.visible);
        setIsToastVisible(hasVisibleToasts);

        return filteredToasts;
      });
    }, 300); // Match the CSS transition duration

    // Clear timeout
    if (timeoutRefs.current[id]) {
      clearTimeout(timeoutRefs.current[id]);
      delete timeoutRefs.current[id];
    }

    // Clear progress ref
    if (progressRefs.current[id]) {
      delete progressRefs.current[id];
    }
  }, []);

  const showToast = useCallback(
    (message, type = 'info', duration = 5000) => {
      // Limit maximum number of toasts to prevent excessive stacking
      if (toasts.length >= 5) {
        // Remove the oldest toast to make room
        const oldestToast = toasts[0];
        if (oldestToast) {
          hideToast(oldestToast.id);
        }
      }

      const id = Date.now() + Math.random();
      setIsToastVisible(true);

      const newToast = {
        id,
        message,
        type,
        visible: true,
        duration,
        startTime: Date.now(),
      };

      setToasts(prev => [...prev, newToast]);

      // Start progress bar animation
      const startProgress = () => {
        const progressElement = progressRefs.current[id];
        if (progressElement) {
          progressElement.style.transition = `width ${duration}ms linear`;
          progressElement.style.width = '100%';

          // Force reflow
          progressElement.offsetHeight;

          // Animate from 100% to 0% (right to left)
          progressElement.style.width = '0%';
        }
      };

      // Auto-hide after duration
      timeoutRefs.current[id] = setTimeout(() => {
        hideToast(id);
      }, duration);

      // Start progress animation after a small delay to ensure DOM is ready
      setTimeout(startProgress, 100);

      return id;
    },
    [toasts, hideToast]
  );

  const clearAllToasts = useCallback(() => {
    setToasts([]);
    setIsToastVisible(false);

    // Clear all timeouts
    Object.values(timeoutRefs.current).forEach(timeout =>
      clearTimeout(timeout)
    );
    timeoutRefs.current = {};

    // Clear all progress refs
    progressRefs.current = {};
  }, []);

  const isAnyToastVisible = useCallback(() => {
    // Check if there are any visible toasts
    return toasts.some(toast => toast.visible);
  }, [toasts]);

  const value = {
    showToast,
    hideToast,
    clearAllToasts,
    isAnyToastVisible,
    isToastVisible,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast notifications will be rendered here */}
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className={`fixed right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 transform transition-all duration-500 ${
            toast.visible
              ? 'translate-x-0 opacity-100'
              : 'translate-x-full opacity-0'
          } ${
            toast.type === 'success'
              ? 'border-l-4 border-l-green-500'
              : toast.type === 'error'
                ? 'border-l-4 border-l-red-500'
                : toast.type === 'warning'
                  ? 'border-l-4 border-l-yellow-500'
                  : 'border-l-4 border-l-blue-500'
          }`}
          style={{
            top: `${Math.max(16, 16 + index * 80)}px`, // Start at 16px from top + 80px spacing per toast
            right: '16px', // Fixed right position
            width: '400px', // Fixed width instead of full width
            maxWidth: 'calc(100vw - 32px)', // Responsive max width for mobile
            zIndex: 50 + index, // Ensure proper layering
            boxShadow: `0 ${4 + index * 2}px ${12 + index * 4}px rgba(0, 0, 0, ${0.1 + index * 0.02})`, // Progressive shadow depth
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', // Smooth easing
          }}
        >
          <div className="flex items-start p-4">
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  toast.type === 'success'
                    ? 'text-green-800'
                    : toast.type === 'error'
                      ? 'text-red-800'
                      : toast.type === 'warning'
                        ? 'text-yellow-800'
                        : 'text-blue-800'
                }`}
              >
                {toast.message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => hideToast(toast.id)}
                className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 hover:scale-110"
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', // Smooth easing
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Progress bar with timeout animation */}
          <div className="h-1 bg-gray-200 rounded-b-lg overflow-hidden">
            <div
              ref={el => {
                if (el) progressRefs.current[toast.id] = el;
              }}
              className={`h-full transition-all duration-500`}
              style={{
                width: '100%',
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', // Smooth easing
                backgroundColor:
                  toast.type === 'success'
                    ? '#10b981' // green-500
                    : toast.type === 'error'
                      ? '#ef4444' // red-500
                      : toast.type === 'warning'
                        ? '#f59e0b' // yellow-500
                        : '#3b82f6', // blue-500
              }}
            />
          </div>
        </div>
      ))}
    </ToastContext.Provider>
  );
};
