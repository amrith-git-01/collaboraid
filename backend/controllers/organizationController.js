const Organization = require('../models/organizationModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const Email = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create a new organization
exports.createOrganization = catchAsync(async (req, res, next) => {
    const {
        organizationName,
        description,
        organizationUrl,
        location
    } = req.body;

    // Get the current user from the request (set by auth middleware)
    const organizationCreator = req.user.id;

    // Check if user already has an organization
    const user = await User.findById(organizationCreator).select('organizationId');
    if (user && user.organizationId) {
        const existingOrganization = await Organization.findById(user.organizationId);
        if (existingOrganization && !existingOrganization.isDeleted) {
            return next(new AppError('You already have an organization. You can only create one organization.', 400));
        }
    }

    // Validate required fields
    if (!organizationName) {
        return next(new AppError('Organization name is required', 400));
    }

    // Validate organization name length
    if (organizationName.trim().length < 3 || organizationName.trim().length > 50) {
        return next(new AppError('Organization name must be between 3 and 50 characters', 400));
    }

    // Validate description length if provided
    if (description && description.trim().length > 500) {
        return next(new AppError('Description must be less than 500 characters', 400));
    }

    // Validate URL if provided
    if (organizationUrl) {
        const urlPattern = /^https?:\/\/.+/;
        if (!urlPattern.test(organizationUrl.trim())) {
            return next(new AppError('Please provide a valid URL starting with http:// or https://', 400));
        }
    }

    // Create organization
    const organizationData = {
        organizationName: organizationName.trim(),
        organizationCreator: organizationCreator,
    };

    if (description) {
        organizationData.description = description.trim();
    }

    if (organizationUrl) {
        organizationData.organizationUrl = organizationUrl.trim();
    }

    if (location && location.address) {
        organizationData.location = {
            address: location.address.trim(),
        };
        if (location.coordinates && location.coordinates.lat && location.coordinates.lon) {
            organizationData.location.coordinates = {
                lat: location.coordinates.lat,
                lon: location.coordinates.lon,
            };
        }
    }

    // Generate unique invitation code
    organizationData.invitationCode = await Organization.generateUniqueInvitationCode();

    const organization = await Organization.create(organizationData);

    // Set creator's organizationId
    await User.findByIdAndUpdate(organizationCreator, {
        organizationId: organization._id
    });

    // Get organization with populated creator
    await organization.populate('organizationCreator', 'name email profilePhoto');

    // Get all members (users with this organizationId)
    const members = await User.find({ organizationId: organization._id })
        .select('name email profilePhoto');

    // Add members array to organization object for response
    const organizationResponse = organization.toObject();
    organizationResponse.organizationMembers = members;

    res.status(201).json({
        status: 'success',
        message: 'Organization created successfully',
        data: {
            organization: organizationResponse
        }
    });
});

// Get user's organization (where user is creator or member)
exports.getMyOrganization = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    // Get user's organizationId
    const user = await User.findById(userId).select('organizationId').populate('organizationId');

    if (!user || !user.organizationId) {
        return res.status(200).json({
            status: 'success',
            data: {
                organization: null
            }
        });
    }

    // Get organization
    const organization = await Organization.findById(user.organizationId)
        .populate('organizationCreator', 'name email profilePhoto');

    if (!organization || organization.isDeleted) {
        // Clear organizationId if organization is deleted
        await User.findByIdAndUpdate(userId, { organizationId: null });
        return res.status(200).json({
            status: 'success',
            data: {
                organization: null
            }
        });
    }

    // Get all members (users with this organizationId)
    const members = await User.find({ organizationId: organization._id })
        .select('name email profilePhoto');

    // Add members array to organization object for response
    const organizationResponse = organization.toObject();
    organizationResponse.organizationMembers = members;

    res.status(200).json({
        status: 'success',
        data: {
            organization: organizationResponse
        }
    });
});

// Get organization by ID (if user is a member)
exports.getOrganizationById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    const organization = await Organization.findOne({
        _id: id,
        isDeleted: false
    }).populate('organizationCreator', 'name email profilePhoto');

    if (!organization) {
        return next(new AppError('Organization not found', 404));
    }

    // Check if user is a member or creator using organizationId
    const user = await User.findById(userId).select('organizationId');
    const isCreator = organization.organizationCreator._id.toString() === userId;
    const isMember = user && user.organizationId && user.organizationId.toString() === id;

    if (!isMember && !isCreator) {
        return next(new AppError('You do not have access to this organization', 403));
    }

    // Get all members (users with this organizationId)
    const members = await User.find({ organizationId: organization._id })
        .select('name email profilePhoto');

    // Add members array to organization object for response
    const organizationResponse = organization.toObject();
    organizationResponse.organizationMembers = members;

    res.status(200).json({
        status: 'success',
        data: {
            organization: organizationResponse
        }
    });
});

