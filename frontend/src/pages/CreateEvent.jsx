import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import { MapPin, Users, Calendar, Clock, ArrowLeft, Image as ImageIcon, Globe } from 'lucide-react';
import ImageSelectionModal from '../components/ImageSelectionModal';
import LocationSearch from '../components/LocationSearch';
import LocationMap from '../components/LocationMap';
import CustomDateTimePicker from '../components/ui/CustomDateTimePicker';
import {
  updateNewEvent,
  resetNewEvent,
  setShowStartDatePicker,
  setShowEndDatePicker,
  createEvent,
  updateEvent,
  setEventToEdit,
} from '../store/eventsSlice';
import { selectNewEvent, selectEventToEdit, selectShowStartDatePicker, selectShowEndDatePicker } from '../store/selectors';

const CreateEvent = () => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const newEvent = useSelector(selectNewEvent);
  const eventToEdit = useSelector(selectEventToEdit);
  const showStartDatePicker = useSelector(selectShowStartDatePicker);
  const showEndDatePicker = useSelector(selectShowEndDatePicker);

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedLocationData, setSelectedLocationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!eventToEdit;

  // Pre-fill form data when in edit mode
  useEffect(() => {
    if (isEditMode && eventToEdit) {
      const startDate = eventToEdit.eventStartDate
        ? new Date(eventToEdit.eventStartDate).toISOString().slice(0, 16)
        : '';
      const endDate = eventToEdit.eventEndDate
        ? new Date(eventToEdit.eventEndDate).toISOString().slice(0, 16)
        : '';

      dispatch(updateNewEvent({
        eventName: eventToEdit.eventName || '',
        eventDescription: eventToEdit.eventDescription || '',
        eventType: eventToEdit.eventType || '',
        eventAccessType: eventToEdit.eventAccessType || '',
        eventJoinCode: eventToEdit.eventJoinCode || '',
        eventStartDate: startDate,
        eventEndDate: endDate,
        eventImage: eventToEdit.eventImage || '',
        eventImageName: eventToEdit.eventImageName || '',
        eventMaxAttendees: eventToEdit.eventMaxAttendees || 1,
        online: {
          eventPlatform: eventToEdit.online?.eventPlatform || '',
          eventLink: eventToEdit.online?.eventLink || '',
        },
        offline: {
          eventLocation: eventToEdit.offline?.eventLocation || '',
          coordinates: eventToEdit.offline?.coordinates || null,
        },
      }));

      // Restore location data for map display
      if (eventToEdit.offline?.coordinates) {
        setSelectedLocationData({
          displayName: eventToEdit.offline?.eventLocation,
          lat: eventToEdit.offline.coordinates.lat,
          lon: eventToEdit.offline.coordinates.lon,
        });
      } else {
        setSelectedLocationData(null);
      }
    } else {
      // Reset location data when in create mode
      setSelectedLocationData(null);
    }

    // Cleanup on unmount
    return () => {
      if (!isEditMode) {
        dispatch(resetNewEvent());
      }
    };
  }, [isEditMode, eventToEdit, dispatch]);

  // Early return if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleImageSelect = image => {
    dispatch(updateNewEvent({
      ...newEvent,
      eventImage: image.src,
      eventImageName: image.name,
    }));
    setShowImageModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEditMode) {
        await dispatch(updateEvent({ eventId: eventToEdit._id, eventData: newEvent })).unwrap();
        showToast('Event updated successfully!', 'success');
      } else {
        await dispatch(createEvent(newEvent)).unwrap();
        showToast('Event created successfully!', 'success');
      }
      
      // Navigate back to events page
      navigate('/events');
    } catch (error) {
      showToast(error || (isEditMode ? 'Failed to update event' : 'Failed to create event'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/events');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditMode ? 'Edit Event' : 'Create New Event'}
        </h1>
        <p className="text-gray-600">
          {isEditMode
            ? 'Update the details of your event'
            : 'Fill in the details to create your event'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={newEvent.eventName || ''}
              onChange={e =>
                dispatch(updateNewEvent({ ...newEvent, eventName: e.target.value }))
              }
              placeholder="Enter event name"
              minLength={10}
              maxLength={40}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={newEvent.eventDescription || ''}
              onChange={e =>
                dispatch(updateNewEvent({
                  ...newEvent,
                  eventDescription: e.target.value,
                }))
              }
              placeholder="Describe your event"
              minLength={10}
              maxLength={300}
              rows={4}
              required
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => dispatch(updateNewEvent({ ...newEvent, eventType: 'offline' }))}
                className={`relative p-4 border-2 rounded-xl transition-all duration-300 group ${
                  newEvent.eventType === 'offline'
                    ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                disabled={isLoading}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      newEvent.eventType === 'offline'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600'
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className={`font-semibold ${
                        newEvent.eventType === 'offline'
                          ? 'text-purple-900'
                          : 'text-gray-900 group-hover:text-purple-900'
                      }`}
                    >
                      Offline Event
                    </h3>
                    <p
                      className={`text-sm ${
                        newEvent.eventType === 'offline'
                          ? 'text-purple-700'
                          : 'text-gray-500 group-hover:text-purple-700'
                      }`}
                    >
                      Physical location
                    </p>
                  </div>
                </div>
                {newEvent.eventType === 'offline' && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => dispatch(updateNewEvent({ ...newEvent, eventType: 'online' }))}
                className={`relative p-4 border-2 rounded-xl transition-all duration-300 group ${
                  newEvent.eventType === 'online'
                    ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                disabled={isLoading}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      newEvent.eventType === 'online'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600'
                    }`}
                  >
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className={`font-semibold ${
                        newEvent.eventType === 'online'
                          ? 'text-purple-900'
                          : 'text-gray-900 group-hover:text-purple-900'
                      }`}
                    >
                      Online Event
                    </h3>
                    <p
                      className={`text-sm ${
                        newEvent.eventType === 'online'
                          ? 'text-purple-700'
                          : 'text-gray-500 group-hover:text-purple-700'
                      }`}
                    >
                      Virtual meeting
                    </p>
                  </div>
                </div>
                {newEvent.eventType === 'online' && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Event Access Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Access Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() =>
                  dispatch(updateNewEvent({
                    ...newEvent,
                    eventAccessType: 'freeForAll',
                    eventJoinCode: '',
                  }))
                }
                className={`relative p-4 border-2 rounded-xl transition-all duration-300 group ${
                  newEvent.eventAccessType === 'freeForAll'
                    ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                disabled={isLoading}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      newEvent.eventAccessType === 'freeForAll'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className={`font-semibold ${
                        newEvent.eventAccessType === 'freeForAll'
                          ? 'text-purple-900'
                          : 'text-gray-900 group-hover:text-purple-900'
                      }`}
                    >
                      Free for All
                    </h3>
                    <p
                      className={`text-sm ${
                        newEvent.eventAccessType === 'freeForAll'
                          ? 'text-purple-700'
                          : 'text-gray-500 group-hover:text-purple-700'
                      }`}
                    >
                      Anyone can join
                    </p>
                  </div>
                </div>
                {newEvent.eventAccessType === 'freeForAll' && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() =>
                  dispatch(updateNewEvent({
                    ...newEvent,
                    eventAccessType: 'codeToJoin',
                  }))
                }
                className={`relative p-4 border-2 rounded-xl transition-all duration-300 group ${
                  newEvent.eventAccessType === 'codeToJoin'
                    ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                disabled={isLoading}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      newEvent.eventAccessType === 'codeToJoin'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600'
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7 7m7-7a6 6 0 00-7-7m7 7H3"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3
                      className={`font-semibold ${
                        newEvent.eventAccessType === 'codeToJoin'
                          ? 'text-purple-900'
                          : 'text-gray-900 group-hover:text-purple-900'
                      }`}
                    >
                      Code to Join
                    </h3>
                    <p
                      className={`text-sm ${
                        newEvent.eventAccessType === 'codeToJoin'
                          ? 'text-purple-700'
                          : 'text-gray-500 group-hover:text-purple-700'
                      }`}
                    >
                      Requires invitation code
                    </p>
                  </div>
                </div>
                {newEvent.eventAccessType === 'codeToJoin' && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Join Code Input */}
          {newEvent.eventAccessType === 'codeToJoin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Join Code <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={newEvent.eventJoinCode || ''}
                onChange={e =>
                  dispatch(updateNewEvent({
                    ...newEvent,
                    eventJoinCode: e.target.value,
                  }))
                }
                placeholder="Enter join code (e.g., EVENT2024)"
                required
              />
            </div>
          )}

          {/* Date Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative p-4 border-2 rounded-xl transition-all duration-300 group ${
                  newEvent.eventStartDate
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                onClick={() => !isLoading && dispatch(setShowStartDatePicker(true))}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      newEvent.eventStartDate
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    {newEvent.eventStartDate ? (
                      <>
                        <h3 className="font-semibold text-purple-900">
                          {new Date(
                            newEvent.eventStartDate
                          ).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </h3>
                        <p className="text-sm text-purple-700">
                          {new Date(
                            newEvent.eventStartDate
                          ).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-900">
                          Select Start Date
                        </h3>
                        <p className="text-sm text-gray-500 group-hover:text-purple-700">
                          Click to choose
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative p-4 border-2 rounded-xl transition-all duration-300 group ${
                  newEvent.eventEndDate
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                onClick={() => !isLoading && dispatch(setShowEndDatePicker(true))}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      newEvent.eventEndDate
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100'
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    {newEvent.eventEndDate ? (
                      <>
                        <h3 className="font-semibold text-purple-900">
                          {new Date(
                            newEvent.eventEndDate
                          ).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </h3>
                        <p className="text-sm text-purple-700">
                          {new Date(
                            newEvent.eventEndDate
                          ).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-900">
                          Select End Date
                        </h3>
                        <p className="text-sm text-gray-500 group-hover:text-purple-700">
                          Click to choose
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conditional Fields */}
          {newEvent.eventType === 'online' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={newEvent.online?.eventPlatform || ''}
                  onChange={e =>
                    dispatch(updateNewEvent({
                      ...newEvent,
                      online: {
                        ...newEvent.online,
                        eventPlatform: e.target.value,
                      },
                    }))
                  }
                  placeholder="e.g., Zoom, Google Meet"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Link <span className="text-red-500">*</span>
                </label>
                <Input
                  type="url"
                  value={newEvent.online?.eventLink || ''}
                  onChange={e =>
                    dispatch(updateNewEvent({
                      ...newEvent,
                      online: {
                        ...newEvent.online,
                        eventLink: e.target.value,
                      },
                    }))
                  }
                  placeholder="https://..."
                  required
                />
              </div>
            </>
          )}

          {newEvent.eventType === 'offline' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <LocationSearch
                  value={newEvent.offline?.eventLocation || ''}
                  onChange={(value) => {
                    dispatch(updateNewEvent({
                      ...newEvent,
                      offline: {
                        ...newEvent.offline,
                        eventLocation: value,
                      },
                    }));
                  }}
                  onLocationSelect={(location) => {
                    setSelectedLocationData(location);
                    if (location) {
                      dispatch(updateNewEvent({
                        ...newEvent,
                        offline: {
                          ...newEvent.offline,
                          eventLocation: location.displayName || location.address,
                          coordinates: {
                            lat: location.lat,
                            lon: location.lon,
                          },
                        },
                      }));
                    } else {
                      dispatch(updateNewEvent({
                        ...newEvent,
                        offline: {
                          ...newEvent.offline,
                          coordinates: null,
                        },
                      }));
                    }
                  }}
                  placeholder="Search for event location..."
                />
              </div>

              {/* Map Display - Always visible */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Preview
                </label>
                <LocationMap location={selectedLocationData} />
              </div>
            </div>
          )}

          {/* Event Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Image <span className="text-red-500">*</span>
            </label>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {newEvent.eventImage ? (
                    <img
                      src={newEvent.eventImage}
                      alt="Event"
                      className="w-20 h-20 rounded-xl object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="primary"
                    size="xs"
                    rounded="full"
                    icon={<ImageIcon className="w-4 h-4" />}
                    className="absolute -bottom-1 -right-1 w-7 h-7"
                    onClick={() => setShowImageModal(true)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    Select Image
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Choose from our curated collection of event images.
                  </p>
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      onClick={() => setShowImageModal(true)}
                      disabled={isLoading}
                      size="sm"
                      className="text-sm"
                    >
                      Select Image
                    </Button>
                    {newEvent.eventImage && (
                      <Button
                        type="button"
                        onClick={() =>
                          dispatch(updateNewEvent({
                            ...newEvent,
                            eventImage: '',
                            eventImageName: '',
                          }))
                        }
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                        className="text-sm"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Max Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Attendees <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={newEvent.eventMaxAttendees || ''}
              onChange={e =>
                dispatch(updateNewEvent({
                  ...newEvent,
                  eventMaxAttendees: parseInt(e.target.value) || 1,
                }))
              }
              placeholder="50"
              min="1"
              required
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            rounded="lg"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            rounded="lg"
          >
            {isLoading
              ? isEditMode
                ? 'Updating Event...'
                : 'Creating Event...'
              : isEditMode
                ? 'Update Event'
                : 'Create Event'}
          </Button>
        </div>
      </form>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <CustomDateTimePicker
          isOpen={showStartDatePicker}
          onClose={() => dispatch(setShowStartDatePicker(false))}
          onSelect={(dateTime) => {
            dispatch(updateNewEvent({
              ...newEvent,
              eventStartDate: dateTime,
            }));
            dispatch(setShowStartDatePicker(false));
          }}
          initialDateTime={newEvent.eventStartDate}
        />
      )}

      {showEndDatePicker && (
        <CustomDateTimePicker
          isOpen={showEndDatePicker}
          onClose={() => dispatch(setShowEndDatePicker(false))}
          onSelect={(dateTime) => {
            dispatch(updateNewEvent({
              ...newEvent,
              eventEndDate: dateTime,
            }));
            dispatch(setShowEndDatePicker(false));
          }}
          initialDateTime={newEvent.eventEndDate}
        />
      )}

      {/* Image Selection Modal */}
      {showImageModal && (
        <ImageSelectionModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          onImageSelect={handleImageSelect}
          selectedImage={
            newEvent.eventImage
              ? { src: newEvent.eventImage, name: newEvent.eventImageName }
              : null
          }
        />
      )}
    </div>
  );
};

export default CreateEvent;

