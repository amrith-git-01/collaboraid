import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Search,
  X,
  Calendar,
  Clock,
  CheckCircle,
  Globe,
  MapPin,
  Lock,
  Unlock,
  Settings,
  List,
  Grid3X3,
  Plus,
  Users,
} from 'lucide-react';
import EventCard from './EventCard';
import EventSkeletonCard from './EventSkeletonCard';
import Input from './ui/Input';
import FilterDropdown from './ui/FilterDropdown';
import {
  setJoinEventsSearchQuery,
  setJoinEventsStatusFilter,
  setJoinEventsTypeFilter,
  setJoinEventsAccessFilter,
  setJoinEventsParticipationFilter,
  clearJoinEventsFilters,
} from '../store/filtersSlice';
import {
  selectJoinEventsFilters,
  selectFilteredJoinEvents,
} from '../store/selectors';

const JoinEvents = ({
  loading,
  events,
  userEvents,
  user,
  onViewEvent,
  onDeleteEvent,
  onJoinLeaveEvent,
}) => {
  const dispatch = useDispatch();
  const filters = useSelector(selectJoinEventsFilters);
  const filteredEvents = useSelector(selectFilteredJoinEvents);

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  const clearSearch = () => {
    dispatch(setJoinEventsSearchQuery(''));
  };

  const clearFilters = () => {
    dispatch(clearJoinEventsFilters());
  };

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Events', icon: <List className="w-4 h-4" /> },
    {
      value: 'upcoming',
      label: 'Upcoming',
      icon: <Calendar className="w-4 h-4" />,
    },
    { value: 'ongoing', label: 'Ongoing', icon: <Clock className="w-4 h-4" /> },
    {
      value: 'completed',
      label: 'Completed',
      icon: <CheckCircle className="w-4 h-4" />,
    },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types', icon: <Grid3X3 className="w-4 h-4" /> },
    { value: 'online', label: 'Online', icon: <Globe className="w-4 h-4" /> },
    {
      value: 'offline',
      label: 'Offline',
      icon: <MapPin className="w-4 h-4" />,
    },
  ];

  const accessOptions = [
    {
      value: 'all',
      label: 'All Access',
      icon: <Settings className="w-4 h-4" />,
    },
    {
      value: 'free',
      label: 'Free to Join',
      icon: <Unlock className="w-4 h-4" />,
    },
    {
      value: 'code',
      label: 'Code Required',
      icon: <Lock className="w-4 h-4" />,
    },
  ];

  const participationOptions = [
    {
      value: 'all',
      label: 'All Participation',
      icon: <Users className="w-4 h-4" />,
    },
    {
      value: 'joined',
      label: 'Joined Events',
      icon: <CheckCircle className="w-4 h-4" />,
    },
    {
      value: 'unjoined',
      label: 'Not Joined',
      icon: <Plus className="w-4 h-4" />,
    },
  ];

  // Helper functions for filter dropdowns
  const getStatusIcon = value => {
    const option = statusOptions.find(opt => opt.value === value);
    return option ? option.icon : <List className="w-4 h-4" />;
  };

  const getStatusLabel = value => {
    const option = statusOptions.find(opt => opt.value === value);
    return option ? option.label : 'All Events';
  };

  const getTypeIcon = value => {
    const option = typeOptions.find(opt => opt.value === value);
    return option ? option.icon : <Grid3X3 className="w-4 h-4" />;
  };

  const getTypeLabel = value => {
    const option = typeOptions.find(opt => opt.value === value);
    return option ? option.label : 'All Types';
  };

  const getAccessIcon = value => {
    const option = accessOptions.find(opt => opt.value === value);
    return option ? option.icon : <Settings className="w-4 h-4" />;
  };

  const getAccessLabel = value => {
    const option = accessOptions.find(opt => opt.value === value);
    return option ? option.label : 'All Access';
  };

  const getParticipationIcon = value => {
    const option = participationOptions.find(opt => opt.value === value);
    return option ? option.icon : <Users className="w-4 h-4" />;
  };

  const getParticipationLabel = value => {
    const option = participationOptions.find(opt => opt.value === value);
    return option ? option.label : 'All Participation';
  };

  return (
    <div className="mt-4">
      {/* Search and Filters Section */}
      <div className="mb-5">
        {/* Search Bar */}
        <div className="mb-3">
          <Input
            type="text"
            placeholder="Search events by name..."
            value={filters.searchQuery}
            onChange={e => dispatch(setJoinEventsSearchQuery(e.target.value))}
            icon={Search}
            rightIcon={filters.searchQuery ? X : null}
            onRightIconClick={clearSearch}
            className="text-sm"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-2">
          <FilterDropdown
            options={statusOptions}
            value={filters.statusFilter}
            onChange={value => dispatch(setJoinEventsStatusFilter(value))}
            getIcon={getStatusIcon}
            getLabel={getStatusLabel}
            minWidth="140px"
          />

          <FilterDropdown
            options={typeOptions}
            value={filters.typeFilter}
            onChange={value => dispatch(setJoinEventsTypeFilter(value))}
            getIcon={getTypeIcon}
            getLabel={getTypeLabel}
            minWidth="140px"
          />

          <FilterDropdown
            options={accessOptions}
            value={filters.accessFilter}
            onChange={value => dispatch(setJoinEventsAccessFilter(value))}
            getIcon={getAccessIcon}
            getLabel={getAccessLabel}
            minWidth="150px"
          />

          <FilterDropdown
            options={participationOptions}
            value={filters.participationFilter}
            onChange={value =>
              dispatch(setJoinEventsParticipationFilter(value))
            }
            getIcon={getParticipationIcon}
            getLabel={getParticipationLabel}
            minWidth="160px"
          />
        </div>

        {/* Search and Filter Results Info */}
        {(filters.searchQuery ||
          filters.statusFilter !== 'all' ||
          filters.typeFilter !== 'all' ||
          filters.accessFilter !== 'all' ||
          filters.participationFilter !== 'all') && (
          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs text-gray-600">
              {filteredEvents.length === events.length ? (
                <span>Showing all {events.length} events</span>
              ) : (
                <span>
                  Found {filteredEvents.length} of {events.length} events
                </span>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="text-xs text-purple-600 hover:text-purple-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="w-full space-y-3">
          {[1, 2, 3].map(index => (
            <EventSkeletonCard key={`skeleton-${index}`} />
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="w-full">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event._id || event.id || `join-event-${index}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={cardVariants}
              className="mb-3"
            >
              <EventCard
                event={event}
                isUserEvent={false}
                userEvents={userEvents}
                user={user}
                onViewEvent={onViewEvent}
                onDeleteEvent={onDeleteEvent}
                onJoinLeaveEvent={onJoinLeaveEvent}
                showActions={true}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 mt-6">
          <div className="text-gray-400 mb-3">
            {filters.searchQuery ||
            filters.statusFilter !== 'all' ||
            filters.typeFilter !== 'all' ||
            filters.accessFilter !== 'all' ||
            filters.participationFilter !== 'all' ? (
              <Search className="mx-auto h-8 w-8 animate-float-up-down" />
            ) : (
              <Calendar className="mx-auto h-8 w-8 animate-float-up-down" />
            )}
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1.5">
            {filters.searchQuery ||
            filters.statusFilter !== 'all' ||
            filters.typeFilter !== 'all' ||
            filters.accessFilter !== 'all' ||
            filters.participationFilter !== 'all'
              ? 'No events found'
              : 'No events available to join'}
          </h3>
          <p className="text-sm text-gray-500">
            {filters.searchQuery ||
            filters.statusFilter !== 'all' ||
            filters.typeFilter !== 'all' ||
            filters.accessFilter !== 'all' ||
            filters.participationFilter !== 'all'
              ? "We couldn't find any events that match your current filters."
              : 'Check back later for new events or create your own!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default JoinEvents;