// Update organization (only creator can update)
exports.updateOrganization = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;
    const {
        organizationName,
        description,
        organizationUrl,
        location
    } = req.body;

    // Find organization
    const organization = await Organization.findById(id);

    if (!organization) {
        return next(new AppError('Organization not found', 404));
    }

    if (organization.isDeleted) {
        return next(new AppError('Organization has been deleted', 404));
    }

    // Check if user is the creator
    if (organization.organizationCreator.toString() !== userId) {
        return next(new AppError('Only the organization creator can update the organization', 403));
    }

    // Validate organization name if provided
    if (organizationName !== undefined) {
        if (!organizationName || organizationName.trim().length < 3 || organizationName.trim().length > 50) {
            return next(new AppError('Organization name must be between 3 and 50 characters', 400));
        }
        organization.organizationName = organizationName.trim();
    }

    // Validate description if provided
    if (description !== undefined) {
        if (description && description.trim().length > 500) {
            return next(new AppError('Description must be less than 500 characters', 400));
        }
        organization.description = description ? description.trim() : description;
    }

    // Validate URL if provided
    if (organizationUrl !== undefined) {
        if (organizationUrl) {
            const urlPattern = /^https?:\/\/.+/;
            if (!urlPattern.test(organizationUrl.trim())) {
                return next(new AppError('Please provide a valid URL starting with http:// or https://', 400));
            }
            organization.organizationUrl = organizationUrl.trim();
        } else {
            organization.organizationUrl = organizationUrl;
        }
    }

    // Update location if provided
    if (location !== undefined) {
        if (location.address) {
            organization.location = {
                address: location.address.trim(),
            };
            if (location.coordinates && location.coordinates.lat && location.coordinates.lon) {
                organization.location.coordinates = {
                    lat: location.coordinates.lat,
                    lon: location.coordinates.lon,
                };
            } else {
                organization.location.coordinates = undefined;
            }
        } else {
            organization.location = undefined;
        }
    }

    organization.updatedAt = Date.now();
    await organization.save();

    // Populate creator
    await organization.populate('organizationCreator', 'name email profilePhoto');

    // Get all members (users with this organizationId)
    const members = await User.find({ organizationId: organization._id })
        .select('name email profilePhoto');

    // Add members array to organization object for response
    const organizationResponse = organization.toObject();
    organizationResponse.organizationMembers = members;

    res.status(200).json({
        status: 'success',
        message: 'Organization updated successfully',
        data: {
            organization: organizationResponse
        }
    });
});

// Delete organization (soft delete, only creator can delete)
exports.deleteOrganization = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    const organization = await Organization.findById(id);

    if (!organization) {
        return next(new AppError('Organization not found', 404));
    }

    if (organization.isDeleted) {
        return next(new AppError('Organization has already been deleted', 404));
    }

    // Check if user is the creator
    if (organization.organizationCreator.toString() !== userId) {
        return next(new AppError('Only the organization creator can delete the organization', 403));
    }

    // Soft delete
    organization.isDeleted = true;
    organization.deletedAt = Date.now();
    await organization.save();

    // Clear organizationId for all members
    await User.updateMany(
        { organizationId: organization._id },
        { organizationId: null }
    );

    res.status(200).json({
        status: 'success',
        message: 'Organization deleted successfully',
        data: null
    });
});

