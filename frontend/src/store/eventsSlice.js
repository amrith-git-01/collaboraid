import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { eventService } from "../services/eventService";

// Async thunks for API calls
export const fetchAllEvents = createAsyncThunk(
    'events/fetchAllEvents',
    async (_, { rejectWithValue }) => {
        try {
            const data = await eventService.getAllEvents();
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch events');
        }
    }
);

export const fetchUserEvents = createAsyncThunk(
    'events/fetchUserEvents',
    async (_, { rejectWithValue }) => {
        try {
            const data = await eventService.getMyEvents();
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user events');
        }
    }
);

export const createEvent = createAsyncThunk(
    'events/createEvent',
    async (eventData, { rejectWithValue }) => {
        try {
            const data = await eventService.createEvent(eventData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create event');
        }
    }
);

export const updateEvent = createAsyncThunk(
    'events/updateEvent',
    async ({ eventId, eventData }, { rejectWithValue }) => {
        try {
            const data = await eventService.updateEvent(eventId, eventData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update event');
        }
    }
);

export const deleteEvent = createAsyncThunk(
    'events/deleteEvent',
    async (eventId, { rejectWithValue }) => {
        try {
            const data = await eventService.deleteEvent(eventId);
            return { eventId, data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete event');
        }
    }
);

export const joinEvent = createAsyncThunk(
    'events/joinEvent',
    async ({ eventId, joinCode }, { rejectWithValue }) => {
        try {
            const data = await eventService.joinEvent(eventId, joinCode);
            return { eventId, data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to join event');
        }
    }
);

export const leaveEvent = createAsyncThunk(
    'events/leaveEvent',
    async (eventId, { rejectWithValue }) => {
        try {
            const data = await eventService.leaveEvent(eventId);
            return { eventId, data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to leave event');
        }
    }
);

const initialState = {
    // Data
    allEvents: [],
    userEvents: [],
    loading: false,
    error: null,

    // UI States
    modals: {
        create: false,
        edit: false,
        view: false,
        delete: false,
        leave: false,
    },

    // Selected Items
    selectedEvent: null,
    eventToEdit: null,
    eventToDelete: null,
    eventToLeave: null,

    // Form Data
    newEvent: {
        eventName: '',
        eventDescription: '',
        eventType: '',
        eventAccessType: '',
        eventJoinCode: '',
        eventStartDate: '',
        eventEndDate: '',
        eventImage: '',
        eventImageName: '',
        eventMaxAttendees: 1,
        online: { eventPlatform: '', eventLink: '' },
        offline: { eventLocation: '' },
    },

    // Navigation
    activeTab: 'myEvents',

    // Date Pickers
    showStartDatePicker: false,
    showEndDatePicker: false,

    // Refs for preventing duplicate API calls
    hasInitialized: false,
    isFetching: false,
};

const eventsSlice = createSlice({
    name: 'events',
    initialState,
    reducers: {
        // Modal actions
        openModal: (state, action) => {
            state.modals[action.payload] = true;
        },
        closeModal: (state, action) => {
            state.modals[action.payload] = false;
        },
        closeAllModals: (state) => {
            Object.keys(state.modals).forEach(modal => {
                state.modals[modal] = false;
            });
        },

        // Selection actions
        setSelectedEvent: (state, action) => {
            state.selectedEvent = action.payload;
        },
        setEventToEdit: (state, action) => {
            state.eventToEdit = action.payload;
            if (action.payload) {
                // Pre-fill form with event data for editing
                state.newEvent = {
                    eventName: action.payload.eventName || '',
                    eventDescription: action.payload.eventDescription || '',
                    eventType: action.payload.eventType || '',
                    eventAccessType: action.payload.eventAccessType || '',
                    eventJoinCode: action.payload.eventJoinCode || '',
                    eventStartDate: action.payload.eventStartDate ? new Date(action.payload.eventStartDate).toISOString().slice(0, 16) : '',
                    eventEndDate: action.payload.eventEndDate ? new Date(action.payload.eventEndDate).toISOString().slice(0, 16) : '',
                    eventImage: action.payload.eventImage || '',
                    eventImageName: action.payload.eventImageName || '',
                    eventMaxAttendees: action.payload.eventMaxAttendees || 1,
                    online: {
                        eventPlatform: action.payload.online?.eventPlatform || '',
                        eventLink: action.payload.online?.eventLink || '',
                    },
                    offline: {
                        eventLocation: action.payload.offline?.eventLocation || '',
                    },
                };
            }
        },
        setEventToDelete: (state, action) => {
            state.eventToDelete = action.payload;
        },
        setEventToLeave: (state, action) => {
            state.eventToLeave = action.payload;
        },

        // Form actions
        updateNewEvent: (state, action) => {
            state.newEvent = { ...state.newEvent, ...action.payload };
        },
        resetNewEvent: (state) => {
            state.newEvent = initialState.newEvent;
        },

        // Navigation actions
        setActiveTab: (state, action) => {
            state.activeTab = action.payload;
        },

        // Date picker actions
        setShowStartDatePicker: (state, action) => {
            state.showStartDatePicker = action.payload;
        },
        setShowEndDatePicker: (state, action) => {
            state.showEndDatePicker = action.payload;
        },

        // Initialization actions
        setHasInitialized: (state, action) => {
            state.hasInitialized = action.payload;
        },
        setIsFetching: (state, action) => {
            state.isFetching = action.payload;
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            // Fetch all events
            .addCase(fetchAllEvents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllEvents.fulfilled, (state, action) => {
                state.loading = false;
                state.allEvents = action.payload.data?.events || [];
                state.error = null;
            })
            .addCase(fetchAllEvents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch user events
            .addCase(fetchUserEvents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserEvents.fulfilled, (state, action) => {
                state.loading = false;
                state.userEvents = action.payload.data?.events || [];
                state.error = null;
            })
            .addCase(fetchUserEvents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create event
            .addCase(createEvent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createEvent.fulfilled, (state, action) => {
                state.loading = false;
                const newEvent = action.payload.data?.event || action.payload;
                state.allEvents.push(newEvent);
                state.userEvents.push(newEvent);
                state.newEvent = initialState.newEvent;
                state.modals.create = false;
                state.error = null;
            })
            .addCase(createEvent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update event
            .addCase(updateEvent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateEvent.fulfilled, (state, action) => {
                state.loading = false;
                const updatedEvent = action.payload.data?.event || action.payload;

                // Update in allEvents
                const allEventsIndex = state.allEvents.findIndex(event => event._id === updatedEvent._id);
                if (allEventsIndex !== -1) {
                    state.allEvents[allEventsIndex] = updatedEvent;
                }

                // Update in userEvents
                const userEventsIndex = state.userEvents.findIndex(event => event._id === updatedEvent._id);
                if (userEventsIndex !== -1) {
                    state.userEvents[userEventsIndex] = updatedEvent;
                }

                state.newEvent = initialState.newEvent;
                state.modals.edit = false;
                state.eventToEdit = null;
                state.error = null;
            })
            .addCase(updateEvent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete event
            .addCase(deleteEvent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteEvent.fulfilled, (state, action) => {
                state.loading = false;
                const { eventId } = action.payload;

                // Remove from allEvents
                state.allEvents = state.allEvents.filter(event => event._id !== eventId);

                // Remove from userEvents
                state.userEvents = state.userEvents.filter(event => event._id !== eventId);

                state.modals.delete = false;
                state.eventToDelete = null;
                state.error = null;
            })
            .addCase(deleteEvent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Join event
            .addCase(joinEvent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(joinEvent.fulfilled, (state, action) => {
                state.loading = false;
                const { eventId, data } = action.payload;
                const updatedEvent = data.data?.event || data.event || data;

                // Update event in allEvents
                const allEventsIndex = state.allEvents.findIndex(event => event._id === eventId);
                if (allEventsIndex !== -1) {
                    state.allEvents[allEventsIndex] = updatedEvent;
                }

                // Add to userEvents if not already there
                const userEventsIndex = state.userEvents.findIndex(event => event._id === eventId);
                if (userEventsIndex === -1) {
                    state.userEvents.push(updatedEvent);
                } else {
                    state.userEvents[userEventsIndex] = updatedEvent;
                }

                state.error = null;
            })
            .addCase(joinEvent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Leave event
            .addCase(leaveEvent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(leaveEvent.fulfilled, (state, action) => {
                state.loading = false;
                const { eventId, data } = action.payload;
                const updatedEvent = data.data?.event || data.event || data;

                // Update event in allEvents
                const allEventsIndex = state.allEvents.findIndex(event => event._id === eventId);
                if (allEventsIndex !== -1) {
                    state.allEvents[allEventsIndex] = updatedEvent;
                }

                // Remove from userEvents when user leaves an event
                // Since the user left the event, they should no longer see it in their events
                state.userEvents = state.userEvents.filter(event => event._id !== eventId);

                state.modals.leave = false;
                state.eventToLeave = null;
                state.error = null;
            })
            .addCase(leaveEvent.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    openModal,
    closeModal,
    closeAllModals,
    setSelectedEvent,
    setEventToEdit,
    setEventToDelete,
    setEventToLeave,
    updateNewEvent,
    resetNewEvent,
    setActiveTab,
    setShowStartDatePicker,
    setShowEndDatePicker,
    setHasInitialized,
    setIsFetching,
    clearError,
} = eventsSlice.actions;

export default eventsSlice.reducer;
