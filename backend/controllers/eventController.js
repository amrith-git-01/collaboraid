const Event = require('../models/eventModel');
const Organization = require('../models/organizationModel');
const { uploads, processAndUploadImage, imagePresets } = require('../utils/multerConfig');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create a new event
exports.createEvent = catchAsync(async (req, res, next) => {
    try {
        const {
            eventName,
            eventDescription,
            eventType,
            eventAccessType,
            eventJoinCode,
            eventStartDate,
            eventEndDate,
            eventMaxAttendees,
            eventOrganization,
            online,
            offline
        } = req.body;

        // Get the current user from the request (set by auth middleware)
        const eventCreator = req.user.id;

        // 1. BASIC VALIDATION
        if (!eventName || !eventDescription || !eventType || !eventAccessType || !eventStartDate || !eventEndDate || !eventMaxAttendees || !eventOrganization) {
            return next(new AppError('Please provide all required fields', 400));
        }

        // 1.5. ORGANIZATION VALIDATION
        const organization = await Organization.findOne({
            _id: eventOrganization,
            organizationCreator: eventCreator,
            isDeleted: false
        });

        if (!organization) {
            return next(new AppError('Invalid organization. Please ensure you have created an organization before creating events.', 400));
        }

        // 2. EVENT TYPE VALIDATION
        if (!['online', 'offline'].includes(eventType)) {
            return next(new AppError('Event type must be either "online" or "offline"', 400));
        }

        // 3. EVENT ACCESS TYPE VALIDATION
        if (!['freeForAll', 'codeToJoin'].includes(eventAccessType)) {
            return next(new AppError('Event access type must be either "freeForAll" or "codeToJoin"', 400));
        }

        // 4. JOIN CODE VALIDATION
        if (eventAccessType === 'codeToJoin') {
            if (!eventJoinCode || eventJoinCode.trim().length < 4) {
                return next(new AppError('Join code must be at least 4 characters long for code-protected events', 400));
            }
            if (eventJoinCode.trim().length > 20) {
                return next(new AppError('Join code must be less than 20 characters long', 400));
            }
        }

        // 5. DATE VALIDATION
        const startDate = new Date(eventStartDate);
        const endDate = new Date(eventEndDate);
        const currentDate = new Date();

        // Check if dates are valid
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return next(new AppError('Please provide valid start and end dates', 400));
        }

        // Check if start date is in the past
        if (startDate < currentDate) {
            return next(new AppError('Event start date cannot be in the past', 400));
        }

        // Check if end date is before start date
        if (endDate <= startDate) {
            return next(new AppError('Event end date must be after start date', 400));
        }

        // 6. ATTENDEE VALIDATION
        if (eventMaxAttendees < 1) {
            return next(new AppError('Event must have at least 1 attendee', 400));
        }

        if (eventMaxAttendees > 10000) {
            return next(new AppError('Event cannot have more than 10,000 attendees', 400));
        }

        // 7. ONLINE EVENT VALIDATION
        if (eventType === 'online') {
            if (!online || !online.eventPlatform || !online.eventLink) {
                return next(new AppError('Online events require platform and link information', 400));
            }

            // Validate platform
            if (online.eventPlatform.trim().length < 2) {
                return next(new AppError('Platform name must be at least 2 characters long', 400));
            }

            // Validate link format
            const urlPattern = /^https?:\/\/.+/;
            if (!urlPattern.test(online.eventLink)) {
                return next(new AppError('Please provide a valid event link starting with http:// or https://', 400));
            }
        }

        // 8. OFFLINE EVENT VALIDATION
        if (eventType === 'offline') {
            if (!offline || !offline.eventLocation) {
                return next(new AppError('Offline events require location information', 400));
            }

            if (offline.eventLocation.trim().length < 5) {
                return next(new AppError('Event location must be at least 5 characters long', 400));
            }

            // Validate venue name if provided
            if (offline.venueName && offline.venueName.trim().length < 2) {
                return next(new AppError('Venue name must be at least 2 characters long', 400));
            }

            // Validate venue address if provided
            if (offline.venueAddress && offline.venueAddress.trim().length < 10) {
                return next(new AppError('Venue address must be at least 10 characters long', 400));
            }
        }

        // 9. IMAGE VALIDATION - Preset image selection only
        console.log('=== BACKEND DEBUG ===');
        console.log('req.body:', req.body);
        console.log('req.body.eventImage:', req.body.eventImage);
        console.log('req.body.eventImageName:', req.body.eventImageName);
        console.log('===================');

        let eventImageUrl = '';
        let eventImageName = '';

        if (req.body.eventImage && req.body.eventImageName) {
            // Preset image case - use the selected preset image
            console.log('Using preset image:', req.body.eventImage, req.body.eventImageName);
            eventImageUrl = req.body.eventImage;
            eventImageName = req.body.eventImageName;
        } else {
            // No image provided
            console.log('No image found - validation failed');
            return next(new AppError('Event image is required. Please select an image from the preset collection.', 400));
        }

        // 10. NAME AND DESCRIPTION VALIDATION
        if (eventName.trim().length < 10 || eventName.trim().length > 40) {
            return next(new AppError('Event name must be between 10 and 40 characters', 400));
        }

        if (eventDescription.trim().length < 10 || eventDescription.trim().length > 200) {
            return next(new AppError('Event description must be between 10 and 200 characters', 400));
        }

        // Prepare event data with the processed image
        const eventData = {
            eventName: eventName.trim(),
            eventDescription: eventDescription.trim(),
            eventType,
            eventAccessType,
            eventJoinCode: eventAccessType === 'codeToJoin' ? eventJoinCode.trim() : undefined,
            eventStartDate: startDate,
            eventEndDate: endDate,
            eventImage: eventImageUrl, // Use the processed image URL
            eventCreator,
            eventOrganization: organization._id,
            eventMaxAttendees,
            eventParticipants: [],
            eventStatus: 'upcoming'
        };

        if (eventType === 'online') {
            eventData.online = {
                eventPlatform: online.eventPlatform.trim(),
                eventLink: online.eventLink.trim(),
                meetingId: online.meetingId ? online.meetingId.trim() : '',
                meetingPassword: online.meetingPassword ? online.meetingPassword.trim() : ''
            };
            eventData.offline = {
                eventLocation: '',
                venueName: '',
                venueAddress: ''
            };
        } else {
            eventData.offline = {
                eventLocation: offline.eventLocation.trim(),
                venueName: offline.venueName ? offline.venueName.trim() : '',
                venueAddress: offline.venueAddress ? offline.venueAddress.trim() : ''
            };
            eventData.online = {
                eventPlatform: '',
                eventLink: '',
                meetingId: '',
                meetingPassword: ''
            };
        }

        // Create event with the preset image
        const newEvent = await Event.create(eventData);

        // Populate the eventCreator and eventOrganization fields
        const populatedEvent = await Event.findById(newEvent._id)
            .populate('eventCreator', 'name email')
            .populate('eventOrganization', 'organizationName description organizationUrl')
            .populate('eventParticipants', 'name email');

        res.status(201).json({
            status: 'success',
            message: 'Event created successfully',
            data: {
                event: populatedEvent
            }
        });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return next(new AppError(`Validation Error: ${validationErrors.join(', ')}`, 400));
        }

        if (error.code === 11000) {
            return next(new AppError('An event with this name already exists', 400));
        }

        console.error('Event creation error:', error);
        return next(new AppError('Failed to create event. Please try again.', 500));
    }
});

