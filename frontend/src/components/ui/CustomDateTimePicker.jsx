import { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';

// Helper component for wheel columns
const WheelColumn = ({ options, value, onChange, label, format = v => v }) => {
  const containerRef = useRef(null);
  const isScrollingRef = useRef(false);
  const isUserScrollingRef = useRef(false);
  const timeoutRef = useRef(null);
  const rafRef = useRef(null);
  const itemHeight = 48; // Height of each item in pixels
  const containerHeight = 192; // Total height of container (h-48 = 12rem = 192px)
  const paddingHeight = (containerHeight - itemHeight) / 2;

  // Scroll to selected value on mount
  useEffect(() => {
    if (containerRef.current) {
      const index = options.indexOf(value);
      if (index !== -1) {
        isScrollingRef.current = true;
        containerRef.current.scrollTop = index * itemHeight;
        // Reset flag after scroll completes
        const timeout = setTimeout(() => {
          isScrollingRef.current = false;
        }, 100);
        return () => clearTimeout(timeout);
      }
    }
  }, []); // Only on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Optimized scroll handler using requestAnimationFrame
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isScrollingRef.current) return;

    isUserScrollingRef.current = true;

    // Cancel any pending updates
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Use requestAnimationFrame for smooth updates
    rafRef.current = requestAnimationFrame(() => {
      if (!containerRef.current) return;

      const scrollTop = containerRef.current.scrollTop;
      const index = Math.round(scrollTop / itemHeight);

      if (index >= 0 && index < options.length) {
        const newValue = options[index];
        if (newValue !== value) {
          // Debounce the onChange call to avoid too many updates
          timeoutRef.current = setTimeout(() => {
            onChange(newValue);
            isUserScrollingRef.current = false;
          }, 50); // Reduced from 100ms for faster response
        }
      }
    });
  }, [options, value, onChange, itemHeight]);

  // Update scroll position when value changes externally (e.g. initial load or click)
  useEffect(() => {
    if (containerRef.current && !isUserScrollingRef.current) {
      const currentScroll = containerRef.current.scrollTop;
      const targetIndex = options.indexOf(value);
      const targetScroll = targetIndex * itemHeight;

      // Only scroll if the difference is significant to avoid fighting with user scroll
      if (Math.abs(currentScroll - targetScroll) > itemHeight / 2) {
        isScrollingRef.current = true;
        containerRef.current.scrollTo({
          top: targetScroll,
          behavior: 'smooth',
        });

        // Reset flag after scroll animation completes
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 300);
      }
    }
  }, [value, options, itemHeight]);

  return (
    <div className="relative flex-1 h-48 group">
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-auto snap-y snap-mandatory hide-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div style={{ height: paddingHeight }} />
        {options.map(opt => (
          <div
            key={opt}
            onClick={() => onChange(opt)}
            className={`h-12 flex items-center justify-center snap-center cursor-pointer transition-colors duration-150 ${
              opt === value
                ? 'text-purple-600 font-bold text-xl scale-110'
                : 'text-gray-400 font-medium text-base hover:text-gray-600'
            }`}
          >
            {format(opt)}
          </div>
        ))}
        <div style={{ height: paddingHeight }} />
      </div>
    </div>
  );
};

