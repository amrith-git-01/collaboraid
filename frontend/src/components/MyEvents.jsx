import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Plus,
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
  Layers,
} from 'lucide-react';
import EventCard from './EventCard';
import Button from './ui/Button';
import Input from './ui/Input';
import UIVerseLoader from './ui/UIVerseLoader';
import FilterDropdown from './ui/FilterDropdown';
import {
  setMyEventsSearchQuery,
  setMyEventsStatusFilter,
  setMyEventsTypeFilter,
  setMyEventsAccessFilter,
  setMyEventsOwnershipFilter,
  clearMyEventsFilters,
} from '../store/filtersSlice';
import {
  selectMyEventsFilters,
  selectFilteredMyEvents,
} from '../store/selectors';

const MyEvents = ({
  loading,
  userEvents,
  user,
  onViewEvent,
  onEditEvent,
  onDeleteEvent,
  onJoinLeaveEvent,
  onCreateEvent,
}) => {
  const dispatch = useDispatch();
  const filters = useSelector(selectMyEventsFilters);
  const filteredEvents = useSelector(selectFilteredMyEvents);

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
    dispatch(setMyEventsSearchQuery(''));
  };

  const clearFilters = () => {
    dispatch(clearMyEventsFilters());
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'upcoming':
        return <Calendar className="w-4 h-4" />;
      case 'ongoing':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'all':
        return <List className="w-4 h-4" />;
      default:
        return <List className="w-4 h-4" />;
    }
  };

  const getStatusLabel = status => {
    switch (status) {
      case 'upcoming':
        return 'Upcoming';
      case 'ongoing':
        return 'Ongoing';
      case 'completed':
        return 'Completed';
      case 'all':
        return 'All Events';
      default:
        return 'All Events';
    }
  };

  const getTypeIcon = type => {
    switch (type) {
      case 'online':
        return <Globe className="w-4 h-4" />;
      case 'offline':
        return <MapPin className="w-4 h-4" />;
      case 'all':
        return <Grid3X3 className="w-4 h-4" />;
      default:
        return <Grid3X3 className="w-4 h-4" />;
    }
  };

  const getTypeLabel = type => {
    switch (type) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'all':
        return 'All Types';
      default:
        return 'All Types';
    }
  };

  const getAccessIcon = access => {
    switch (access) {
      case 'free':
        return <Unlock className="w-4 h-4" />;
      case 'code':
        return <Lock className="w-4 h-4" />;
      case 'all':
        return <Settings className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getAccessLabel = access => {
    switch (access) {
      case 'free':
        return 'Free to Join';
      case 'code':
        return 'Code Required';
      case 'all':
        return 'All Access';
      default:
        return 'All Access';
    }
  };

  const getOwnershipIcon = ownership => {
    switch (ownership) {
      case 'created':
        return <Plus className="w-4 h-4" />;
      case 'joined':
        return <CheckCircle className="w-4 h-4" />;
      case 'all':
        return <Layers className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const getOwnershipLabel = ownership => {
    switch (ownership) {
      case 'created':
        return 'Created by Me';
      case 'joined':
        return 'Joined Events';
      case 'all':
        return 'All Categories';
      default:
        return 'All Categories';
    }
  };

  const statusOptions = [
    {
      value: 'all',
      label: 'All Events',
      icon: <List className="w-4 h-4" />,
    },
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
    {
      value: 'all',
      label: 'All Types',
      icon: <Grid3X3 className="w-4 h-4" />,
    },
    {
      value: 'online',
      label: 'Online',
      icon: <Globe className="w-4 h-4" />,
    },
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

  const ownershipOptions = [
    {
      value: 'all',
      label: 'All Categories',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      value: 'created',
      label: 'Created by Me',
      icon: <Plus className="w-4 h-4" />,
    },
    {
      value: 'joined',
      label: 'Joined Events',
      icon: <CheckCircle className="w-4 h-4" />,
    },
  ];

  return (
    <div className="mt-4">
      {/* Search and Filter Bar */}
      <div className="mb-5">
        {/* Search Bar */}
        <div className="mb-3">
          <Input
              type="text"
              value={filters.searchQuery}
              onChange={e => dispatch(setMyEventsSearchQuery(e.target.value))}
              placeholder="Search your events by name..."
            icon={Search}
            rightIcon={filters.searchQuery ? X : null}
            onRightIconClick={clearSearch}
            className="text-sm"
          />
        </div>

        {/* Filter Bar - Flexible Layout */}
        <div className="flex flex-wrap gap-2">
          {/* Status Filter Dropdown */}
          <FilterDropdown
            options={statusOptions}
            value={filters.statusFilter}
            onChange={value => dispatch(setMyEventsStatusFilter(value))}
            getIcon={getStatusIcon}
            getLabel={getStatusLabel}
            minWidth="140px"
          />

          {/* Type Filter Dropdown */}
          <FilterDropdown
            options={typeOptions}
            value={filters.typeFilter}
            onChange={value => dispatch(setMyEventsTypeFilter(value))}
            getIcon={getTypeIcon}
            getLabel={getTypeLabel}
            minWidth="140px"
          />

          {/* Access Filter Dropdown */}
          <FilterDropdown
            options={accessOptions}
            value={filters.accessFilter}
            onChange={value => dispatch(setMyEventsAccessFilter(value))}
            getIcon={getAccessIcon}
            getLabel={getAccessLabel}
            minWidth="150px"
          />

          {/* Ownership Filter Dropdown */}
          <FilterDropdown
            options={ownershipOptions}
            value={filters.ownershipFilter}
            onChange={value => dispatch(setMyEventsOwnershipFilter(value))}
            getIcon={getOwnershipIcon}
            getLabel={getOwnershipLabel}
            minWidth="160px"
          />
        </div>

        {/* Search and Filter Results Info - Responsive Layout */}
        {(filters.searchQuery ||
          filters.statusFilter !== 'all' ||
          filters.typeFilter !== 'all' ||
          filters.accessFilter !== 'all' ||
          filters.ownershipFilter !== 'all') && (
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-xs text-gray-600">
              {filteredEvents.length === userEvents.length ? (
                <span>Showing all {userEvents.length} events</span>
              ) : (
                <span>
                  Found {filteredEvents.length} of {userEvents.length} events
                </span>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="text-xs text-purple-600 hover:text-purple-700 transition-colors self-start sm:self-auto"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-6">
          <UIVerseLoader text="Loading..." />
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="w-full">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event._id || event.id || `user-event-${index}`}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={cardVariants}
              className="mb-3"
            >
              <EventCard
                event={event}
                isUserEvent={true}
                user={user}
                userEvents={userEvents}
                onViewEvent={onViewEvent}
                onEditEvent={onEditEvent}
                onDeleteEvent={onDeleteEvent}
                onJoinLeaveEvent={onJoinLeaveEvent}
                showActions={true}
              />
            </motion.div>
          ))}
        </div>
      ) : filters.searchQuery ||
        filters.statusFilter !== 'all' ||
        filters.typeFilter !== 'all' ||
        filters.accessFilter !== 'all' ||
        filters.ownershipFilter !== 'all' ? (
        // No search/filter results
        <div className="text-center py-6 px-4 mt-6">
          <div className="text-gray-400 mb-3">
            <Search className="mx-auto h-8 w-8 animate-float-up-down" />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1.5">
            No events found
          </h3>
          <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
            We couldn't find any events that match your current filters.
          </p>
        </div>
      ) : (
        // No events at all
        <div className="text-center py-6 px-4 mt-6">
          <div className="text-gray-400 mb-3">
            <Calendar className="mx-auto h-8 w-8 animate-float-up-down" />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1.5">
            No events created yet
          </h3>
          <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
            Start by creating your first event to get started.
          </p>
          <div className="flex justify-center">
            <Button
              variant="primary"
              size="sm"
              rounded="lg"
              onClick={onCreateEvent}
              className="text-sm"
            >
              Create Your First Event
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;
