import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    myEvents: {
        searchQuery: '',
        statusFilter: 'all',
        typeFilter: 'all',
        accessFilter: 'all',
        ownershipFilter: 'all',
    },
    joinEvents: {
        searchQuery: '',
        statusFilter: 'all',
        typeFilter: 'all',
        accessFilter: 'all',
        participationFilter: 'all',
    },
};

const filtersSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        // MyEvents filter actions
        updateMyEventsFilter: (state, action) => {
            const { filter, value } = action.payload;
            state.myEvents[filter] = value;
        },
        clearMyEventsFilters: (state) => {
            state.myEvents = initialState.myEvents;
        },
        setMyEventsSearchQuery: (state, action) => {
            state.myEvents.searchQuery = action.payload;
        },
        setMyEventsStatusFilter: (state, action) => {
            state.myEvents.statusFilter = action.payload;
        },
        setMyEventsTypeFilter: (state, action) => {
            state.myEvents.typeFilter = action.payload;
        },
        setMyEventsAccessFilter: (state, action) => {
            state.myEvents.accessFilter = action.payload;
        },
        setMyEventsOwnershipFilter: (state, action) => {
            state.myEvents.ownershipFilter = action.payload;
        },

        // JoinEvents filter actions
        updateJoinEventsFilter: (state, action) => {
            const { filter, value } = action.payload;
            state.joinEvents[filter] = value;
        },
        clearJoinEventsFilters: (state) => {
            state.joinEvents = initialState.joinEvents;
        },
        setJoinEventsSearchQuery: (state, action) => {
            state.joinEvents.searchQuery = action.payload;
        },
        setJoinEventsStatusFilter: (state, action) => {
            state.joinEvents.statusFilter = action.payload;
        },
        setJoinEventsTypeFilter: (state, action) => {
            state.joinEvents.typeFilter = action.payload;
        },
        setJoinEventsAccessFilter: (state, action) => {
            state.joinEvents.accessFilter = action.payload;
        },
        setJoinEventsParticipationFilter: (state, action) => {
            state.joinEvents.participationFilter = action.payload;
        },

        // Clear all filters
        clearAllFilters: (state) => {
            state.myEvents = initialState.myEvents;
            state.joinEvents = initialState.joinEvents;
        },
    },
});

export const {
    updateMyEventsFilter,
    clearMyEventsFilters,
    setMyEventsSearchQuery,
    setMyEventsStatusFilter,
    setMyEventsTypeFilter,
    setMyEventsAccessFilter,
    setMyEventsOwnershipFilter,
    updateJoinEventsFilter,
    clearJoinEventsFilters,
    setJoinEventsSearchQuery,
    setJoinEventsStatusFilter,
    setJoinEventsTypeFilter,
    setJoinEventsAccessFilter,
    setJoinEventsParticipationFilter,
    clearAllFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
