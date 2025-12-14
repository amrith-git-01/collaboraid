const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const Organization = require('../models/organizationModel');
const Notification = require('../models/notificationModel');

// Load environment variables
dotenv.config({ path: './config.env', quiet: true });

// Notification templates based on app context
const notificationTemplates = [
    {
        title: 'Welcome to Unite!',
        message: (userName) => `Welcome ${userName}! We're excited to have you on board. Start by creating an organization or joining one.`,
    },
    {
        title: 'Event Created Successfully',
        message: (userName, eventName) => `Your event "${eventName || 'Tech Conference 2024'}" has been created successfully!`,
        action: { label: 'View Event', url: '/events' },
    },
    {
        title: 'Invitation Sent',
        message: (userName, orgName) => `You have invited users to join "${orgName || 'Your Organization'}".`,
    },
    {
        title: 'Event Joined',
        message: (userName, eventName) => `You have successfully joined "${eventName || 'Web Development Workshop'}".`,
        action: { label: 'View Event', url: '/events' },
    },
    {
        title: 'Profile Updated',
        message: (userName) => `Your profile has been updated successfully.`,
    },
    {
        title: 'Organization Created',
        message: (userName, orgName) => `Your organization "${orgName || 'New Organization'}" has been created successfully!`,
    },
    {
        title: 'Organization Invitation',
        message: (userName, invitorName, orgName) => `${invitorName || 'John Doe'} has invited you to join "${orgName || 'Tech Corp'}". Use the invitation code to join.`,
        action: { label: 'Join Organization', url: '/settings' },
    },
    {
        title: 'New Event Available',
        message: (userName, eventName) => `A new event "${eventName || 'Innovation Summit'}" is now available in your organization.`,
        action: { label: 'View Events', url: '/events' },
    },
    {
        title: 'Event Starting Soon',
        message: (userName, eventName) => `Your event "${eventName || 'Team Meeting'}" is starting in 1 hour.`,
        action: { label: 'View Event', url: '/calendar' },
    },
    {
        title: 'Event Reminder',
        message: (userName, eventName) => `Don't forget! "${eventName || 'Workshop'}" is scheduled for tomorrow.`,
    },
    {
        title: 'New Member Joined',
        message: (userName, memberName) => `${memberName || 'New Member'} has joined your organization.`,
    },
    {
        title: 'Event Capacity Warning',
        message: (userName, eventName) => `Your event "${eventName || 'Conference'}" is almost full. Only 5 spots remaining!`,
        action: { label: 'Manage Event', url: '/events' },
    },
    {
        title: 'Event Starting Soon',
        message: (userName, eventName) => `Your event "${eventName || 'Meeting'}" starts in 30 minutes. Make sure everything is ready!`,
    },
    {
        title: 'Profile Incomplete',
        message: (userName) => `Your profile is incomplete. Add more information to help others connect with you.`,
        action: { label: 'Update Profile', url: '/settings' },
    },
    {
        title: 'Event Cancelled',
        message: (userName, eventName) => `The event "${eventName || 'Workshop'}" has been cancelled.`,
    },
    {
        title: 'Failed to Join Event',
        message: (userName, eventName) => `Unable to join "${eventName || 'Event'}" - event is full or invalid join code.`,
    },
    {
        title: 'Event Update Failed',
        message: (userName) => `Failed to update your event. Please try again or contact support.`,
    },
];

// Event names for variety
const eventNames = [
    'Tech Innovation Summit',
    'Web Development Workshop',
    'Team Building Event',
    'Annual Conference',
    'Product Launch',
    'Networking Meetup',
    'Training Session',
    'Hackathon 2024',
    'Design Thinking Workshop',
    'Agile Methodology Seminar',
];

// Organization names for variety
const organizationNames = [
    'Tech Corp',
    'Innovation Labs',
    'Digital Solutions',
    'Creative Agency',
    'Startup Hub',
    'Dev Community',
    'Business Network',
];

// Get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Get random date within last N days
const getRandomDate = (daysAgo = 30) => {
    const now = new Date();
    const pastDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const randomTime = pastDate.getTime() + Math.random() * (now.getTime() - pastDate.getTime());
    return new Date(randomTime);
};

