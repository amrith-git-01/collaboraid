const mongoose = require('mongoose');
const validator = require('validator');

const organizationSchema = new mongoose.Schema({
    organizationName: {
        type: String,
        required: [true, 'Organization name is required'],
        trim: true,
        minlength: [3, 'Organization name must be at least 3 characters long'],
        maxlength: [50, 'Organization name must be less than 50 characters long'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description must be less than 500 characters long'],
    },
    organizationUrl: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                if (!v) return true; // Optional field
                return validator.isURL(v, { protocols: ['http', 'https'], require_protocol: true });
            },
            message: 'Please provide a valid URL',
        },
    },
    location: {
        address: {
            type: String,
            trim: true,
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
    organizationCreator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Organization must have a creator'],
    },
    organizationMembers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: function () {
            // Default to include creator in members
            return this.organizationCreator ? [this.organizationCreator] : [];
        },
    },
    invitationCode: {
        type: String,
        required: [true, 'Invitation code is required'],
        unique: true,
        uppercase: true,
        trim: true,
        length: [10, 'Invitation code must be exactly 10 characters'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
    versionKey: false,
});

// Pre-save hook: Ensure creator is in members array
organizationSchema.pre('save', function (next) {
    if (this.isNew && this.organizationCreator) {
        // If this is a new organization and creator exists
        if (!this.organizationMembers || this.organizationMembers.length === 0) {
            this.organizationMembers = [this.organizationCreator];
        } else if (!this.organizationMembers.includes(this.organizationCreator)) {
            // Add creator to members if not already present
            this.organizationMembers.unshift(this.organizationCreator);
        }
    }
    next();
});

// Static method to generate unique invitation code
organizationSchema.statics.generateUniqueInvitationCode = async function () {
    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 10; i++) {
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
        const existingOrganization = await this.findOne({ invitationCode: code });
        if (!existingOrganization) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        throw new Error('Unable to generate unique invitation code after multiple attempts');
    }

    return code;
};

// Create indexes for better query performance
organizationSchema.index({ organizationCreator: 1 });
organizationSchema.index({ organizationMembers: 1 });
organizationSchema.index({ isDeleted: 1 });
organizationSchema.index({ invitationCode: 1 }); // Index for invitation code lookups

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;
