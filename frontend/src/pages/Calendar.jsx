import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import CalendarEventModal from '../components/CalendarEventModal';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Globe,
} from 'lucide-react';
import {
  selectAllEvents,
  selectUserEvents,
  selectEventsLoading,
} from '../store/selectors';

function Calendar() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // Get events from Redux
  const allEvents = useSelector(selectAllEvents);
  const userEvents = useSelector(selectUserEvents);
  const loading = useSelector(selectEventsLoading);

  // Combine created events and joined events (events user is participating in)
  const calendarEvents = useMemo(() => {
    if (!user) return [];

    // Get all events: created by user + joined by user
    const createdEvents = userEvents || [];
    const joinedEvents = (allEvents || []).filter(event => {
      // Event is joined if user is a participant but not the creator
      const isCreator =
        event.eventCreator?._id === user._id ||
        event.eventCreator?._id === user.id;
      const isParticipant = event.eventParticipants?.some(
        participant =>
          participant._id === user._id || participant._id === user.id
      );
      return !isCreator && isParticipant;
    });

    // Combine and deduplicate by event ID
    const allUserEvents = [...createdEvents, ...joinedEvents];
    const uniqueEvents = Array.from(
      new Map(
        allUserEvents.map(event => [event._id || event.id, event])
      ).values()
    );

    // Transform to calendar format
    return uniqueEvents.map(event => {
      const startDate = new Date(event.eventStartDate);
      const endDate = new Date(event.eventEndDate);
      const now = new Date();

      // Determine status
      let status = 'upcoming';
      if (now >= startDate && now <= endDate) {
        status = 'ongoing';
      } else if (now > endDate) {
        status = 'completed';
      }

      // Format time
      const startTime = startDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      const endTime = endDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      // Get location
      let location = 'TBD';
      if (event.eventType === 'online' && event.online?.eventPlatform) {
        location = `${event.online.eventPlatform} - ${event.online.eventLink || 'Link TBD'}`;
      } else if (
        event.eventType === 'offline' &&
        event.offline?.eventLocation
      ) {
        location = event.offline.eventLocation;
      }

      // Determine category/color based on event type
      const category =
        event.eventType === 'online' ? 'Technology' : 'Networking';

      return {
        id: event._id || event.id,
        title: event.eventName,
        description: event.eventDescription,
        date: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
        startDate: startDate,
        endDate: endDate,
        time: `${startTime} - ${endTime}`,
        location: location,
        category: category,
        status: status,
        attendees: event.eventParticipants?.length || 0,
        maxAttendees: event.eventMaxAttendees || 0,
        eventType: event.eventType,
        eventAccessType: event.eventAccessType,
        isCreator:
          event.eventCreator?._id === user._id ||
          event.eventCreator?._id === user.id,
        event: event, // Store full event object for modal
      };
    });
  }, [allEvents, userEvents, user]);

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
    // Normalize the input date to just year, month, day (no time)
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth();
    const dateDay = date.getDate();
    const normalizedDate = new Date(dateYear, dateMonth, dateDay);

    return calendarEvents.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);

      // Normalize event dates to just year, month, day (no time)
      const startYear = eventStart.getFullYear();
      const startMonth = eventStart.getMonth();
      const startDay = eventStart.getDate();
      const normalizedStart = new Date(startYear, startMonth, startDay);

      const endYear = eventEnd.getFullYear();
      const endMonth = eventEnd.getMonth();
      const endDay = eventEnd.getDate();
      const normalizedEnd = new Date(endYear, endMonth, endDay);

      // Check if the date falls within the event's date range (inclusive)
      return (
        normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd
      );
    });
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

  const handleEventClick = (event, e) => {
    e.stopPropagation(); // Prevent day cell click
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const isToday = date => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getEventColor = event => {
    // Use event type to determine color
    if (event.eventType === 'online') {
      return 'bg-blue-500';
    } else {
      return 'bg-purple-500';
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
            className={`min-h-[80px] bg-white p-1.5 ${
              !day.isCurrentMonth ? 'text-gray-400' : ''
            } ${isToday(day.date) ? 'bg-purple-50 border-2 border-purple-200' : ''}`}
          >
            <div className="text-xs font-medium mb-0.5">
              {day.date.getDate()}
            </div>
            <div className="space-y-0.5">
              {day.events.slice(0, 2).map(event => (
                <div
                  key={event.id}
                  onClick={e => handleEventClick(event, e)}
                  className={`text-[10px] px-1 py-0.5 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity ${getEventColor(event)}`}
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
                  onClick={e => handleEventClick(event, e)}
                  className={`text-[10px] px-1 py-0.5 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity ${getEventColor(event)}`}
                  title={event.title}
                >
                  {event.title}
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

          <Button
            variant="outline"
            size="sm"
            rounded="lg"
            onClick={() => setCurrentDate(new Date())}
            className="text-sm"
          >
            Today
          </Button>
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
                {calendarEvents.length}
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
                  calendarEvents.filter(e => {
                    const eventDate = new Date(e.startDate);
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
                {calendarEvents.reduce((sum, e) => sum + e.attendees, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      <CalendarEventModal
        isOpen={showEventModal}
        onClose={handleCloseModal}
        event={selectedEvent}
      />
    </div>
  );
}

export default Calendar;