exports.getAllEvents = catchAsync(async (req, res, next) => {
    const {
        eventType,
        eventStatus,
        eventAccessType,
        page = 1,
        limit = 10,
        sortBy = 'eventCreatedAt',
        sortOrder = 'desc'
    } = req.query;

    const filter = { isDeleted: false };

    if (eventType && ['online', 'offline'].includes(eventType)) {
        filter.eventType = eventType;
    }

    if (eventStatus && ['upcoming', 'ongoing', 'completed'].includes(eventStatus)) {
        filter.eventStatus = eventStatus;
    }

    if (eventAccessType && ['freeForAll', 'codeToJoin'].includes(eventAccessType)) {
        filter.eventAccessType = eventAccessType;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const events = await Event.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('eventCreator', 'name email')
        .populate('eventParticipants', 'name email');

    const totalEvents = await Event.countDocuments(filter);

    res.status(200).json({
        status: 'success',
        results: events.length,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalEvents / limitNum),
            totalEvents,
            hasNextPage: skip + limitNum < totalEvents,
            hasPrevPage: parseInt(page) > 1
        },
        data: {
            events
        }
    });
});

exports.getEvent = catchAsync(async (req, res, next) => {
    const event = await Event.findById(req.params.id)
        .populate('eventCreator', 'name email')
        .populate('eventParticipants', 'name email');

    if (!event) {
        return next(new AppError('Event not found', 404));
    }

    if (event.isDeleted) {
        return next(new AppError('Event is no longer available', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            event
        }
    });
});