const CustomDateTimePicker = ({
  value,
  onChange,
  onSelect,
  isOpen,
  onClose,
  minDate = new Date(),
  placeholder = 'Select date & time',
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    value ? new Date(value) : null
  );
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [isAM, setIsAM] = useState(true);
  const [view, setView] = useState('date'); // 'date' or 'time'
  const modalRef = useRef(null);

  // Initialize with value only when modal first opens
  useEffect(() => {
    if (isOpen && value) {
      const date = new Date(value);
      setSelectedDate(date);
      const hours = date.getHours();
      setSelectedHour(hours % 12 || 12);
      setIsAM(hours < 12);
      setSelectedMinute(date.getMinutes());
      setCurrentDate(date);
    }
  }, [isOpen]); // Only depend on isOpen, not value

  // Reset data when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset all data when modal closes
      setSelectedDate(null);
      setSelectedHour(12);
      setSelectedMinute(0);
      setIsAM(true);
      setView('date');
      setCurrentDate(new Date());
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getDaysInMonth = date => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 0).getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getMonthName = date => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isToday = date => {
    const today = new Date();
    return date && date.toDateString() === today.toDateString();
  };

  const isSelected = date => {
    return (
      selectedDate &&
      date &&
      date.toDateString() === selectedDate.toDateString()
    );
  };

  const isDisabled = date => {
    return date && date < minDate;
  };

  const handleDateSelect = date => {
    if (date && !isDisabled(date)) {
      setSelectedDate(date);
      setView('time');
    }
  };

  const handleTimeConfirm = () => {
    if (selectedDate) {
      const finalDate = new Date(selectedDate);
      // Convert 12-hour format to 24-hour format
      let hour24 = selectedHour;
      if (!isAM && selectedHour !== 12) {
        hour24 = selectedHour + 12;
      } else if (isAM && selectedHour === 12) {
        hour24 = 0;
      }
      finalDate.setHours(hour24);
      finalDate.setMinutes(selectedMinute);
      finalDate.setSeconds(0);
      finalDate.setMilliseconds(0);

      // Use onSelect if provided, otherwise fall back to onChange
      const callback = onSelect || onChange;
      if (callback) {
        callback(finalDate.toISOString());
      }
      onClose();
    }
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 animate-in slide-in-from-bottom-4 duration-300 border border-gray-100 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-purple-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {view === 'date' ? (
              <>
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Select Date</span>
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 text-purple-600" />
                <span>Select Time</span>
              </>
            )}
          </h3>
          <button
            onClick={() => {
              // Reset data before closing
              setSelectedDate(null);
              setSelectedHour(12);
              setSelectedMinute(0);
              setIsAM(true);
              setView('date');
              setCurrentDate(new Date());
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white/50 hover:shadow-sm transition-all duration-200 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {view === 'date' ? (
            /* Date Picker View */
            <div className="space-y-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h4 className="text-lg font-semibold text-gray-900">
                  {getMonthName(currentDate)}
                </h4>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div>
                <div className="grid grid-cols-7 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div
                      key={day}
                      className="text-center text-xs font-semibold text-gray-400 py-1"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentDate).map((date, index) => (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(date)}
                      disabled={!date || isDisabled(date)}
                      className={`
                        relative h-9 rounded-full text-sm font-medium transition-all duration-200
                        ${
                          !date || isDisabled(date)
                            ? 'text-gray-300 cursor-not-allowed'
                            : isSelected(date)
                              ? 'bg-purple-600 text-white shadow-md'
                              : isToday(date)
                                ? 'bg-purple-50 text-purple-700'
                                : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      {date ? date.getDate() : ''}
                      {isToday(date) && !isSelected(date) && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Time Wheel Picker View */
            <div className="space-y-6">
              {/* Selected Date Display */}
              <div className="text-center">
                <div className="text-sm font-medium text-purple-600 uppercase tracking-wide mb-1">
                  {selectedDate?.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {selectedHour}:{selectedMinute.toString().padStart(2, '0')}{' '}
                  {isAM ? 'AM' : 'PM'}
                </div>
              </div>

              {/* Wheel Container */}
              <div className="relative h-48 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                {/* Selection Highlight Bar */}
                <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 h-12 bg-white border-y border-purple-100 shadow-sm z-0 pointer-events-none" />

                {/* Gradient Overlays for 3D effect */}
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-gray-50 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gray-50 to-transparent z-10 pointer-events-none" />

                <div className="relative z-20 flex h-full">
                  <WheelColumn
                    options={hours}
                    value={selectedHour}
                    onChange={setSelectedHour}
                  />

                  {/* Colon Separator */}
                  <div className="flex items-center justify-center pt-1">
                    <span className="text-xl font-bold text-gray-400 pb-1">
                      :
                    </span>
                  </div>

                  <WheelColumn
                    options={minutes}
                    value={selectedMinute}
                    onChange={setSelectedMinute}
                    format={m => m.toString().padStart(2, '0')}
                  />

                  <WheelColumn
                    options={['AM', 'PM']}
                    value={isAM ? 'AM' : 'PM'}
                    onChange={val => setIsAM(val === 'AM')}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          {view === 'time' && (
            <button
              onClick={() => setView('date')}
              className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            >
              Back
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={() => {
                setSelectedDate(null);
                setSelectedHour(12);
                setSelectedMinute(0);
                setIsAM(true);
                setView('date');
                setCurrentDate(new Date());
                onClose();
              }}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            {view === 'time' && (
              <button
                onClick={handleTimeConfirm}
                className="px-6 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-all hover:shadow-lg active:scale-95"
              >
                Set Time
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomDateTimePicker;
