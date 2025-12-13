import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useToast } from '../contexts/ToastContext';
import {
  createOrganization,
  updateOrganization,
} from '../store/organizationSlice';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import LocationSearch from './LocationSearch';
import LocationMap from './LocationMap';
import { Building2, Globe, MapPin, FileText } from 'lucide-react';

const OrganizationForm = ({ organization = null, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const isEditMode = !!organization;

  const [formData, setFormData] = useState({
    organizationName: '',
    description: '',
    organizationUrl: '',
    location: {
      address: '',
      coordinates: null,
    },
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocationData, setSelectedLocationData] = useState(null);

  // Helper function to render errors (matching CreateEventForm style)
  const renderError = field =>
    errors[field] ? (
      <p className="text-xs text-red-600 mt-1.5">{errors[field]}</p>
    ) : null;

  // Pre-fill form data when in edit mode
  useEffect(() => {
    if (isEditMode && organization) {
      setFormData({
        organizationName: organization.organizationName || '',
        description: organization.description || '',
        organizationUrl: organization.organizationUrl || '',
        location: {
          address: organization.location?.address || '',
          coordinates: organization.location?.coordinates || null,
        },
      });

      // Set location data for map display
      if (organization.location?.coordinates) {
        setSelectedLocationData({
          displayName: organization.location.address,
          lat: organization.location.coordinates.lat,
          lon: organization.location.coordinates.lon,
        });
      }
    }
  }, [isEditMode, organization]);

  const validate = () => {
    const validationErrors = {};
    const name = formData.organizationName?.trim() || '';
    const desc = formData.description?.trim() || '';
    const url = formData.organizationUrl?.trim() || '';
    const locationAddress = formData.location?.address?.trim() || '';

    // Organization name validation
    if (!name) {
      validationErrors.organizationName = 'Organization name is required';
    } else if (name.length < 3) {
      validationErrors.organizationName =
        'Organization name must be at least 3 characters';
    } else if (name.length > 50) {
      validationErrors.organizationName =
        'Organization name cannot exceed 50 characters';
    }

    // Description validation
    if (!desc) {
      validationErrors.description = 'Description is required';
    } else if (desc.length < 10) {
      validationErrors.description =
        'Description must be at least 10 characters';
    } else if (desc.length > 500) {
      validationErrors.description = 'Description cannot exceed 500 characters';
    }

    // URL validation
    if (!url) {
      validationErrors.organizationUrl = 'Organization URL is required';
    } else {
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(url)) {
        validationErrors.organizationUrl =
          'Please provide a valid URL starting with http:// or https://';
      }
    }

    // Location validation
    if (!locationAddress) {
      validationErrors.location = 'Location is required';
    } else if (!formData.location?.coordinates) {
      validationErrors.location =
        'Please select a location from the search results';
    }

    return validationErrors;
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleDescriptionChange = e => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      description: value,
    }));

    // Clear error when user starts typing
    if (errors.description) {
      setErrors(prev => ({
        ...prev,
        description: '',
      }));
    }
  };

  const handleLocationSelect = location => {
    setSelectedLocationData(location);
    if (location) {
      setFormData(prev => ({
        ...prev,
        location: {
          address: location.displayName || location.address,
          coordinates: {
            lat: location.lat,
            lon: location.lon,
          },
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        location: {
          address: '',
          coordinates: null,
        },
      }));
    }

    // Clear location error
    if (errors.location) {
      setErrors(prev => ({
        ...prev,
        location: '',
      }));
    }
  };

  const handleLocationChange = value => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        address: value,
      },
    }));

    // Clear location error when user starts typing
    if (errors.location) {
      setErrors(prev => ({
        ...prev,
        location: '',
      }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const organizationData = {
        organizationName: formData.organizationName.trim(),
        description: formData.description.trim(),
        organizationUrl: formData.organizationUrl.trim(),
        location: {
          address: formData.location.address,
          coordinates: formData.location.coordinates,
        },
      };

      if (isEditMode) {
        await dispatch(
          updateOrganization({
            id: organization._id,
            organizationData,
          })
        ).unwrap();
        showToast('Organization updated successfully!', 'success');
      } else {
        await dispatch(createOrganization(organizationData)).unwrap();
        showToast('Organization created successfully!', 'success');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      showToast(error || 'Failed to save organization', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Organization Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Organization Name <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          name="organizationName"
          value={formData.organizationName}
          onChange={handleInputChange}
          placeholder="Enter organization name"
          icon={Building2}
          error={!!errors.organizationName}
          errorColor="red"
          className="text-base"
        />
        {renderError('organizationName')}
        <p className="text-xs text-gray-500 mt-1.5">3-50 characters</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleDescriptionChange}
          placeholder="Enter organization description"
          rows={4}
          className={`text-base ${errors.description ? 'border-red-500' : ''}`}
        />
        {renderError('description')}
        <p className="text-xs text-gray-500 mt-1.5">
          {formData.description.length}/500 characters
        </p>
      </div>

      {/* Organization URL */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Organization URL <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          name="organizationUrl"
          value={formData.organizationUrl}
          onChange={handleInputChange}
          placeholder="https://example.com"
          icon={Globe}
          error={!!errors.organizationUrl}
          errorColor="red"
          className="text-base"
        />
        {renderError('organizationUrl')}
      </div>

      {/* Location */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Location <span className="text-red-500">*</span>
          </label>
          <LocationSearch
            value={formData.location.address}
            onChange={value => {
              handleLocationChange(value);
              // Clear location errors when user starts typing
              if (errors.location) {
                setErrors(prev => ({
                  ...prev,
                  location: '',
                }));
              }
            }}
            onLocationSelect={handleLocationSelect}
            placeholder="Search for organization location..."
            error={!!errors.location}
            errorColor="red"
          />
          {renderError('location')}
        </div>

        {/* Map Display */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Location Preview
          </label>
          <div className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
            <LocationMap location={selectedLocationData} />
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex space-x-3 pt-4 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            rounded="lg"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          rounded="lg"
          disabled={isLoading}
          isLoading={isLoading}
        >
          {isLoading
            ? isEditMode
              ? 'Updating...'
              : 'Creating...'
            : isEditMode
              ? 'Update Organization'
              : 'Create Organization'}
        </Button>
      </div>
    </form>
  );
};

export default OrganizationForm;