exports.updateEvent = catchAsync(async (req, res, next) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        return next(new AppError('Event not found', 404));
    }

    if (event.isDeleted) {
        return next(new AppError('Event is no longer available', 404));
    }

    if (event.eventCreator.toString() !== req.user.id) {
        return next(new AppError('You can only update events you created', 403));
    }

    // Prepare update data with conditional validation
    const updateData = { ...req.body };

    // Check if there are any actual changes
    const hasChanges = Object.keys(updateData).some(key => {
        if (key === 'online' || key === 'offline') {
            // For nested objects, check if any nested property has changed
            const originalValue = event[key] || {};
            const newValue = updateData[key] || {};
            return Object.keys(newValue).some(nestedKey =>
                originalValue[nestedKey] !== newValue[nestedKey]
            );
        }
        return event[key] !== updateData[key];
    });

    if (!hasChanges) {
        return res.status(200).json({
            status: 'success',
            message: 'No changes were made to the event',
            data: {
                event: event
            }
        });
    }

    // Only validate join code if access type is codeToJoin and join code is provided
    if (updateData.eventAccessType === 'codeToJoin' && updateData.eventJoinCode) {
        if (updateData.eventJoinCode.trim().length < 4) {
            return next(new AppError('Join code must be at least 4 characters long', 400));
        }
        if (updateData.eventJoinCode.trim().length > 20) {
            return next(new AppError('Join code must be less than 20 characters long', 400));
        }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
            new: true,
            runValidators: false // Disable automatic validators to handle custom validation
        }
    ).populate('eventCreator', 'name email')
        .populate('eventParticipants', 'name email');

    res.status(200).json({
        status: 'success',
        message: 'Event updated successfully',
        data: {
            event: updatedEvent
        }
    });
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        return next(new AppError('Event not found', 404));
    }

    // Check if user is the event creator
    if (event.eventCreator.toString() !== req.user.id) {
        return next(new AppError('You can only delete events you created', 403));
    }

    // Check if event is already deleted
    if (event.isDeleted) {
        return next(new AppError('Event is already deleted', 400));
    }

    // Check if event is ongoing or completed (prevent deletion of active events)
    if (event.eventStatus === 'ongoing' || event.eventStatus === 'completed') {
        return next(new AppError('Cannot delete ongoing or completed events', 400));
    }

    // Check if event has participants (prevent deletion of events with registrations)
    if (event.eventParticipants && event.eventParticipants.length > 0) {
        return next(new AppError('Cannot delete event with registered participants. Please cancel the event instead.', 400));
    }

    // Soft delete - set isDeleted to true and eventDeletedAt timestamp
    const deletedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        {
            isDeleted: true,
            eventDeletedAt: new Date()
        },
        {
            new: true,
            runValidators: false
        }
    );

    res.status(200).json({
        status: 'success',
        message: 'Event deleted successfully',
        data: {
            event: {
                id: deletedEvent._id,
                eventName: deletedEvent.eventName,
                eventStatus: deletedEvent.eventStatus,
                isDeleted: deletedEvent.isDeleted,
                eventDeletedAt: deletedEvent.eventDeletedAt
            }
        }
    });
});

