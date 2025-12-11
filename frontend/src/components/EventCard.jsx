import React, { useRef, useState } from 'react';
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  Trash2,
  Lock,
  Globe,
  Code,
  ChevronRight,
  Edit3,
} from 'lucide-react';
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'framer-motion';

const springValues = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

const EventCard = ({
  event,
  isUserEvent = false,
  user = null,
  userEvents = [],
  onEditEvent,
  onDeleteEvent,
  onJoinLeaveEvent,
  showActions = true,
}) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const opacity = useSpring(0);

  const [lastY, setLastY] = useState(0);
  const [showSecondaryDetails, setShowSecondaryDetails] = useState(false);
  // FIX: State to manage the visibility of the full description tooltip
  const [showFullDescription, setShowFullDescription] = useState(false);

  function handleMouse(e) {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;

    const rotationX = (offsetY / (rect.height / 2)) * -14;
    const rotationY = (offsetX / (rect.width / 2)) * 14;

    rotateX.set(rotationX);
    rotateY.set(rotationY);

    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);

    const velocityY = offsetY - lastY;
    setLastY(offsetY);
  }

  function handleMouseEnter() {
    opacity.set(1);
  }

  function handleMouseLeave() {
    opacity.set(0);
    rotateX.set(0);
    rotateY.set(0);
  }

  const toggleSecondaryDetails = () => {
    setShowSecondaryDetails(!showSecondaryDetails);
  };

  const getStatusColor = status => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = status => {
    switch (status) {
      case 'upcoming':
        return 'Upcoming';
      case 'ongoing':
        return 'Ongoing';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  // Check if user has joined this event (but not if they created it)
  const isUserJoined =
    user &&
    event.eventParticipants?.some(
      participant => participant._id === user._id
    ) &&
    event.eventCreator._id !== user._id;

  return (
    <div className="relative max-w-sm sm:max-w-md md:max-w-lg lg:max-w-4xl mx-auto">
      <div
        ref={ref}
        className="bg-white border border-gray-200 rounded-lg hover:shadow-xl transition-all duration-300 overflow-hidden [perspective:800px]"
        onMouseMove={handleMouse}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Mobile/Tablet Card Layout (lg:hidden) */}
        <div className="lg:hidden">
          {/* Square Image on Top */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] md:aspect-square lg:aspect-square bg-gray-100 overflow-hidden">
            <img
              src={
                event.eventImage ||
                'https://via.placeholder.com/400x400?text=Event'
              }
              alt={event.eventName}
              className="w-full h-full object-cover"
            />
            {/* Status Badge - Overlay on Image */}
            <div className="absolute top-4 left-4">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  'upcoming'
                )}`}
              >
                {getStatusText('upcoming')}
              </span>
            </div>
            {/* Action Buttons - Overlay on Image */}
            {isUserEvent &&
              showActions &&
              user &&
              event?.eventCreator?._id === user._id && (
                <div className="absolute top-4 right-4 flex space-x-1">
                  <button
                    onClick={() => onEditEvent(event)}
                    className="p-2 bg-white/90 backdrop-blur-sm text-blue-400 hover:text-blue-600 transition-colors hover:bg-white rounded-lg shadow-sm"
                    title="Edit Event"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteEvent(event)}
                    className="p-2 bg-white/90 backdrop-blur-sm text-red-400 hover:text-red-600 transition-colors hover:bg-white rounded-lg shadow-sm"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
          </div>

          {/* Primary Details Below Image */}
          <div className="p-4">
            {/* Event Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {event.eventName}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {event.eventDescription}
            </p>

            {/* Main Details Section */}
            <div className="space-y-3 mb-4">
              {/* Start Date */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center p-2 bg-blue-50 rounded-lg w-10 h-10 flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500 font-medium">Starts</p>
                  <p className="text-gray-900 font-semibold">
                    {event.eventStartDate
                      ? new Date(event.eventStartDate).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )
                      : 'Date not set'}{' '}
                    at{' '}
                    {event.eventStartDate
                      ? new Date(event.eventStartDate).toLocaleTimeString(
                          'en-US',
                          {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          }
                        )
                      : 'Time not set'}
                  </p>
                </div>
              </div>

              {/* End Date */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center p-2 bg-red-50 rounded-lg w-10 h-10 flex-shrink-0">
                  <Clock className="w-5 h-5 text-red-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500 font-medium">Ends</p>
                  <p className="text-gray-900 font-semibold">
                    {event.eventEndDate
                      ? new Date(event.eventEndDate).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )
                      : 'Date not set'}{' '}
                    at{' '}
                    {event.eventEndDate
                      ? new Date(event.eventEndDate).toLocaleTimeString(
                          'en-US',
                          {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          }
                        )
                      : 'Time not set'}
                  </p>
                </div>
              </div>

              {/* Access Type */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center p-2 bg-indigo-50 rounded-lg w-10 h-10 flex-shrink-0">
                  {event.eventAccessType === 'codeToJoin' ? (
                    <Lock className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Globe className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500 font-medium">Access</p>
                  <p className="text-gray-900 font-semibold">
                    {event.eventAccessType === 'codeToJoin'
                      ? 'Code Protected'
                      : 'Free for All'}
                  </p>
                </div>
              </div>

              {/* Creator */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center p-2 bg-orange-50 rounded-lg w-10 h-10 flex-shrink-0">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-500 font-medium">Creator</p>
                  <p className="text-gray-900 font-semibold">
                    {isUserEvent
                      ? user?.name || 'You'
                      : event.eventCreator?.name || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* Expand/Collapse Button */}
            <button
              onClick={toggleSecondaryDetails}
              className="w-full flex items-center justify-center space-x-2 py-2 text-gray-500 hover:text-purple-600 transition-colors hover:bg-purple-50 rounded-lg"
            >
              <span className="text-sm font-medium">
                {showSecondaryDetails ? 'Hide Details' : 'Show Details'}
              </span>
              <motion.div
                animate={{ rotate: showSecondaryDetails ? 90 : 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            </button>
          </div>
        </div>

        {/* Desktop Layout (hidden lg:flex) */}
        <div className="hidden lg:flex items-stretch">
          {/* Left Side - Full Height Event Image with Tilt Effect */}
          <div className="flex-shrink-0">
            <motion.div
              className="relative w-64 h-64 bg-gray-100 rounded-l-lg overflow-hidden [transform-style:preserve-3d]"
              style={{
                rotateX,
                rotateY,
              }}
            >
              <img
                src={
                  event.eventImage ||
                  'https://via.placeholder.com/200x200?text=Event'
                }
                alt={event.eventName}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* Right Side - All Event Details */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between h-full">
              <div className="flex-1 min-w-0">
                {/* Event Title, Status Badge, and Description */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 truncate flex-1">
                    {event.eventName}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        'upcoming'
                      )}`}
                    >
                      {getStatusText('upcoming')}
                    </span>
                    {/* Action Buttons - Top Right */}
                    {isUserEvent &&
                      showActions &&
                      user &&
                      event?.eventCreator?._id === user._id && (
                        <div className="flex space-x-1">
                          {/* Edit Button */}
                          <button
                            onClick={() => onEditEvent(event)}
                            className="p-2 text-blue-400 hover:text-blue-600 transition-colors hover:bg-blue-50 rounded-lg"
                            title="Edit Event"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          {/* Delete Button */}
                          <button
                            onClick={() => onDeleteEvent(event)}
                            className="p-2 text-red-400 hover:text-red-600 transition-colors hover:bg-red-50 rounded-lg"
                            title="Delete Event"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                  </div>
                </div>

                {/* FIX: Description with Hover Tooltip */}
                <div className="relative">
                  <p
                    className="text-gray-600 text-base line-clamp-1 mt-4 mb-4 cursor-pointer" // Changed to single line
                    onMouseEnter={() => setShowFullDescription(true)}
                    onMouseLeave={() => setShowFullDescription(false)}
                  >
                    {event.eventDescription}
                  </p>
                  <AnimatePresence>
                    {showFullDescription && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute top-full left-0 mt-2 w-max max-w-md p-4 bg-white/90 backdrop-blur-sm text-gray-800 text-sm rounded-lg shadow-2xl border border-gray-200 z-[9999] pointer-events-none"
                        style={{ wordWrap: 'break-word' }}
                      >
                        {event.eventDescription}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* FIX: Reduced gap from gap-12 to gap-4 */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="col-span-2 space-y-4">
                    {/* Start Date & Time Combined */}
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center justify-center p-2 bg-blue-50 rounded-lg w-10 h-10 flex-shrink-0">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-500 font-medium">
                          Starts
                        </p>
                        <p className="text-gray-900 font-semibold whitespace-nowrap">
                          {event.eventStartDate
                            ? new Date(event.eventStartDate).toLocaleDateString(
                                'en-US',
                                {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )
                            : 'Date not set'}{' '}
                          at{' '}
                          {event.eventStartDate
                            ? new Date(event.eventStartDate).toLocaleTimeString(
                                'en-US',
                                {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true,
                                }
                              )
                            : 'Time not set'}
                        </p>
                      </div>
                    </div>

                    {/* End Date & Time Combined */}
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center justify-center p-2 bg-red-50 rounded-lg w-10 h-10 flex-shrink-0">
                        <Clock className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-500 font-medium">
                          Ends
                        </p>
                        <p className="text-gray-900 font-semibold whitespace-nowrap">
                          {event.eventEndDate
                            ? new Date(event.eventEndDate).toLocaleDateString(
                                'en-US',
                                {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )
                            : 'Date not set'}{' '}
                          at{' '}
                          {event.eventEndDate
                            ? new Date(event.eventEndDate).toLocaleTimeString(
                                'en-US',
                                {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true,
                                }
                              )
                            : 'Time not set'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Access Type */}
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center justify-center p-2 bg-indigo-50 rounded-lg w-10 h-10 flex-shrink-0">
                        {event.eventAccessType === 'codeToJoin' ? (
                          <Lock className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <Globe className="w-5 h-5 text-indigo-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-500 font-medium">
                          Access
                        </p>
                        <p className="text-sm text-gray-900 font-semibold">
                          {event.eventAccessType === 'codeToJoin'
                            ? 'Code Protected'
                            : 'Free for All'}
                        </p>
                      </div>
                    </div>

                    {/* Event Creator */}
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center justify-center p-2 bg-orange-50 rounded-lg w-10 h-10 flex-shrink-0">
                        <Users className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-500 font-medium">
                          Creator
                        </p>
                        <p className="text-sm text-gray-900 font-semibold">
                          {isUserEvent
                            ? user?.name || 'You'
                            : event.eventCreator?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Details Section - Responsive */}
        <AnimatePresence>
          {showSecondaryDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{
                opacity: 1,
                height: 'auto',
                scale: 1,
                transition: {
                  opacity: { duration: 0.2, ease: 'easeOut' },
                  height: { duration: 0.4, ease: 'easeInOut' },
                  scale: { duration: 0.3, ease: 'easeOut' },
                },
              }}
              exit={{
                opacity: 0,
                height: 0,
                scale: 0.95,
                transition: {
                  opacity: { duration: 0.15, ease: 'easeIn' },
                  height: { duration: 0.3, ease: 'easeInOut' },
                  scale: { duration: 0.2, ease: 'easeIn' },
                },
              }}
              className="overflow-hidden"
            >
              {/* Clear separator line merged with image bottom edge */}
              <div className="border-t-2 border-gray-200 -mx-4 mb-6"></div>

              <div className="space-y-3 px-4">
                {/* Mobile: Stack vertically, Desktop: Grid layout */}
                <div
                  className={`grid gap-3 ${
                    event.eventType === 'online'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  }`}
                >
                  {/* Event Type - 1 column */}
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                    <div className="flex items-center p-1 sm:p-2 bg-purple-50 rounded-lg flex-shrink-0">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">
                        Event Type
                      </p>
                      <p className="text-sm sm:text-base text-gray-900 font-semibold">
                        {event.eventType === 'online'
                          ? 'Online Event'
                          : 'Offline Event'}
                      </p>
                    </div>
                  </div>

                  {/* Platform (for online events) - 1 column */}
                  {event.eventType === 'online' && (
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                      <div className="flex items-center p-1 sm:p-2 bg-blue-50 rounded-lg flex-shrink-0">
                        <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">
                          Platform
                        </p>
                        <p className="text-sm sm:text-base text-gray-900 font-semibold">
                          {event.online?.eventPlatform || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Meeting Link (for online events) - 1 column */}
                  {event.eventType === 'online' && (
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                      <div className="flex items-center p-1 sm:p-2 bg-green-50 rounded-lg flex-shrink-0">
                        <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">
                          Meeting Link
                        </p>
                        <p className="text-sm sm:text-base text-blue-600 font-medium">
                          Soon be revealed
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Attendees - 1 column */}
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 sm:ml-0">
                    <div className="flex items-center p-1 sm:p-2 bg-orange-50 rounded-lg flex-shrink-0">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">
                        Attendees
                      </p>
                      <p className="text-sm sm:text-base text-gray-900 font-semibold">
                        {event.eventParticipants?.length || 0} /{' '}
                        {event.eventMaxAttendees}
                      </p>
                    </div>
                  </div>

                  {/* Location (for offline events) - 3 columns */}
                  {event.eventType === 'offline' && (
                    <div className="col-span-3 flex items-center space-x-1">
                      <div className="flex items-center p-1 bg-purple-50 rounded-lg">
                        <MapPin className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-500 font-medium">
                          Location
                        </p>
                        <p className="text-gray-900 font-semibold truncate">
                          {event.offline?.eventLocation || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Second Row: Progress Bar spanning full width */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500 font-medium">
                      Progress
                    </p>
                    <p className="text-sm text-gray-900 font-semibold">
                      {Math.round(
                        ((event.eventParticipants?.length || 0) /
                          event.eventMaxAttendees) *
                          100
                      )}
                      %
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          ((event.eventParticipants?.length || 0) /
                            event.eventMaxAttendees) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Spacing beneath progress bar */}
                <div className="h-4"></div>

                {/* Join Code (if applicable) */}
                {event.eventAccessType === 'codeToJoin' &&
                  event.eventJoinCode && (
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center p-2 bg-yellow-50 rounded-lg">
                        <Code className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">
                          Join Code
                        </p>
                        <p className="text-gray-900 font-mono bg-gray-100 px-3 py-1 rounded-lg text-sm">
                          {event.eventJoinCode}
                        </p>
                      </div>
                    </div>
                  )}

                {/* Join/Leave Button - Show for events the user can join/leave */}
                {showActions &&
                  user &&
                  event?.eventCreator?._id !== user._id && (
                    <div className="pt-2 pb-6">
                      <button
                        onClick={() => onJoinLeaveEvent(event)}
                        className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-lg button-animate ${
                          isUserJoined
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
                        }`}
                      >
                        {isUserJoined ? 'Leave Event' : 'Join Event'}
                      </button>
                    </div>
                  )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cursor Name Effect - Popup on hover */}
        <motion.div
          className="pointer-events-none absolute left-0 top-0 rounded-[4px] bg-white px-[10px] py-[4px] text-[10px] text-[#2d2d2d] z-[3] hidden sm:block shadow-lg border border-gray-200"
          style={{
            x,
            y,
            opacity,
          }}
        >
          {event.eventName}
        </motion.div>
      </div>

      {/* Desktop Arrow button */}
      <div className="absolute right-0 top-32 transform -translate-y-1/2 translate-x-1/2 z-10 hidden lg:block">
        <button
          onClick={toggleSecondaryDetails}
          className="p-2 text-gray-400 hover:text-purple-500 transition-all duration-200 hover:bg-purple-50 rounded-full group border border-gray-200 bg-white shadow-sm"
          title={showSecondaryDetails ? 'Hide Details' : 'Show Details'}
        >
          <motion.div
            animate={{ rotate: showSecondaryDetails ? 90 : 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="group-hover:text-purple-600 transition-colors duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.div>
        </button>
      </div>
    </div>
  );
};

export default EventCard;
