const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: [true, 'An event must have a name'],
        trim: true,
        maxlength: [40, 'An event name must have less or equal than 40 characters'],
        minlength: [10, 'An event name must have more or equal than 10 characters'],
    },
    eventDescription: {
        type: String,
        required: [true, 'An event must have a description'],
        trim: true,
        maxlength: [300, 'An event description must have less or equal than 300 characters'],
        minlength: [10, 'An event description must have more or equal than 10 characters'],
    },
    eventType: {
        type: String,
        required: [true, 'An event must have a type'],
        enum: ['online', 'offline'],
    },
    eventAccessType: {
        type: String,
        required: [true, 'An event must have an access type'],
        enum: ['freeForAll', 'codeToJoin'],
    },
    eventJoinCode: {
        type: String,
        required: function () {
            return this.eventAccessType === 'codeToJoin';
        },
        trim: true,
        minlength: [4, 'Join code must be at least 4 characters long'],
        maxlength: [20, 'Join code must be less than 20 characters long'],
    },
    eventStartDate: {
        type: Date,
        required: [true, 'An event must have a start date'],
    },
    eventEndDate: {
        type: Date,
        required: [true, 'An event must have an end date'],
    },
    eventStatus: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed'],
        default: 'upcoming',
    },
    eventImage: {
        type: String,
        trim: true,
        required: [true, 'An event must have an image'],
    },
    eventCreator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'An event must have a creator'],
    },
    eventMaxAttendees: {
        type: Number,
        required: [true, 'An event must have a maximum number of attendees'],
    },
    eventParticipants: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
    },
    online: {
        eventPlatform: {
            type: String,
        },
        eventLink: {
            type: String,
        },
    },
    offline: {
        eventLocation: {
            type: String,
        },
        coordinates: {
            lat: {
                type: Number,
            },
            lon: {
                type: Number,
            },
        },
    },
    eventCreatedAt: {
        type: Date,
        default: Date.now,
    },
    eventUpdatedAt: {
        type: Date,
        default: Date.now,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    eventDeletedAt: {
        type: Date,
        default: null,
    }
}, {
    timestamps: true,
    versionKey: false,
});

eventSchema.pre('save', function (next) {
    // Validate event type specific requirements
    if (this.eventType == 'online') {
        if (!this.online.eventPlatform || !this.online.eventLink) {
            return next(new Error('An online event must have a platform and a link'));
        }
        this.offline = undefined;
    }
    if (this.eventType == 'offline') {
        if (!this.offline.eventLocation) {
            return next(new Error('An offline event must have a location'));
        }
        this.online = undefined;
    }

    // Validate access type specific requirements
    if (this.eventAccessType === 'codeToJoin' && !this.eventJoinCode) {
        return next(new Error('A code-protected event must have a join code'));
    }

    // Clean up join code if not needed
    if (this.eventAccessType === 'freeForAll') {
        this.eventJoinCode = undefined;
    }

    next();
})

eventSchema.pre('/^find/', function (next) {
    this.set({
        eventUpdatedAt: Date.now(),
    });
    next();
});

eventSchema.virtual('eventRemainingAttendees').get(function () {
    return this.eventMaxAttendees - this.eventParticipants.length;
});

eventSchema.virtual('isCodeProtected').get(function () {
    return this.eventAccessType === 'codeToJoin';
});

eventSchema.virtual('isFreeForAll').get(function () {
    return this.eventAccessType === 'freeForAll';
});

eventSchema.set('toJSON', {
    virtuals: true,
});
eventSchema.set('toObject', {
    virtuals: true,
});

// Create indexes for better query performance
eventSchema.index({ eventAccessType: 1 });
eventSchema.index({ eventJoinCode: 1 });
eventSchema.index({ eventType: 1, eventAccessType: 1 });
eventSchema.index({ isDeleted: 1 }); // Index for soft delete filtering

// Static method to generate unique join codes
eventSchema.statics.generateUniqueJoinCode = async function () {
    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    let code;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
        code = generateCode();
        const existingEvent = await this.findOne({ eventJoinCode: code });
        if (!existingEvent) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        throw new Error('Unable to generate unique join code after multiple attempts');
    }

    return code;
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;