// Get events created by or joined by the current user
exports.getMyEvents = catchAsync(async (req, res, next) => {
    const events = await Event.find({
        $or: [
            { eventCreator: req.user.id }, // Events created by the user
            { eventParticipants: req.user.id } // Events joined by the user
        ],
        isDeleted: false
    })
        .sort({ eventCreatedAt: -1 })
        .populate('eventCreator', 'name email')
        .populate('eventParticipants', 'name email');

    res.status(200).json({
        status: 'success',
        results: events.length,
        data: {
            events
        }
    });
});

// Get events the user has joined
exports.getJoinedEvents = catchAsync(async (req, res, next) => {
    const events = await Event.find({
        eventParticipants: req.user.id,
        isDeleted: false
    })
        .sort({ eventCreatedAt: -1 })
        .populate('eventCreator', 'name email')
        .populate('eventParticipants', 'name email');

    res.status(200).json({
        status: 'success',
        results: events.length,
        data: {
            events
        }
    });
});

// Get deleted events created by the current user
exports.getDeletedEvents = catchAsync(async (req, res, next) => {
    const deletedEvents = await Event.find({
        eventCreator: req.user.id,
        isDeleted: true
    })
        .sort({ eventDeletedAt: -1 }) // Sort by deletion date (most recent first)
        .populate('eventCreator', 'name email')
        .populate('eventParticipants', 'name email');

    res.status(200).json({
        status: 'success',
        results: deletedEvents.length,
        data: {
            deletedEvents
        }
    });
});

// Join an event
exports.joinEvent = catchAsync(async (req, res, next) => {
    const eventId = req.params.id;
    let joinCode = null;
    if (req.body) {
        joinCode = req.body.joinCode;
    }

    if (!eventId) {
        return next(new AppError('Event ID is required', 400));
    }

    const event = await Event.findById(eventId);

    if (!event) {
        return next(new AppError('Event not found', 404));
    }

    if (event.isDeleted) {
        return next(new AppError('Event is no longer available', 400));
    }

    if (event.eventCreator.toString() === req.user.id) {
        return next(new AppError('You cannot join your own event', 400));
    }

    // Check if user is already a participant
    if (event.eventParticipants.includes(req.user.id)) {
        return next(new AppError('You are already registered for this event', 400));
    }

    // Check if event is full
    if (event.eventParticipants.length >= event.eventMaxAttendees) {
        return next(new AppError('Event is full', 400));
    }

    // Check if event requires join code
    if (event.eventAccessType === 'codeToJoin') {
        if (!joinCode) {
            return next(new AppError('Join code is required for this event', 400));
        }
        if (joinCode !== event.eventJoinCode) {
            return next(new AppError('Invalid join code', 400));
        }
    }

    // Add user to participants
    const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $push: { eventParticipants: req.user.id } },
        {
            new: true,
            runValidators: false // Disable validators to avoid join code validation issues
        }
    );

    res.status(200).json({
        status: 'success',
        message: 'Successfully joined event',
        data: {
            event: updatedEvent
        }
    });
});

// Leave an event
exports.leaveEvent = catchAsync(async (req, res, next) => {
    const eventId = req.params.id;

    if (!eventId) {
        return next(new AppError('Event ID is required', 400));
    }

    const event = await Event.findById(eventId);

    if (!event) {
        return next(new AppError('Event not found', 404));
    }

    if (event.eventCreator.toString() === req.user.id) {
        return next(new AppError('You cannot leave your own event', 400));
    }

    // Check if user is a participant
    if (!event.eventParticipants.includes(req.user.id)) {
        return next(new AppError('You are not registered for this event', 400));
    }

    // Remove user from participants
    const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $pull: { eventParticipants: req.user.id } },
        {
            new: true,
            runValidators: false // Disable validators to avoid join code validation issues
        }
    );

    res.status(200).json({
        status: 'success',
        message: 'Successfully left event',
        data: {
            event: updatedEvent
        }
    });
});

