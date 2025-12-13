import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import {
  MapPin,
  Users,
  Calendar,
  Clock,
  Image as ImageIcon,
  Globe,
  Info,
  Settings as SettingsIcon,
  Lock,
  UserPlus,
  FileText,
  Link as LinkIcon,
} from 'lucide-react';
import ImageSelectionModal from './ImageSelectionModal';
import LocationSearch from './LocationSearch';
import LocationMap from './LocationMap';
import CustomDateTimePicker from './ui/CustomDateTimePicker';
import {
  updateNewEvent,
  resetNewEvent,
  setShowStartDatePicker,
  setShowEndDatePicker,
  createEvent,
  updateEvent,
  setEventToEdit,
  setActiveTab,
} from '../store/eventsSlice';
import {
  selectNewEvent,
  selectEventToEdit,
  selectShowStartDatePicker,
  selectShowEndDatePicker,
} from '../store/selectors';

const CreateEventForm = ({ onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const newEvent = useSelector(selectNewEvent);
  const eventToEdit = useSelector(selectEventToEdit);
  const showStartDatePicker = useSelector(selectShowStartDatePicker);
  const showEndDatePicker = useSelector(selectShowEndDatePicker);

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedLocationData, setSelectedLocationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!eventToEdit;
  const [errors, setErrors] = useState({});

  // Pre-fill form data when in edit mode
  useEffect(() => {
    if (isEditMode && eventToEdit) {
      const startDate = eventToEdit.eventStartDate
        ? new Date(eventToEdit.eventStartDate).toISOString().slice(0, 16)
        : '';
      const endDate = eventToEdit.eventEndDate
        ? new Date(eventToEdit.eventEndDate).toISOString().slice(0, 16)
        : '';

      dispatch(
        updateNewEvent({
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
        })
      );

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
    dispatch(
      updateNewEvent({
        ...newEvent,
        eventImage: image.src,
        eventImageName: image.name,
      })
    );
    setShowImageModal(false);
  };

  const validate = () => {
    const validationErrors = {};
    const name = newEvent.eventName?.trim() || '';
    const desc = newEvent.eventDescription?.trim() || '';

    if (!name) {
      validationErrors.eventName = 'Event name is required';
    } else if (name.length < 10) {
      validationErrors.eventName = 'Event name must be at least 10 characters';
    } else if (name.length > 40) {
      validationErrors.eventName = 'Event name cannot exceed 40 characters';
    }

    if (!desc) {
      validationErrors.eventDescription = 'Description is required';
    } else if (desc.length < 10) {
      validationErrors.eventDescription =
        'Description must be at least 10 characters';
    } else if (desc.length > 300) {
      validationErrors.eventDescription =
        'Description cannot exceed 300 characters';
    }

    if (!newEvent.eventType) {
      validationErrors.eventType = 'Please select an event type';
    }

    if (!newEvent.eventAccessType) {
      validationErrors.eventAccessType = 'Please select an access type';
    }

    if (newEvent.eventAccessType === 'codeToJoin') {
      const joinCode = newEvent.eventJoinCode?.trim() || '';
      if (!joinCode) {
        validationErrors.eventJoinCode = 'Join code is required';
      } else if (joinCode.length < 4 || joinCode.length > 20) {
        validationErrors.eventJoinCode = 'Join code must be 4-20 characters';
      }
    }

    if (!newEvent.eventStartDate) {
      validationErrors.eventStartDate = 'Start date and time are required';
    }
    if (!newEvent.eventEndDate) {
      validationErrors.eventEndDate = 'End date and time are required';
    } else if (
      newEvent.eventStartDate &&
      new Date(newEvent.eventEndDate) <= new Date(newEvent.eventStartDate)
    ) {
      validationErrors.eventEndDate = 'End date must be after start date';
    }

    if (newEvent.eventType === 'online') {
      const platform = newEvent.online?.eventPlatform?.trim() || '';
      const link = newEvent.online?.eventLink?.trim() || '';
      if (!platform) {
        validationErrors.eventPlatform = 'Platform is required';
      }
      if (!link) {
        validationErrors.eventLink = 'Event link is required';
      }
    }

    if (newEvent.eventType === 'offline') {
      const location = newEvent.offline?.eventLocation?.trim() || '';
      if (!location) {
        validationErrors.eventLocation = 'Location is required';
      }
      if (!newEvent.offline?.coordinates) {
        validationErrors.eventCoordinates =
          'Please select a location from the search results';
      }
    }

    if (!newEvent.eventImage) {
      validationErrors.eventImage = 'Event image is required';
    }

    if (!newEvent.eventMaxAttendees || newEvent.eventMaxAttendees < 1) {
      validationErrors.eventMaxAttendees =
        'Maximum attendees must be at least 1';
    }

    return validationErrors;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      if (isEditMode) {
        await dispatch(
          updateEvent({ eventId: eventToEdit._id, eventData: newEvent })
        ).unwrap();
        showToast('Event updated successfully!', 'success');
        dispatch(setEventToEdit(null));
      } else {
        // Automatically include organization ID from Redux
        const eventDataWithOrganization = {
          ...newEvent,
          eventOrganization: organization?._id,
        };
        await dispatch(createEvent(eventDataWithOrganization)).unwrap();
        showToast('Event created successfully!', 'success');
        dispatch(resetNewEvent());
      }

      // Switch to myEvents tab and call onSuccess callback
      dispatch(setActiveTab('myEvents'));
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      showToast(
        error ||
          (isEditMode ? 'Failed to update event' : 'Failed to create event'),
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };
  const renderError = field =>
    errors[field] ? (
      <p className="text-xs text-red-600 mt-1.5">{errors[field]}</p>
    ) : null;

  const handleCancel = () => {
    dispatch(setEventToEdit(null));
    dispatch(resetNewEvent());
    dispatch(setActiveTab('myEvents'));
  };

  // Section Header Component
  const SectionHeader = ({ icon: Icon, title, description }) => (
    <div className="mb-6">
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <SectionHeader
            icon={FileText}
            title="Basic Information"
            description="Provide the essential details about your event"
          />

          <div className="space-y-6">
            {/* Event Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={newEvent.eventName || ''}
                onChange={e => {
                  if (errors.eventName) {
                    setErrors(prev => ({ ...prev, eventName: '' }));
                  }
                  dispatch(
                    updateNewEvent({ ...newEvent, eventName: e.target.value })
                  );
                }}
                placeholder="Enter a descriptive event name"
                className="text-base"
              />
              {renderError('eventName')}
              <p className="text-xs text-gray-500 mt-1.5">10-40 characters</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={newEvent.eventDescription || ''}
                onChange={e => {
                  if (errors.eventDescription) {
                    setErrors(prev => ({ ...prev, eventDescription: '' }));
                  }
                  dispatch(
                    updateNewEvent({
                      ...newEvent,
                      eventDescription: e.target.value,
                    })
                  );
                }}
                placeholder="Describe what your event is about, what attendees can expect, and any important details..."
                rows={5}
                className="text-base"
              />
              {renderError('eventDescription')}
              <p className="text-xs text-gray-500 mt-1.5">
                {newEvent.eventDescription?.length || 0}/300 characters
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Event Type & Access */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <SectionHeader
            icon={SettingsIcon}
            title="Event Type & Access"
            description="Choose how your event will be conducted and who can join"
          />

          <div className="space-y-6">
            {/* Event Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Event Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    dispatch(
                      updateNewEvent({ ...newEvent, eventType: 'offline' })
                    )
                  }
                  className={`relative p-5 border-2 rounded-xl transition-all duration-300 group ${
                    newEvent.eventType === 'offline'
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg shadow-purple-200'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                  } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  disabled={isLoading}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                        newEvent.eventType === 'offline'
                          ? 'bg-purple-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600'
                      }`}
                    >
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3
                        className={`font-bold text-base mb-1 ${
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
                        Physical location with in-person attendance
                      </p>
                    </div>
                  </div>
                  {newEvent.eventType === 'offline' && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
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
                    dispatch(
                      updateNewEvent({ ...newEvent, eventType: 'online' })
                    )
                  }
                  className={`relative p-5 border-2 rounded-xl transition-all duration-300 group ${
                    newEvent.eventType === 'online'
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg shadow-purple-200'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                  } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  disabled={isLoading}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                        newEvent.eventType === 'online'
                          ? 'bg-purple-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600'
                      }`}
                    >
                      <Globe className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3
                        className={`font-bold text-base mb-1 ${
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
                        Virtual meeting with remote attendance
                      </p>
                    </div>
                  </div>
                  {newEvent.eventType === 'online' && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
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
              {renderError('eventType')}
            </div>

            {/* Event Access Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Access Control <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    dispatch(
                      updateNewEvent({
                        ...newEvent,
                        eventAccessType: 'freeForAll',
                        eventJoinCode: '',
                      })
                    )
                  }
                  className={`relative p-5 border-2 rounded-xl transition-all duration-300 group ${
                    newEvent.eventAccessType === 'freeForAll'
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg shadow-purple-200'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                  } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  disabled={isLoading}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                        newEvent.eventAccessType === 'freeForAll'
                          ? 'bg-purple-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600'
                      }`}
                    >
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3
                        className={`font-bold text-base mb-1 ${
                          newEvent.eventAccessType === 'freeForAll'
                            ? 'text-purple-900'
                            : 'text-gray-900 group-hover:text-purple-900'
                        }`}
                      >
                        Free
                      </h3>
                      <p
                        className={`text-sm ${
                          newEvent.eventAccessType === 'freeForAll'
                            ? 'text-purple-700'
                            : 'text-gray-500 group-hover:text-purple-700'
                        }`}
                      >
                        Anyone can join without restrictions
                      </p>
                    </div>
                  </div>
                  {newEvent.eventAccessType === 'freeForAll' && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
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
                    dispatch(
                      updateNewEvent({
                        ...newEvent,
                        eventAccessType: 'codeToJoin',
                      })
                    )
                  }
                  className={`relative p-5 border-2 rounded-xl transition-all duration-300 group ${
                    newEvent.eventAccessType === 'codeToJoin'
                      ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg shadow-purple-200'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                  } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  disabled={isLoading}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                        newEvent.eventAccessType === 'codeToJoin'
                          ? 'bg-purple-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600'
                      }`}
                    >
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3
                        className={`font-bold text-base mb-1 ${
                          newEvent.eventAccessType === 'codeToJoin'
                            ? 'text-purple-900'
                            : 'text-gray-900 group-hover:text-purple-900'
                        }`}
                      >
                        Invitation
                      </h3>
                      <p
                        className={`text-sm ${
                          newEvent.eventAccessType === 'codeToJoin'
                            ? 'text-purple-700'
                            : 'text-gray-500 group-hover:text-purple-700'
                        }`}
                      >
                        Requires an invitation to join
                      </p>
                    </div>
                  </div>
                  {newEvent.eventAccessType === 'codeToJoin' && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
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
              {renderError('eventAccessType')}
            </div>

            {/* Join Code Input */}
            {newEvent.eventAccessType === 'codeToJoin' && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Join Code <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={newEvent.eventJoinCode || ''}
                  onChange={e => {
                    if (errors.eventJoinCode) {
                      setErrors(prev => ({ ...prev, eventJoinCode: '' }));
                    }
                    dispatch(
                      updateNewEvent({
                        ...newEvent,
                        eventJoinCode: e.target.value,
                      })
                    );
                  }}
                  placeholder="Enter a unique join code (e.g., EVENT2024)"
                  className="bg-white"
                />
                {renderError('eventJoinCode')}
                <p className="text-xs text-gray-500 mt-1.5">
                  Share this code with invited attendees
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Schedule */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <SectionHeader
            icon={Calendar}
            title="Schedule"
            description="Set the start and end times for your event"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Start Date & Time <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative p-5 border-2 rounded-xl transition-all duration-300 group ${
                  newEvent.eventStartDate
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                onClick={() =>
                  !isLoading && dispatch(setShowStartDatePicker(true))
                }
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                      newEvent.eventStartDate
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600'
                    }`}
                  >
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    {newEvent.eventStartDate ? (
                      <>
                        <div className="font-bold text-gray-900 text-base mb-1">
                          {new Date(newEvent.eventStartDate).toLocaleDateString(
                            'en-US',
                            {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </div>
                        <div className="text-sm text-purple-700 font-medium">
                          {new Date(newEvent.eventStartDate).toLocaleTimeString(
                            'en-US',
                            {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            }
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-semibold text-gray-900 group-hover:text-purple-900">
                          Select Start Date
                        </div>
                        <div className="text-sm text-gray-500 group-hover:text-purple-700">
                          Click to choose date and time
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {renderError('eventStartDate')}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                End Date & Time <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative p-5 border-2 rounded-xl transition-all duration-300 group ${
                  newEvent.eventEndDate
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                onClick={() =>
                  !isLoading && dispatch(setShowEndDatePicker(true))
                }
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                      newEvent.eventEndDate
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600'
                    }`}
                  >
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    {newEvent.eventEndDate ? (
                      <>
                        <div className="font-bold text-gray-900 text-base mb-1">
                          {new Date(newEvent.eventEndDate).toLocaleDateString(
                            'en-US',
                            {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </div>
                        <div className="text-sm text-purple-700 font-medium">
                          {new Date(newEvent.eventEndDate).toLocaleTimeString(
                            'en-US',
                            {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            }
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="font-semibold text-gray-900 group-hover:text-purple-900">
                          Select End Date
                        </div>
                        <div className="text-sm text-gray-500 group-hover:text-purple-700">
                          Click to choose date and time
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {renderError('eventEndDate')}
            </div>
          </div>
        </div>

        {/* Section 4: Location or Platform */}
        {newEvent.eventType === 'online' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <SectionHeader
              icon={Globe}
              title="Online Platform Details"
              description="Provide the platform and link for your virtual event"
            />

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Platform <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={newEvent.online?.eventPlatform || ''}
                  onChange={e => {
                    if (errors.eventPlatform) {
                      setErrors(prev => ({ ...prev, eventPlatform: '' }));
                    }
                    dispatch(
                      updateNewEvent({
                        ...newEvent,
                        online: {
                          ...newEvent.online,
                          eventPlatform: e.target.value,
                        },
                      })
                    );
                  }}
                  placeholder="e.g., Zoom, Google Meet, Microsoft Teams, Webex"
                  className="text-base"
                />
                {renderError('eventPlatform')}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Link <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="url"
                    value={newEvent.online?.eventLink || ''}
                    onChange={e => {
                      if (errors.eventLink) {
                        setErrors(prev => ({ ...prev, eventLink: '' }));
                      }
                      dispatch(
                        updateNewEvent({
                          ...newEvent,
                          online: {
                            ...newEvent.online,
                            eventLink: e.target.value,
                          },
                        })
                      );
                    }}
                    placeholder="https://meet.google.com/..."
                    className="text-base pl-12"
                  />
                </div>
                {renderError('eventLink')}
              </div>
            </div>
          </div>
        )}

        {newEvent.eventType === 'offline' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <SectionHeader
              icon={MapPin}
              title="Event Location"
              description="Search and select the physical location for your event"
            />

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <LocationSearch
                  value={newEvent.offline?.eventLocation || ''}
                  onChange={value => {
                    if (errors.eventLocation || errors.eventCoordinates) {
                      setErrors(prev => ({
                        ...prev,
                        eventLocation: '',
                        eventCoordinates: '',
                      }));
                    }
                    dispatch(
                      updateNewEvent({
                        ...newEvent,
                        offline: {
                          ...newEvent.offline,
                          eventLocation: value,
                        },
                      })
                    );
                  }}
                  onLocationSelect={location => {
                    setSelectedLocationData(location);
                    if (location) {
                      dispatch(
                        updateNewEvent({
                          ...newEvent,
                          offline: {
                            ...newEvent.offline,
                            eventLocation:
                              location.displayName || location.address,
                            coordinates: {
                              lat: location.lat,
                              lon: location.lon,
                            },
                          },
                        })
                      );
                    } else {
                      dispatch(
                        updateNewEvent({
                          ...newEvent,
                          offline: {
                            ...newEvent.offline,
                            coordinates: null,
                          },
                        })
                      );
                    }
                  }}
                  placeholder="Search for event location..."
                  error={!!(errors.eventLocation || errors.eventCoordinates)}
                  errorColor="red"
                />
                {renderError('eventLocation')}
                {renderError('eventCoordinates')}
              </div>

              {/* Map Display */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Location Preview
                </label>
                <div className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
                  <LocationMap location={selectedLocationData} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 5: Media & Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <SectionHeader
            icon={ImageIcon}
            title="Media & Settings"
            description="Add an event image and configure attendance limits"
          />

          <div className="space-y-6">
            {/* Event Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Event Image <span className="text-red-500">*</span>
              </label>
              <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 rounded-xl p-6 border-2 border-purple-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="relative flex-shrink-0">
                    {newEvent.eventImage ? (
                      <img
                        src={newEvent.eventImage}
                        alt="Event"
                        className="w-24 h-24 rounded-xl object-cover shadow-lg border-2 border-white"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <ImageIcon className="w-10 h-10 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900 mb-1">
                      Event Cover Image
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Choose an image that represents your event. This will be
                      displayed to all attendees.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        onClick={() => setShowImageModal(true)}
                        disabled={isLoading}
                        size="sm"
                      >
                        {newEvent.eventImage ? 'Change Image' : 'Select Image'}
                      </Button>
                      {newEvent.eventImage && (
                        <Button
                          type="button"
                          onClick={() =>
                            dispatch(
                              updateNewEvent({
                                ...newEvent,
                                eventImage: '',
                                eventImageName: '',
                              })
                            )
                          }
                          disabled={isLoading}
                          variant="outline"
                          size="sm"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                  {renderError('eventImage')}
                </div>
              </div>
            </div>

            {/* Max Attendees */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Maximum Attendees <span className="text-red-500">*</span>
              </label>
              <div className="max-w-xs">
                <Input
                  type="number"
                  value={newEvent.eventMaxAttendees || ''}
                  onChange={e => {
                    if (errors.eventMaxAttendees) {
                      setErrors(prev => ({ ...prev, eventMaxAttendees: '' }));
                    }
                    dispatch(
                      updateNewEvent({
                        ...newEvent,
                        eventMaxAttendees: parseInt(e.target.value, 10) || 1,
                      })
                    );
                  }}
                  placeholder="50"
                  className="text-base"
                />
                {renderError('eventMaxAttendees')}
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Set the maximum number of attendees allowed for this event
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            rounded="lg"
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            rounded="lg"
            className="w-full sm:w-auto"
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
          onSelect={dateTime => {
            dispatch(
              updateNewEvent({
                ...newEvent,
                eventStartDate: dateTime,
              })
            );
            dispatch(setShowStartDatePicker(false));
          }}
          initialDateTime={newEvent.eventStartDate}
        />
      )}

      {showEndDatePicker && (
        <CustomDateTimePicker
          isOpen={showEndDatePicker}
          onClose={() => dispatch(setShowEndDatePicker(false))}
          onSelect={dateTime => {
            dispatch(
              updateNewEvent({
                ...newEvent,
                eventEndDate: dateTime,
              })
            );
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

export default CreateEventForm;