// Invite user to organization
exports.inviteUser = catchAsync(async (req, res, next) => {
    const { email, emails } = req.body;
    const userId = req.user.id;

    // Support both single email and array of emails (for backward compatibility)
    let emailList = [];
    if (emails && Array.isArray(emails)) {
        emailList = emails;
    } else if (email) {
        emailList = [email];
    } else {
        return next(new AppError('Email or emails array is required', 400));
    }

    // Validate emails array
    if (emailList.length === 0) {
        return next(new AppError('At least one email is required', 400));
    }

    // Validate email format for all emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailList.filter(e => !emailRegex.test(e));
    if (invalidEmails.length > 0) {
        return next(new AppError(`Invalid email format: ${invalidEmails.join(', ')}`, 400));
    }

    // Get user's organization
    const user = await User.findById(userId).select('organizationId');
    if (!user || !user.organizationId) {
        return next(new AppError('You must be the creator of an organization to invite users', 403));
    }

    const organization = await Organization.findOne({
        _id: user.organizationId,
        organizationCreator: userId,
        isDeleted: false
    });

    if (!organization) {
        return next(new AppError('You must be the creator of an organization to invite users', 403));
    }

    // Get invitor details
    const invitor = await User.findById(userId);
    if (!invitor) {
        return next(new AppError('Invitor not found', 404));
    }

    // Get existing members by organizationId
    const existingMembers = await User.find({ organizationId: organization._id })
        .select('email');
    const existingMemberEmails = existingMembers.map(member => (member.email || '').toLowerCase());

    // Normalize and check emails
    const normalizedEmails = emailList.map(e => e.toLowerCase().trim());
    const uniqueEmails = [...new Set(normalizedEmails)];

    if (uniqueEmails.length !== normalizedEmails.length) {
        return next(new AppError('Duplicate emails found in the request', 400));
    }

    const alreadyMemberEmails = [];
    for (const email of normalizedEmails) {
        if (existingMemberEmails.includes(email)) {
            alreadyMemberEmails.push(email);
        }
    }

    if (alreadyMemberEmails.length > 0) {
        return next(new AppError(
            `The following users are already members: ${alreadyMemberEmails.join(', ')}`,
            400
        ));
    }

    // Send invitation emails
    const results = {
        successful: [],
        failed: []
    };

    for (const email of normalizedEmails) {
        try {
            // Check if user exists
            const invitedUser = await User.findOne({ email: email.toLowerCase() });

            const emailData = {
                email: email.toLowerCase(),
                name: invitedUser ? invitedUser.name : email.split('@')[0]
            };

            const emailService = new Email(emailData);
            await emailService.sendInvitation({
                invitationCode: organization.invitationCode,
                invitorEmail: invitor.email,
                organizationName: organization.organizationName
            });

            // Create notification for invitor (non-blocking)
            try {
                await Notification.create({
                    userId: userId,
                    title: 'Invitation Sent',
                    message: `You have invited ${emailData.email} to join "${organization.organizationName}".`,
                });
            } catch (notificationError) {
                console.error(`Failed to create invitation notification for invitor:`, notificationError.message);
            }

            // Create notification for invited user if they exist (non-blocking)
            if (invitedUser) {
                try {
                    await Notification.create({
                        userId: invitedUser._id,
                        title: 'Organization Invitation',
                        message: `${invitor.name} (${invitor.email}) has invited you to join "${organization.organizationName}". Use the invitation code: ${organization.invitationCode}`,
                    });
                } catch (notificationError) {
                    console.error(`Failed to create invitation notification for invited user:`, notificationError.message);
                }
            }

            results.successful.push(email);
        } catch (error) {
            console.error(`Error sending invitation email to ${email}:`, error);
            results.failed.push({ email, error: error.message });
        }
    }

    if (results.failed.length > 0 && results.successful.length === 0) {
        return next(new AppError(
            `Failed to send all invitation emails: ${results.failed.map(f => f.email).join(', ')}`,
            500
        ));
    }

    const message = results.failed.length > 0
        ? `Invitations sent to ${results.successful.length} email(s). Failed to send to: ${results.failed.map(f => f.email).join(', ')}`
        : `Invitation${results.successful.length > 1 ? 's' : ''} sent successfully to ${results.successful.length} ${results.successful.length > 1 ? 'users' : 'user'}`;

    res.status(200).json({
        status: 'success',
        message,
        data: {
            emails: results.successful,
            failed: results.failed
        }
    });
});

// Join organization by invitation code
exports.joinOrganization = catchAsync(async (req, res, next) => {
    const { invitationCode } = req.body;
    const userId = req.user.id;

    // Validate invitation code
    if (!invitationCode) {
        return next(new AppError('Invitation code is required', 400));
    }

    // Normalize invitation code (uppercase, trim)
    const normalizedCode = invitationCode.trim().toUpperCase();

    if (normalizedCode.length !== 10) {
        return next(new AppError('Invitation code must be exactly 10 characters', 400));
    }

    // Find organization by invitation code
    const organization = await Organization.findOne({
        invitationCode: normalizedCode,
        isDeleted: false
    });

    if (!organization) {
        return next(new AppError('Invalid invitation code or organization not found', 404));
    }

    // Check if user already has an organization
    const user = await User.findById(userId).select('organizationId');
    if (user && user.organizationId) {
        if (user.organizationId.toString() === organization._id.toString()) {
            return next(new AppError('You are already a member of this organization', 400));
        }
        return next(new AppError('You already have an organization. You can only be a member of one organization at a time.', 400));
    }

    // Check if user is the creator (shouldn't happen, but just in case)
    if (organization.organizationCreator.toString() === userId) {
        return next(new AppError('You are the creator of this organization', 400));
    }

    // Set user's organizationId
    await User.findByIdAndUpdate(userId, {
        organizationId: organization._id
    });

    // Populate creator for response
    await organization.populate('organizationCreator', 'name email profilePhoto');

    // Get all members (users with this organizationId)
    const members = await User.find({ organizationId: organization._id })
        .select('name email profilePhoto');

    // Add members array to organization object for response
    const organizationResponse = organization.toObject();
    organizationResponse.organizationMembers = members;

    res.status(200).json({
        status: 'success',
        message: 'Successfully joined the organization',
        data: {
            organization: organizationResponse
        }
    });
});
