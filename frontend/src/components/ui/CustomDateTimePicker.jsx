import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';

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
  const [view, setView] = useState('date'); // 'date' or 'time'
  const modalRef = useRef(null);

  // Initialize with value only when modal first opens
  useEffect(() => {
    if (isOpen && value) {
      const date = new Date(value);
      setSelectedDate(date);
      setSelectedHour(date.getHours());
      setCurrentDate(date);
    }
  }, [isOpen]); // Only depend on isOpen, not value

  // Reset data when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset all data when modal closes
      setSelectedDate(null);
      setSelectedHour(12);
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
    console.log('handleTimeConfirm called', {
      selectedDate,
      selectedHour,
      onSelect,
      onChange,
    });

    if (selectedDate) {
      const finalDate = new Date(selectedDate);
      finalDate.setHours(selectedHour);
      finalDate.setMinutes(0);
      finalDate.setSeconds(0);
      finalDate.setMilliseconds(0);

      console.log('Final date created:', finalDate.toISOString());

      // Use onSelect if provided, otherwise fall back to onChange
      const callback = onSelect || onChange;
      if (callback) {
        console.log('Calling callback with:', finalDate.toISOString());
        callback(finalDate.toISOString());
      } else {
        console.error(
          'No callback provided! onSelect:',
          onSelect,
          'onChange:',
          onChange
        );
      }
      onClose();
    } else {
      console.error('No selectedDate available');
    }
  };

  const navigateMonth = direction => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 animate-in slide-in-from-bottom-4 duration-300 border border-gray-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-purple-50 rounded-t-2xl">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            {view === 'date' ? (
              <>
                <Calendar className="w-5 h-5 text-purple-600" />
                Select Date
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 text-purple-600" />
                Select Time
              </>
            )}
          </h3>
          <button
            onClick={() => {
              // Reset data before closing
              setSelectedDate(null);
              setSelectedHour(12);
              setView('date');
              setCurrentDate(new Date());
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white hover:shadow-md transition-all duration-200 group"
          >
            <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {view === 'date' ? (
            /* Date Picker View */
            <div className="space-y-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 rounded-xl hover:bg-purple-50 transition-all duration-200 hover:scale-105 group"
                >
                  <ChevronLeft className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                </button>
                <h4 className="text-lg font-semibold text-purple-700">
                  {getMonthName(currentDate)}
                </h4>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 rounded-xl hover:bg-purple-50 transition-all duration-200 hover:scale-105 group"
                >
                  <ChevronRight className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div
                    key={day}
                    className="text-center text-sm font-semibold text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {getDaysInMonth(currentDate).map((date, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    disabled={!date || isDisabled(date)}
                    className={`
                      relative p-3 rounded-2xl text-sm font-medium transition-all duration-300 hover:scale-105
                      ${
                        !date || isDisabled(date)
                          ? 'text-gray-300 cursor-not-allowed'
                          : isSelected(date)
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 transform scale-105'
                            : isToday(date)
                              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 shadow-md'
                              : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700 hover:shadow-md'
                      }
                    `}
                  >
                    {date ? date.getDate() : ''}
                    {isToday(date) && !isSelected(date) && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Time Picker View */
            <div className="space-y-6">
              {/* Time Display */}
              <div className="text-center bg-purple-50 rounded-2xl p-6 border border-purple-200">
                <div className="text-4xl font-bold text-purple-700 mb-2">
                  {selectedHour === 0
                    ? '12'
                    : selectedHour <= 12
                      ? selectedHour
                      : selectedHour - 12}
                  :00
                </div>
                <div className="text-sm text-gray-600 font-medium mb-2">
                  {selectedDate?.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="text-lg font-semibold text-purple-600">
                  {selectedHour === 0
                    ? 'Midnight (12:00 AM)'
                    : selectedHour === 12
                      ? 'Noon (12:00 PM)'
                      : selectedHour < 12
                        ? `${selectedHour}:00 AM`
                        : `${selectedHour}:00 PM`}
                </div>
              </div>

              {/* Hour Selection */}
              <div className="text-center">
                <div className="grid grid-cols-8 gap-2">
                  {hours.map(hour => (
                    <button
                      key={hour}
                      onClick={() => setSelectedHour(hour)}
                      className={`
                        p-3 rounded-xl text-base font-medium transition-all duration-200 hover:scale-105
                        ${
                          selectedHour === hour
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-200 transform scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700 hover:shadow-sm'
                        }
                      `}
                    >
                      {hour.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          {view === 'time' && (
            <button
              onClick={() => setView('date')}
              className="px-4 py-2 text-purple-600 hover:text-purple-700 transition-colors duration-200 font-medium hover:scale-105"
            >
              ← Back to Date
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={() => {
                // Reset data before closing
                setSelectedDate(null);
                setSelectedHour(12);
                setView('date');
                setCurrentDate(new Date());
                onClose();
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 hover:scale-105"
            >
              Cancel
            </button>
            {view === 'time' && (
              <button
                onClick={handleTimeConfirm}
                className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg hover:scale-105 transform"
              >
                Confirm
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomDateTimePicker;
