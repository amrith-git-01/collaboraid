import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import DeleteEventModal from '../components/DeleteEventModal';
import LeaveEventModal from '../components/LeaveEventModal';
import MyEvents from '../components/MyEvents';
import JoinEvents from '../components/JoinEvents';
import CreateEventForm from '../components/CreateEventForm';
import Button from '../components/ui/Button';

// Redux actions
import {
  fetchAllEvents,
  fetchUserEvents,
  deleteEvent,
  joinEvent,
  leaveEvent,
  openModal,
  closeModal,
  setSelectedEvent,
  setEventToEdit,
  setEventToDelete,
  setEventToLeave,
  resetNewEvent,
  setActiveTab,
  setHasInitialized,
  setIsFetching,
  clearError,
  updateNewEvent,
} from '../store/eventsSlice';

// Redux selectors
import {
  selectAllEvents,
  selectUserEvents,
  selectEventsLoading,
  selectEventsError,
  selectActiveTab,
  selectNewEvent,
  selectSelectedEvent,
  selectEventToEdit,
  selectEventToDelete,
  selectEventToLeave,
  selectModals,
  selectFilteredMyEvents,
  selectFilteredJoinEvents,
} from '../store/selectors';

function Events() {
  // Generate unique instance ID for debugging
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));

  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const dispatch = useDispatch();

  // Redux selectors
  const allEvents = useSelector(selectAllEvents);
  const userEvents = useSelector(selectUserEvents);
  const loading = useSelector(selectEventsLoading);
  const error = useSelector(selectEventsError);
  const activeTab = useSelector(selectActiveTab);
  const selectedEvent = useSelector(selectSelectedEvent);
  const eventToEdit = useSelector(selectEventToEdit);
  const eventToDelete = useSelector(selectEventToDelete);
  const eventToLeave = useSelector(selectEventToLeave);
  const modals = useSelector(selectModals);
  const filteredMyEvents = useSelector(selectFilteredMyEvents);
  const filteredJoinEvents = useSelector(selectFilteredJoinEvents);

  // Refs for preventing duplicate API calls
  const abortControllerRef = useRef(null);
  const hasInitializedRef = useRef(false);
  const isFetchingRef = useRef(false);

  console.log(
    `[${new Date().toISOString()}] Events component render [${instanceId.current}] - isAuthenticated:`,
    isAuthenticated,
    'user:',
    user?.id
  );

  // Main useEffect for initial data fetch
  useEffect(() => {
    console.log(
      `[${new Date().toISOString()}] useEffect triggered [${instanceId.current}] - isAuthenticated:`,
      isAuthenticated,
      'hasInitialized:',
      hasInitializedRef.current,
      'isFetching:',
      isFetchingRef.current
    );

    // Only run once when component mounts and user is authenticated
    if (hasInitializedRef.current || !isAuthenticated) {
      return;
    }

    // Mark as initialized immediately to prevent duplicate calls
    hasInitializedRef.current = true;
    dispatch(setHasInitialized(true));
    console.log(
      `[${new Date().toISOString()}] Initializing Events component [${instanceId.current}]...`
    );

    // Fetch events using Redux
    const performFetch = async () => {
      // Prevent multiple simultaneous fetches
      if (isFetchingRef.current) {
        console.log('Fetch already in progress, skipping...');
        return;
      }

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      isFetchingRef.current = true;
      dispatch(setIsFetching(true));

      try {
        console.log(
          `[${new Date().toISOString()}] Starting to fetch events [${instanceId.current}]...`
        );

        // Fetch all events and user events using Redux thunks
        await Promise.all([
          dispatch(fetchAllEvents()),
          dispatch(fetchUserEvents()),
        ]);

        console.log(
          `[${new Date().toISOString()}] Events fetched successfully [${instanceId.current}]`
        );
      } catch (error) {
        // Only show error if it's not an abort error
        if (error.name !== 'AbortError') {
          console.error('Error fetching events:', error);
          showToast('Failed to load events', 'error');
        }
      } finally {
        isFetchingRef.current = false;
        dispatch(setIsFetching(false));
        abortControllerRef.current = null;
      }
    };

    // Execute the fetch
    performFetch();

    // Cleanup function
    return () => {
      console.log(
        `[${new Date().toISOString()}] useEffect cleanup [${instanceId.current}] - aborting any ongoing requests`
      );
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isAuthenticated, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      dispatch(clearError());
    }
  }, [error, showToast, dispatch]);

  if (!isAuthenticated) {
    return null;
  }

  // Modal handlers

  const handleCloseViewModal = () => {
    dispatch(closeModal('view'));
    dispatch(setSelectedEvent(null));
  };

  const handleCloseDeleteModal = () => {
    dispatch(closeModal('delete'));
    dispatch(setEventToDelete(null));
  };

  const handleCloseLeaveModal = () => {
    dispatch(closeModal('leave'));
    dispatch(setEventToLeave(null));
  };

  // Event handlers
  const handleCreateEvent = () => {
    dispatch(resetNewEvent());
    dispatch(setEventToEdit(null));
    dispatch(setActiveTab('createEvent'));
  };

  const handleEditEvent = event => {
    dispatch(setEventToEdit(event));
    dispatch(setActiveTab('createEvent'));
  };

  const handleViewEvent = event => {
    dispatch(setSelectedEvent(event));
    dispatch(openModal('view'));
  };

  const handleDeleteEvent = event => {
    dispatch(setEventToDelete(event));
    dispatch(openModal('delete'));
  };

  const handleLeaveEvent = event => {
    dispatch(setEventToLeave(event));
    dispatch(openModal('leave'));
  };

  const handleJoinLeaveEvent = async (event, joinCode = null) => {
    try {
      // Check if user has joined this event (but not if they created it)
      // This matches the logic used in EventCard.jsx
      const isUserJoined =
        event.eventParticipants?.some(
          participant => participant._id === user._id
        ) && event.eventCreator._id !== user._id;

      if (isUserJoined) {
        // User is already joined, so leave the event
        await dispatch(leaveEvent(event._id)).unwrap();
        showToast('Successfully left the event', 'success');
      } else {
        // User is not joined, so join the event
        await dispatch(joinEvent({ eventId: event._id, joinCode })).unwrap();
        showToast('Successfully joined the event', 'success');
      }
    } catch (error) {
      showToast(error || 'Failed to join/leave event', 'error');
    }
  };

  // Form handlers

  const handleDeleteEventSubmit = async () => {
    try {
      if (!eventToDelete) return;
      await dispatch(deleteEvent(eventToDelete._id)).unwrap();
      showToast('Event deleted successfully!', 'success');
      handleCloseDeleteModal();
    } catch (error) {
      showToast(error || 'Failed to delete event', 'error');
    }
  };

  const handleLeaveEventSubmit = async () => {
    try {
      if (!eventToLeave) return;
      await dispatch(leaveEvent(eventToLeave._id)).unwrap();
      showToast('Successfully left the event', 'success');
      handleCloseLeaveModal();
    } catch (error) {
      showToast(error || 'Failed to leave event', 'error');
    }
  };


  const handleTabChange = tab => {
    dispatch(setActiveTab(tab));
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([
        dispatch(fetchAllEvents()),
        dispatch(fetchUserEvents()),
      ]);
      showToast('Events refreshed successfully!', 'success');
    } catch (error) {
      showToast('Failed to refresh events', 'error');
    }
  };

  // Filter joinable events (events that can be joined)
  const joinableEvents = allEvents.filter(
    event => event?.eventCreator?._id && event.eventCreator._id !== user._id
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
                Events
              </h1>
              <p className="text-base text-gray-600">
                Manage your events and discover new ones to join
              </p>
            </div>
            <div className="flex flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="text-sm"
              >
                Refresh
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateEvent}
                className="text-sm"
              >
                Create Event
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <nav className="flex space-x-1 p-1">
            <button
              onClick={() => handleTabChange('myEvents')}
              className={`relative flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'myEvents'
                  ? 'bg-purple-50 text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
              }`}
            >
              My Events
              {activeTab === 'myEvents' && (
                <span className="absolute inset-0 rounded-md ring-1 ring-purple-200 ring-inset"></span>
              )}
            </button>
            <button
              onClick={() => handleTabChange('joinEvents')}
              className={`relative flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'joinEvents'
                  ? 'bg-purple-50 text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
              }`}
            >
              Join Events
              {activeTab === 'joinEvents' && (
                <span className="absolute inset-0 rounded-md ring-1 ring-purple-200 ring-inset"></span>
              )}
            </button>
            <button
              onClick={() => handleTabChange('createEvent')}
              className={`relative flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'createEvent'
                  ? 'bg-purple-50 text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
              }`}
            >
              Create Event
              {activeTab === 'createEvent' && (
                <span className="absolute inset-0 rounded-md ring-1 ring-purple-200 ring-inset"></span>
              )}
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'myEvents' ? (
          <MyEvents
            loading={loading}
            userEvents={filteredMyEvents}
            user={user}
            onViewEvent={handleViewEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onJoinLeaveEvent={handleJoinLeaveEvent}
            onCreateEvent={handleCreateEvent}
          />
        ) : activeTab === 'joinEvents' ? (
          <JoinEvents
            loading={loading}
            events={filteredJoinEvents}
            userEvents={userEvents}
            user={user}
            onViewEvent={handleViewEvent}
            onDeleteEvent={handleDeleteEvent}
            onJoinLeaveEvent={handleJoinLeaveEvent}
          />
        ) : (
          <CreateEventForm
            onSuccess={() => {
              // Refresh events after successful create/edit
              dispatch(fetchAllEvents());
              dispatch(fetchUserEvents());
            }}
          />
        )}

        {/* Modals */}
        {modals.delete && eventToDelete && (
          <DeleteEventModal
            isOpen={modals.delete}
            onClose={handleCloseDeleteModal}
            onConfirm={handleDeleteEventSubmit}
            eventName={eventToDelete.eventName}
            eventId={eventToDelete._id}
          />
        )}

        {modals.leave && eventToLeave && (
          <LeaveEventModal
            isOpen={modals.leave}
            onClose={handleCloseLeaveModal}
            onSubmit={handleLeaveEventSubmit}
            event={eventToLeave}
          />
        )}

      </div>
    </div>
  );
}

export default Events;
