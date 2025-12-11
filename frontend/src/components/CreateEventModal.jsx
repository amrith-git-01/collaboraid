import React, { useEffect } from 'react';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import { MapPin, Users, Calendar, Clock, X, Image as ImageIcon, Globe } from 'lucide-react';
import ImageSelectionModal from './ImageSelectionModal';
import LocationSearch from './LocationSearch';
import LocationMap from './LocationMap';

const CreateEventModal = ({
  isOpen,
  onClose,
  newEvent,
  setNewEvent,
  onSubmit,
  setShowStartDatePicker,
  setShowEndDatePicker,
  isLoading = false,
  isEditMode = false,
  editEvent = null,
}) => {
  if (!isOpen) {
    return null;
  }

  const [showImageModal, setShowImageModal] = React.useState(false);
  const [selectedLocationData, setSelectedLocationData] = React.useState(null);

  // Pre-fill form data when in edit mode
  useEffect(() => {
    if (isEditMode && editEvent && isOpen) {
      const startDate = editEvent.eventStartDate
        ? new Date(editEvent.eventStartDate).toISOString().slice(0, 16)
        : '';
      const endDate = editEvent.eventEndDate
        ? new Date(editEvent.eventEndDate).toISOString().slice(0, 16)
        : '';

      setNewEvent({
        eventName: editEvent.eventName || '',
        eventDescription: editEvent.eventDescription || '',
        eventType: editEvent.eventType || '',
        eventAccessType: editEvent.eventAccessType || '',
        eventJoinCode: editEvent.eventJoinCode || '',
        eventStartDate: startDate,
        eventEndDate: endDate,
        eventImage: editEvent.eventImage || '',
        eventImageName: editEvent.eventImageName || '',
        eventMaxAttendees: editEvent.eventMaxAttendees || 1,
        online: {
          eventPlatform: editEvent.online?.eventPlatform || '',
          eventLink: editEvent.online?.eventLink || '',
        },
        offline: {
          eventLocation: editEvent.offline?.eventLocation || '',
          coordinates: editEvent.offline?.coordinates || null,
        },
      });

      // Restore location data for map display
      if (editEvent.offline?.coordinates) {
        setSelectedLocationData({
          displayName: editEvent.offline?.eventLocation,
          lat: editEvent.offline.coordinates.lat,
          lon: editEvent.offline.coordinates.lon,
        });
      } else {
        setSelectedLocationData(null);
      }
    } else {
      // Reset location data when modal closes or opens in create mode
      setSelectedLocationData(null);
    }
  }, [isEditMode, editEvent, isOpen]);

  const handleImageSelect = image => {
    setNewEvent({
      ...newEvent,
      eventImage: image.src,
      eventImageName: image.name,
    });
    setShowImageModal(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Event' : 'Create New Event'}
              </h2>
              <p className="text-gray-600 mt-1 text-sm">
                {isEditMode
                  ? 'Update the details of your event'
                  : 'Fill in the details to create your event'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6">
              <form className="space-y-6" onSubmit={e => { e.preventDefault(); onSubmit(); }}>
                {/* Event Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={newEvent.eventName || ''}
                    onChange={e =>
                      setNewEvent({ ...newEvent, eventName: e.target.value })
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
                      setNewEvent({
                        ...newEvent,
                        eventDescription: e.target.value,
                      })
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
                      onClick={() => setNewEvent({ ...newEvent, eventType: 'offline' })}
                      className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                        newEvent.eventType === 'offline'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <MapPin className={`w-5 h-5 ${newEvent.eventType === 'offline' ? 'text-purple-600' : 'text-gray-400'}`} />
                        <div className="text-left">
                          <div className={`font-medium ${newEvent.eventType === 'offline' ? 'text-purple-900' : 'text-gray-900'}`}>
                            Offline
                          </div>
                          <div className="text-sm text-gray-500">Physical location</div>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewEvent({ ...newEvent, eventType: 'online' })}
                      className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                        newEvent.eventType === 'online'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Globe className={`w-5 h-5 ${newEvent.eventType === 'online' ? 'text-purple-600' : 'text-gray-400'}`} />
                        <div className="text-left">
                          <div className={`font-medium ${newEvent.eventType === 'online' ? 'text-purple-900' : 'text-gray-900'}`}>
                            Online
                          </div>
                          <div className="text-sm text-gray-500">Virtual meeting</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Event Access Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setNewEvent({
                          ...newEvent,
                          eventAccessType: 'freeForAll',
                          eventJoinCode: '',
                        })
                      }
                      className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                        newEvent.eventAccessType === 'freeForAll'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Users className={`w-5 h-5 ${newEvent.eventAccessType === 'freeForAll' ? 'text-purple-600' : 'text-gray-400'}`} />
                        <div className="text-left">
                          <div className={`font-medium ${newEvent.eventAccessType === 'freeForAll' ? 'text-purple-900' : 'text-gray-900'}`}>
                            Free for All
                          </div>
                          <div className="text-sm text-gray-500">Anyone can join</div>
                        </div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNewEvent({
                          ...newEvent,
                          eventAccessType: 'codeToJoin',
                        })
                      }
                      className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                        newEvent.eventAccessType === 'codeToJoin'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <svg
                          className={`w-5 h-5 ${newEvent.eventAccessType === 'codeToJoin' ? 'text-purple-600' : 'text-gray-400'}`}
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
                        <div className="text-left">
                          <div className={`font-medium ${newEvent.eventAccessType === 'codeToJoin' ? 'text-purple-900' : 'text-gray-900'}`}>
                            Code to Join
                          </div>
                          <div className="text-sm text-gray-500">Requires code</div>
                        </div>
                      </div>
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
                        setNewEvent({
                          ...newEvent,
                          eventJoinCode: e.target.value,
                        })
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
                    <button
                      type="button"
                      onClick={() => setShowStartDatePicker(true)}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-all duration-200 text-left"
                    >
                      {newEvent.eventStartDate ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(newEvent.eventStartDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(newEvent.eventStartDate).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Calendar className="w-5 h-5" />
                          <span>Select start date</span>
                        </div>
                      )}
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date & Time <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowEndDatePicker(true)}
                      className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-all duration-200 text-left"
                    >
                      {newEvent.eventEndDate ? (
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(newEvent.eventEndDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(newEvent.eventEndDate).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Clock className="w-5 h-5" />
                          <span>Select end date</span>
                        </div>
                      )}
                    </button>
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
                          setNewEvent({
                            ...newEvent,
                            online: {
                              ...newEvent.online,
                              eventPlatform: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g., Zoom, Google Meet, Teams"
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
                          setNewEvent({
                            ...newEvent,
                            online: {
                              ...newEvent.online,
                              eventLink: e.target.value,
                            },
                          })
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
                          setNewEvent({
                            ...newEvent,
                            offline: {
                              ...newEvent.offline,
                              eventLocation: value,
                            },
                          });
                        }}
                        onLocationSelect={(location) => {
                          setSelectedLocationData(location);
                          if (location) {
                            setNewEvent({
                              ...newEvent,
                              offline: {
                                ...newEvent.offline,
                                eventLocation: location.displayName || location.address,
                                coordinates: {
                                  lat: location.lat,
                                  lon: location.lon,
                                },
                              },
                            });
                          } else {
                            setNewEvent({
                              ...newEvent,
                              offline: {
                                ...newEvent.offline,
                                coordinates: null,
                              },
                            });
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
                  <div className="space-y-3">
                    {newEvent.eventImage ? (
                      <div className="relative">
                        <img
                          src={newEvent.eventImage}
                          alt="Event"
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setNewEvent({
                              ...newEvent,
                              eventImage: '',
                              eventImageName: '',
                            })
                          }
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowImageModal(true)}
                        className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 flex flex-col items-center justify-center space-y-2"
                      >
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">
                          Select Event Image
                        </span>
                        <span className="text-xs text-gray-500">
                          Choose from our curated collection
                        </span>
                      </button>
                    )}
                    {newEvent.eventImage && (
                      <button
                        type="button"
                        onClick={() => setShowImageModal(true)}
                        className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        Change Image
                      </button>
                    )}
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
                      setNewEvent({
                        ...newEvent,
                        eventMaxAttendees: parseInt(e.target.value) || 1,
                      })
                    }
                    placeholder="50"
                    min="1"
                    required
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex gap-3 justify-end bg-white rounded-b-xl">
            <Button
              variant="outline"
              rounded="lg"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              rounded="lg"
              onClick={onSubmit}
              isLoading={isLoading}
            >
              {isLoading
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                  ? 'Update Event'
                  : 'Create Event'}
            </Button>
          </div>
        </div>
      </div>

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
    </>
  );
};

export default CreateEventModal;
