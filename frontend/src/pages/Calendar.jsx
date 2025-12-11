import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';

function Calendar() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // Events array - will be populated from API calls
  const mockEvents = [];

  useEffect(() => {
    // Load events from API
    // TODO: Replace with actual API call
    setEvents(mockEvents);
  }, []);

  // Early return if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const getDaysInMonth = date => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // Add previous month's days
    for (let i = startingDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        events: getEventsForDate(prevDate),
      });
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        events: getEventsForDate(currentDate),
      });
    }

    // Add next month's days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        events: getEventsForDate(nextDate),
      });
    }

    return days;
  };

  const getEventsForDate = date => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const getWeekDays = () => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  };

  const getMonthName = date => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = direction => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const navigateWeek = direction => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + direction * 7);
      return newDate;
    });
  };

  const handleDateClick = day => {
    setSelectedDate(day);
    if (day.events.length > 0) {
      setShowEventModal(true);
    }
  };

  const isToday = date => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getEventColor = category => {
    switch (category) {
      case 'Technology':
        return 'bg-blue-500';
      case 'Education':
        return 'bg-green-500';
      case 'Networking':
        return 'bg-purple-500';
      case 'Social':
        return 'bg-pink-500';
      case 'Business':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {getWeekDays().map(day => (
          <div
            key={day}
            className="bg-gray-50 p-1.5 text-center text-xs font-medium text-gray-700"
          >
            {day}
          </div>
        ))}

        {days.map((day, index) => (
          <div
            key={index}
            onClick={() => handleDateClick(day)}
            className={`min-h-[80px] bg-white p-1.5 cursor-pointer hover:bg-gray-50 transition-colors ${
              !day.isCurrentMonth ? 'text-gray-400' : ''
            } ${isToday(day.date) ? 'bg-purple-50 border-2 border-purple-200' : ''}`}
          >
            <div className="text-xs font-medium mb-0.5">{day.date.getDate()}</div>
            <div className="space-y-0.5">
              {day.events.slice(0, 2).map(event => (
                <div
                  key={event.id}
                  className={`text-[10px] px-1 py-0.5 rounded text-white truncate ${getEventColor(event.category)}`}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
              {day.events.length > 2 && (
                <div className="text-[10px] text-gray-500">
                  +{day.events.length - 2} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push({
        date,
        events: getEventsForDate(date),
      });
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {weekDays.map((day, index) => (
          <div key={index} className="bg-white min-h-[300px]">
            <div
              className={`p-1.5 text-center border-b ${
                isToday(day.date) ? 'bg-purple-100 font-semibold' : 'bg-gray-50'
              }`}
            >
              <div className="text-xs font-medium">{getWeekDays()[index]}</div>
              <div className="text-base">{day.date.getDate()}</div>
            </div>
            <div className="p-1.5 space-y-1">
              {day.events.map(event => (
                <div
                  key={event.id}
                  className={`text-[10px] px-1.5 py-1 rounded text-white ${getEventColor(event.category)}`}
                >
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="text-[10px] opacity-90">{event.time}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
              Event Calendar
            </h1>
            <p className="text-base text-gray-600">
              View and manage your events in calendar format
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setViewMode(viewMode === 'month' ? 'week' : 'month')
              }
              className="text-sm"
            >
              {viewMode === 'month' ? 'Week View' : 'Month View'}
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() =>
                viewMode === 'month' ? navigateMonth(-1) : navigateWeek(-1)
              }
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {getMonthName(currentDate)}
            </h2>
            <button
              onClick={() =>
                viewMode === 'month' ? navigateMonth(1) : navigateWeek(1)
              }
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {viewMode === 'month' ? renderMonthView() : renderWeekView()}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <CalendarIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Total Events</p>
              <p className="text-xl font-bold text-gray-900">
                {events.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">This Month</p>
              <p className="text-xl font-bold text-gray-900">
                {
                  events.filter(e => {
                    const eventDate = new Date(e.date);
                    return (
                      eventDate.getMonth() === currentDate.getMonth() &&
                      eventDate.getFullYear() === currentDate.getFullYear()
                    );
                  }).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">
                Total Attendees
              </p>
              <p className="text-xl font-bold text-gray-900">
                {events.reduce((sum, e) => sum + e.attendees, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                Events on {selectedDate.date.toLocaleDateString()}
              </h2>
            </div>
            <div className="p-4">
              {selectedDate.events.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-3">
                  No events scheduled for this date
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedDate.events.map(event => (
                    <div
                      key={event.id}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
                            {event.title}
                          </h3>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center">
                              <Clock className="w-3.5 h-3.5 mr-1.5" />
                              {event.time}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-3.5 h-3.5 mr-1.5" />
                              {event.location}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-3.5 h-3.5 mr-1.5" />
                              {event.attendees}/{event.maxAttendees} attendees
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                            event.status === 'upcoming'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
