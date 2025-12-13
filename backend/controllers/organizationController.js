const Organization = require('../models/organizationModel');
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
    const existingOrganization = await Organization.findOne({
        organizationCreator: organizationCreator,
        isDeleted: false
    });

    if (existingOrganization) {
        return next(new AppError('You already have an organization. You can only create one organization.', 400));
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
        organizationMembers: [organizationCreator], // Creator is automatically added
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

    // Populate creator and members
    await organization.populate('organizationCreator', 'name email');
    await organization.populate('organizationMembers', 'name email profilePhoto');

    res.status(201).json({
        status: 'success',
        message: 'Organization created successfully',
        data: {
            organization
        }
    });
});

// Get user's organization (where user is creator)
exports.getMyOrganization = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const organization = await Organization.findOne({
        organizationCreator: userId,
        isDeleted: false
    })
        .populate('organizationCreator', 'name email profilePhoto')
        .populate('organizationMembers', 'name email profilePhoto');

    if (!organization) {
        return res.status(200).json({
            status: 'success',
            data: {
                organization: null
            }
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            organization
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
    })
        .populate('organizationCreator', 'name email profilePhoto')
        .populate('organizationMembers', 'name email profilePhoto');

    if (!organization) {
        return next(new AppError('Organization not found', 404));
    }

    // Check if user is a member or creator
    const isMember = organization.organizationMembers.some(
        member => member._id.toString() === userId
    );
    const isCreator = organization.organizationCreator._id.toString() === userId;

    if (!isMember && !isCreator) {
        return next(new AppError('You do not have access to this organization', 403));
    }

    res.status(200).json({
        status: 'success',
        data: {
            organization
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

    // Populate creator and members
    await organization.populate('organizationCreator', 'name email profilePhoto');
    await organization.populate('organizationMembers', 'name email profilePhoto');

    res.status(200).json({
        status: 'success',
        message: 'Organization updated successfully',
        data: {
            organization
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

    res.status(200).json({
        status: 'success',
        message: 'Organization deleted successfully',
        data: null
    });
});
