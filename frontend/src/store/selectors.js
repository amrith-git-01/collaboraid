import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
export const selectEvents = (state) => state.events;
export const selectFilters = (state) => state.filters;

// Events selectors
export const selectAllEvents = (state) => state.events.allEvents;
export const selectUserEvents = (state) => state.events.userEvents;
export const selectEventsLoading = (state) => state.events.loading;
export const selectEventsError = (state) => state.events.error;
export const selectActiveTab = (state) => state.events.activeTab;
export const selectNewEvent = (state) => state.events.newEvent;
export const selectSelectedEvent = (state) => state.events.selectedEvent;
export const selectEventToEdit = (state) => state.events.eventToEdit;
export const selectEventToDelete = (state) => state.events.eventToDelete;
export const selectEventToLeave = (state) => state.events.eventToLeave;

// Modal selectors
export const selectModals = (state) => state.events.modals;
export const selectCreateModal = (state) => state.events.modals.create;
export const selectEditModal = (state) => state.events.modals.edit;
export const selectViewModal = (state) => state.events.modals.view;
export const selectDeleteModal = (state) => state.events.modals.delete;
export const selectLeaveModal = (state) => state.events.modals.leave;

// Date picker selectors
export const selectShowStartDatePicker = (state) => state.events.showStartDatePicker;
export const selectShowEndDatePicker = (state) => state.events.showEndDatePicker;

// Filter selectors
export const selectMyEventsFilters = (state) => state.filters.myEvents;
export const selectJoinEventsFilters = (state) => state.filters.joinEvents;

// Filtered events selectors
export const selectFilteredMyEvents = createSelector(
    [selectUserEvents, selectMyEventsFilters, (state) => state.auth.user],
    (userEvents, filters, user) => {
        let filtered = userEvents || [];

        // Apply status filter
        if (filters.statusFilter !== 'all') {
            filtered = filtered.filter(event => {
                const now = new Date();
                const startDate = new Date(event.eventStartDate);
                const endDate = new Date(event.eventEndDate);

                if (now < startDate) {
                    return filters.statusFilter === 'upcoming';
                } else if (now >= startDate && now <= endDate) {
                    return filters.statusFilter === 'ongoing';
                } else {
                    return filters.statusFilter === 'completed';
                }
            });
        }

        // Apply type filter
        if (filters.typeFilter !== 'all') {
            filtered = filtered.filter(event => {
                if (filters.typeFilter === 'online') {
                    return event.online && event.online.eventPlatform && event.online.eventLink;
                } else if (filters.typeFilter === 'offline') {
                    return event.offline && event.offline.eventLocation;
                }
                return true;
            });
        }

        // Apply access filter
        if (filters.accessFilter !== 'all') {
            filtered = filtered.filter(event => {
                if (filters.accessFilter === 'free') {
                    return event.eventAccessType === 'freeForAll';
                } else if (filters.accessFilter === 'code') {
                    return event.eventAccessType === 'codeToJoin';
                }
                return true;
            });
        }

        // Apply ownership filter
        if (filters.ownershipFilter !== 'all' && user) {
            filtered = filtered.filter(event => {
                if (!event?.eventCreator?._id) return false;

                if (filters.ownershipFilter === 'created') {
                    // Show only events created by the user
                    return event.eventCreator._id === user._id;
                } else if (filters.ownershipFilter === 'joined') {
                    // Show only events joined by the user (but not created by them)
                    const isCreator = event.eventCreator._id === user._id;
                    const isParticipant = event.eventParticipants?.some(
                        participant => participant._id === user._id
                    );
                    return !isCreator && isParticipant;
                }
                return true;
            });
        }

        // Apply search filter
        if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase().trim();
            filtered = filtered.filter(event => {
                return event.eventName?.toLowerCase().includes(query);
            });
        }

        return filtered;
    }
);

export const selectFilteredJoinEvents = createSelector(
    [selectAllEvents, selectUserEvents, selectJoinEventsFilters, (state) => state.auth.user],
    (allEvents, userEvents, filters, user) => {
        // Filter out only events created by the user from all events
        // Keep events the user has joined so they appear in both sections
        let filtered = (allEvents || []).filter(event =>
            user && event?.eventCreator?._id ? event.eventCreator._id !== user._id : true
        );

        // Apply status filter
        if (filters.statusFilter !== 'all') {
            filtered = filtered.filter(event => {
                const now = new Date();
                const startDate = new Date(event.eventStartDate);
                const endDate = new Date(event.eventEndDate);

                if (now < startDate) {
                    return filters.statusFilter === 'upcoming';
                } else if (now >= startDate && now <= endDate) {
                    return filters.statusFilter === 'ongoing';
                } else {
                    return filters.statusFilter === 'completed';
                }
            });
        }

        // Apply type filter
        if (filters.typeFilter !== 'all') {
            filtered = filtered.filter(event => {
                if (filters.typeFilter === 'online') {
                    return event.online && event.online.eventPlatform && event.online.eventLink;
                } else if (filters.typeFilter === 'offline') {
                    return event.offline && event.offline.eventLocation;
                }
                return true;
            });
        }

        // Apply access filter
        if (filters.accessFilter !== 'all') {
            filtered = filtered.filter(event => {
                if (filters.accessFilter === 'free') {
                    return event.eventAccessType === 'freeForAll';
                } else if (filters.accessFilter === 'code') {
                    return event.eventAccessType === 'codeToJoin';
                }
                return true;
            });
        }

        // Apply participation filter
        if (filters.participationFilter !== 'all') {
            filtered = filtered.filter(event => {
                const isJoined = (userEvents || []).some(userEvent => userEvent._id === event._id);
                if (filters.participationFilter === 'joined') {
                    return isJoined;
                } else if (filters.participationFilter === 'unjoined') {
                    return !isJoined;
                }
                return true;
            });
        }

        // Apply search filter
        if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase().trim();
            filtered = filtered.filter(event => {
                return event.eventName?.toLowerCase().includes(query);
            });
        }

        return filtered;
    }
);

// Joinable events selector (events that can be joined)
export const selectJoinableEvents = createSelector(
    [selectAllEvents, selectUserEvents, (state) => state.auth.user],
    (allEvents, userEvents, user) => {
        // Filter out only events created by the user from all events
        // Keep events the user has joined so they appear in both sections
        return (allEvents || []).filter(event =>
            user && event?.eventCreator?._id ? event.eventCreator._id !== user._id : true
        );
    }
);
