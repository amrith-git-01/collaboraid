import { createNotification } from './notificationsSlice';

export const notificationsMiddleware = (store) => (next) => (action) => {
    const result = next(action);

    // Handle event actions
    if (action.type.startsWith('events/')) {
        const { type, payload } = action;

        if (type === 'events/createEvent/fulfilled') {
            const event = payload.data?.event || payload;
            const notification = {
                title: 'Event Created',
                message: `"${event.eventName}" has been created successfully.`,
            };
            // Then save to backend
            store.dispatch(createNotification(notification));
        } else if (type === 'events/updateEvent/fulfilled') {
            const event = payload.data?.event || payload;
            const notification = {
                title: 'Event Updated',
                message: `"${event.eventName}" has been updated successfully.`,
            };
            store.dispatch(createNotification(notification));
        } else if (type === 'events/deleteEvent/fulfilled') {
            const notification = {
                title: 'Event Deleted',
                message: 'Event has been deleted successfully.',
            };
            store.dispatch(createNotification(notification));
        } else if (type === 'events/joinEvent/fulfilled') {
            const event = payload.data?.event || payload.event || {};
            const notification = {
                title: 'Joined Event',
                message: `You have successfully joined "${event.eventName || 'the event'}".`,
            };
            store.dispatch(createNotification(notification));
        } else if (type === 'events/leaveEvent/fulfilled') {
            const event = payload.data?.event || payload.event || {};
            const notification = {
                title: 'Left Event',
                message: `You have left "${event.eventName || 'the event'}".`,
            };
            store.dispatch(createNotification(notification));
        }
    }

    // Handle organization actions
    if (action.type.startsWith('organization/')) {
        const { type, payload } = action;

        if (type === 'organization/createOrganization/fulfilled') {
            const org = payload.data?.organization || payload;
            const notification = {
                title: 'Organization Created',
                message: `"${org.organizationName || 'Organization'}" has been created successfully.`,
            };
            store.dispatch(createNotification(notification));
        } else if (type === 'organization/updateOrganization/fulfilled') {
            const org = payload.data?.organization || payload;
            const notification = {
                title: 'Organization Updated',
                message: `"${org.organizationName || 'Organization'}" has been updated successfully.`,
            };
            store.dispatch(createNotification(notification));
        } else if (type === 'organization/deleteOrganization/fulfilled') {
            const notification = {
                title: 'Organization Deleted',
                message: 'Organization has been deleted successfully.',
            };
            store.dispatch(createNotification(notification));
        } else if (type === 'organization/joinOrganization/fulfilled') {
            const org = payload.data?.organization || payload;
            const notification = {
                title: 'Joined Organization',
                message: `You have successfully joined "${org.organizationName || 'the organization'}".`,
            };
            store.dispatch(createNotification(notification));
        }
    }

    return result;
};