// Connect to database
const connectDB = async () => {
    try {
        const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
        await mongoose.connect(DB, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });
        console.log('✅ DB connection successful!');
    } catch (error) {
        console.error('❌ DB connection failed:', error.message);
        process.exit(1);
    }
};

// Seed notifications
const seedNotifications = async (options = {}) => {
    const {
        organizationId = null, // If provided, only seed for users in this organization
        userIds = null, // If provided, only seed for these specific user IDs
        count = 100, // Number of notifications to create
        readPercentage = 30, // Percentage of notifications that should be read
        daysAgo = 30, // Spread notifications over last N days
        organizationNotificationPercentage = 20, // Percentage of notifications that should be organization-wide
    } = options;

    try {
        // Get users based on options
        let users;
        if (userIds && Array.isArray(userIds)) {
            // Seed for specific users
            users = await User.find({ _id: { $in: userIds } });
            console.log(`📋 Found ${users.length} specified users`);
        } else if (organizationId) {
            // Seed for users in specific organization
            users = await User.find({ organizationId });
            console.log(`📋 Found ${users.length} users in organization ${organizationId}`);
        } else {
            // Seed for all users
            users = await User.find();
            console.log(`📋 Found ${users.length} total users in database`);
        }

        if (users.length === 0) {
            console.error('❌ No users found. Please create users first or check your filters.');
            process.exit(1);
        }

        // Get organizations for context
        const organizations = await Organization.find({ isDeleted: false });
        const orgMap = new Map();
        organizations.forEach(org => {
            orgMap.set(org._id.toString(), org.organizationName);
        });

        // Calculate distribution
        const orgNotificationCount = Math.floor(count * (organizationNotificationPercentage / 100));
        const userNotificationCount = count - orgNotificationCount;
        const readCount = Math.floor(count * (readPercentage / 100));
        const unreadCount = count - readCount;

        console.log(`\n📊 Seeding ${count} notifications:`);
        console.log(`   - ${userNotificationCount} user notifications`);
        console.log(`   - ${orgNotificationCount} organization notifications`);
        console.log(`   - ${unreadCount} unread`);
        console.log(`   - ${readCount} read`);
        console.log(`   - Spread over last ${daysAgo} days\n`);

        const notifications = [];
        const readNotifications = [];
        const unreadNotifications = [];

        // Get unique organization IDs from users
        const orgIds = [...new Set(users.map(u => u.organizationId).filter(Boolean))];

        // Track counters separately for user and org notifications
        let userNotificationsCreated = 0;
        let orgNotificationsCreated = 0;
        const userNotificationsToRead = Math.floor(userNotificationCount * (readPercentage / 100));
        const orgNotificationsToRead = Math.floor(orgNotificationCount * (readPercentage / 100));

        // Create notifications
        for (let i = 0; i < count; i++) {
            const isOrgNotification = orgNotificationsCreated < orgNotificationCount && orgIds.length > 0;

            let notification;

            if (isOrgNotification) {
                orgNotificationsCreated++;

                // Create organization notification
                const orgId = getRandomItem(orgIds);
                const orgName = orgMap.has(orgId.toString())
                    ? orgMap.get(orgId.toString())
                    : getRandomItem(organizationNames);

                // Get random template
                const template = getRandomItem(notificationTemplates);

                // Generate message (use a random user's name for context)
                const randomUser = getRandomItem(users);
                let message;
                if (template.message.length === 1) {
                    message = template.message(randomUser.name);
                } else if (template.message.length === 2) {
                    const eventName = getRandomItem(eventNames);
                    message = template.message(randomUser.name, eventName);
                } else {
                    const invitorName = getRandomItem(users).name;
                    message = template.message(randomUser.name, invitorName, orgName);
                }

                notification = {
                    organizationId: orgId,
                    title: template.title,
                    message: message,
                    readBy: [], // Will be populated later for read org notifications
                    deleted: false,
                    createdAt: getRandomDate(daysAgo),
                };

                // Add action if template has one
                if (template.action) {
                    notification.action = template.action;
                }

                // For organization notifications, we'll mark some as read by random users
                // This simulates some users having read the org notification
                const shouldBeRead = orgNotificationsCreated <= orgNotificationsToRead;
                if (shouldBeRead && users.length > 0) {
                    // Get users in this organization
                    const orgUsers = users.filter(u => u.organizationId && u.organizationId.toString() === orgId.toString());
                    if (orgUsers.length > 0) {
                        // Randomly select some users who have read this org notification
                        const numReaders = Math.floor(Math.random() * Math.min(orgUsers.length, 5)) + 1;
                        const readers = [];
                        for (let j = 0; j < numReaders; j++) {
                            const reader = getRandomItem(orgUsers);
                            readers.push(reader._id);
                        }
                        notification.readBy = [...new Set(readers)]; // Remove duplicates
                    }
                    readNotifications.push(notification);
                } else {
                    unreadNotifications.push(notification);
                }
            } else {
                userNotificationsCreated++;

                // Create user notification
                const user = getRandomItem(users);

                // Get user's organization name if available
                const userOrgName = user.organizationId && orgMap.has(user.organizationId.toString())
                    ? orgMap.get(user.organizationId.toString())
                    : getRandomItem(organizationNames);

                // Get random template
                const template = getRandomItem(notificationTemplates);

                // Generate message with context
                let message;
                if (template.message.length === 1) {
                    message = template.message(user.name);
                } else if (template.message.length === 2) {
                    const eventName = getRandomItem(eventNames);
                    message = template.message(user.name, eventName);
                } else {
                    const invitorName = getRandomItem(users).name;
                    const orgName = userOrgName;
                    message = template.message(user.name, invitorName, orgName);
                }

                notification = {
                    userId: user._id,
                    title: template.title,
                    message: message,
                    read: false, // Will be set later
                    deleted: false,
                    createdAt: getRandomDate(daysAgo),
                };

                // Add action if template has one
                if (template.action) {
                    notification.action = template.action;
                }

                // Determine if this should be read
                const shouldBeRead = userNotificationsCreated <= userNotificationsToRead;

                if (shouldBeRead) {
                    notification.read = true;
                    readNotifications.push(notification);
                } else {
                    unreadNotifications.push(notification);
                }
            }
        }

        // Combine and shuffle to mix read/unread
        const allNotifications = [...unreadNotifications, ...readNotifications];

        // Shuffle array
        for (let i = allNotifications.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allNotifications[i], allNotifications[j]] = [allNotifications[j], allNotifications[i]];
        }

        // Insert notifications
        console.log('⏳ Inserting notifications...');
        await Notification.insertMany(allNotifications);

        // Get statistics
        const stats = {
            total: allNotifications.length,
            userNotifications: allNotifications.filter(n => n.userId).length,
            organizationNotifications: allNotifications.filter(n => n.organizationId).length,
            read: readNotifications.length,
            unread: unreadNotifications.length,
            withAction: allNotifications.filter(n => n.action).length,
        };

        console.log('\n✅ Notifications seeded successfully!');
        console.log('\n📈 Statistics:');
        console.log(`   Total: ${stats.total}`);
        console.log(`   User Notifications: ${stats.userNotifications}`);
        console.log(`   Organization Notifications: ${stats.organizationNotifications}`);
        console.log(`   Read: ${stats.read}`);
        console.log(`   Unread: ${stats.unread}`);
        console.log(`   With Action URLs: ${stats.withAction}`);

    } catch (error) {
        console.error('❌ Error seeding notifications:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    await connectDB();

    // Parse command line arguments
    const args = process.argv.slice(2);
    const options = {};

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--organizationId' && args[i + 1]) {
            options.organizationId = args[i + 1];
            i++;
        } else if (args[i] === '--userIds' && args[i + 1]) {
            options.userIds = args[i + 1].split(',').map(id => id.trim());
            i++;
        } else if (args[i] === '--count' && args[i + 1]) {
            options.count = parseInt(args[i + 1]);
            i++;
        } else if (args[i] === '--readPercentage' && args[i + 1]) {
            options.readPercentage = parseInt(args[i + 1]);
            i++;
        } else if (args[i] === '--daysAgo' && args[i + 1]) {
            options.daysAgo = parseInt(args[i + 1]);
            i++;
        } else if (args[i] === '--organizationNotificationPercentage' && args[i + 1]) {
            options.organizationNotificationPercentage = parseInt(args[i + 1]);
            i++;
        }
    }

    try {
        await seedNotifications(options);
        console.log('\n✨ Done!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed.');
    }
};

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { seedNotifications };
