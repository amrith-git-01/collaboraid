import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import UploadModal from '../components/UploadModal';
import RemovePhotoModal from '../components/RemovePhotoModal';
import { profilePhotoService } from '../services/profilePhotoService';
import { userService } from '../services/userService';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import {
  Camera,
  Save,
  Eye,
  EyeOff,
  ChevronRight,
  User,
  Lock,
  Building2,
  Users,
  Plus,
  LogOut,
  ArrowLeft,
  X,
} from 'lucide-react';

function Settings() {
  const { user, isAuthenticated, setUser } = useAuth();
  const { showToast } = useToast();

  // View state: 'list' or 'detail'
  const [currentView, setCurrentView] = useState('list');
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Form states
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isRemovePhotoModalOpen, setIsRemovePhotoModalOpen] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Organization states
  const [organization, setOrganization] = useState(null);
  const [organizationFormData, setOrganizationFormData] = useState({
    name: '',
    description: '',
  });
  const [joinCode, setJoinCode] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  // Early return if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleGroupClick = (groupId, groupTitle) => {
    setSelectedGroup({ id: groupId, title: groupTitle });
    setCurrentView('detail');
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedGroup(null);
  };

  const handleProfileUpdate = async e => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateData = {
        name: profileData.firstName + ' ' + profileData.lastName,
        phone: profileData.phone,
        bio: profileData.bio,
      };

      const result = await userService.updateProfile(updateData);

      if (result && result.data && result.data.user) {
        const updatedUser = {
          ...user,
          name: result.data.user.name,
          phone: result.data.user.phone,
          bio: result.data.user.bio,
        };
        setUser(updatedUser);
        showToast('Profile updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      const errorMessage =
        error.response?.data?.message ||
        'Failed to update profile. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = password => {
    const errors = [];
    if (password.length < 6) errors.push('At least 6 characters');
    if (!/\d/.test(password)) errors.push('One number');
    return errors;
  };

  const handlePasswordChange = async e => {
    e.preventDefault();
    setIsLoading(true);

    setPasswordErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

    try {
      if (!passwordData.currentPassword) {
        setPasswordErrors(prev => ({
          ...prev,
          currentPassword: 'Current password is required',
        }));
        setIsLoading(false);
        return;
      }

      const passwordValidationErrors = validatePassword(
        passwordData.newPassword
      );
      if (passwordValidationErrors.length > 0) {
        setPasswordErrors(prev => ({
          ...prev,
          newPassword: `Password must contain: ${passwordValidationErrors.join(', ')}`,
        }));
        setIsLoading(false);
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match',
        }));
        setIsLoading(false);
        return;
      }

      const updatePasswordData = {
        passwordCurrent: passwordData.currentPassword,
        password: passwordData.newPassword,
        passwordConfirm: passwordData.confirmPassword,
      };

      const result = await userService.updatePassword(updatePasswordData);

      if (result && result.status === 'success') {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setPasswordErrors({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        showToast('Password updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Failed to update password:', error);
      const errorMessage =
        error.response?.data?.message ||
        'Failed to update password. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async file => {
    try {
      const result = await profilePhotoService.uploadProfilePhoto(file);

      if (result && result.profilePhoto) {
        const updatedUser = {
          ...user,
          profilePhoto: result.profilePhoto,
        };
        setUser(updatedUser);
        setTimeout(() => {
          showToast('Profile photo uploaded successfully!', 'success');
        }, 1000);
      }
      return result;
    } catch (error) {
      console.error('Failed to upload profile photo:', error);
      showToast('Failed to upload profile photo. Please try again.', 'error');
      throw error;
    }
  };

  const handleRemovePhoto = async () => {
    setIsRemovePhotoModalOpen(true);
  };

  const handleConfirmRemovePhoto = async () => {
    try {
      await profilePhotoService.removeProfilePhoto();
      const updatedUser = {
        ...user,
        profilePhoto: null,
      };
      setUser(updatedUser);
      setTimeout(() => {
        showToast('Profile photo removed successfully!', 'success');
      }, 300);
    } catch (error) {
      console.error('Failed to remove profile photo:', error);
      showToast('Failed to remove profile photo. Please try again.', 'error');
    } finally {
      setIsRemovePhotoModalOpen(false);
    }
  };

  // Render Account Information detail view with all sections
  const renderAccountDetailView = () => {
    return (
      <div className="space-y-4">
        {/* Profile Photo Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                <Camera className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Profile Photo
                </h3>
                <p className="text-xs text-gray-500">
                  Manage your profile picture and avatar
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {user?.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 cursor-pointer border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 cursor-pointer border-2 border-gray-200 flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <button className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-all duration-200 shadow-lg">
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-900 mb-1.5">
                    Profile Photo
                  </h4>
                  <p className="text-xs text-gray-600 mb-2.5">
                    Upload a new profile photo to personalize your account
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="primary"
                      size="sm"
                      rounded="lg"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="text-xs"
                    >
                      Upload Photo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      rounded="lg"
                      onClick={handleRemovePhoto}
                      className="text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Information Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  User Information
                </h3>
                <p className="text-xs text-gray-500">
                  Manage your personal information and details
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-700">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    value={profileData.firstName + ' ' + profileData.lastName}
                    onChange={e => {
                      const names = e.target.value.split(' ');
                      setProfileData({
                        ...profileData,
                        firstName: names[0] || '',
                        lastName: names.slice(1).join(' ') || '',
                      });
                    }}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-700">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={profileData.phone}
                    onChange={e =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    placeholder="Enter your phone number"
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-700">
                  Bio
                </label>
                <Textarea
                  value={profileData.bio}
                  onChange={e =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  rows="4"
                  placeholder="Tell us about yourself"
                  className="text-sm"
                />
              </div>
              <div className="flex justify-end pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  rounded="lg"
                  disabled={isLoading}
                  isLoading={isLoading}
                  icon={<Save className="w-3.5 h-3.5" />}
                  className="text-xs"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Password
                </h3>
                <p className="text-xs text-gray-500">
                  Update your password for enhanced security
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mb-4">
              <p className="text-xs text-blue-800">
                <strong>Password Requirements:</strong> At least 6 characters
                and one number.
              </p>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-700">
                  Current Password
                </label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={e =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="Enter current password"
                  rightIcon={showPassword ? EyeOff : Eye}
                  onRightIconClick={() => setShowPassword(!showPassword)}
                  error={!!passwordErrors.currentPassword}
                  errorMessage={passwordErrors.currentPassword}
                  errorColor="orange"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-700">
                    New Password
                  </label>
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={e =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Enter new password"
                    rightIcon={showNewPassword ? EyeOff : Eye}
                    onRightIconClick={() =>
                      setShowNewPassword(!showNewPassword)
                    }
                    error={!!passwordErrors.newPassword}
                    errorMessage={passwordErrors.newPassword}
                    errorColor="orange"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={e =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm new password"
                    rightIcon={showConfirmPassword ? EyeOff : Eye}
                    onRightIconClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    error={!!passwordErrors.confirmPassword}
                    errorMessage={passwordErrors.confirmPassword}
                    errorColor="orange"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  rounded="lg"
                  disabled={isLoading}
                  isLoading={isLoading}
                  className="text-xs"
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Render Organization detail view with all sections
  const renderOrganizationDetailView = () => {
    return (
      <div className="space-y-4">
        {/* Organization Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Organization
                </h3>
                <p className="text-xs text-gray-500">
                  Create or join an organization to manage events
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            {organization ? (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-gray-900 mb-1">
                        {organization.name}
                      </h4>
                      {organization.description && (
                        <p className="text-xs text-gray-600 mb-2">
                          {organization.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <div className="flex items-center space-x-1.5 text-gray-600">
                          <Users className="w-3.5 h-3.5" />
                          <span>
                            {organization.memberCount || 0} member
                            {(organization.memberCount || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {organization.role && (
                          <div className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-semibold">
                            {organization.role === 'owner' ? 'Owner' : 'Member'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    rounded="lg"
                    onClick={() => {
                      setShowJoinForm(false);
                      setShowCreateForm(false);
                    }}
                    icon={<LogOut className="w-3.5 h-3.5" />}
                    className="text-xs"
                  >
                    Leave
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-4 border border-gray-200">
                <div className="text-center py-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-6 h-6 text-gray-400" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 mb-1.5">
                    No Organization
                  </h4>
                  <p className="text-xs text-gray-600 mb-4">
                    You need to create or join an organization to create events.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button
                      variant="primary"
                      size="sm"
                      rounded="lg"
                      onClick={() => {
                        setShowCreateForm(true);
                        setShowJoinForm(false);
                      }}
                      icon={<Plus className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Create Organization
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      rounded="lg"
                      onClick={() => {
                        setShowJoinForm(true);
                        setShowCreateForm(false);
                      }}
                      icon={<Users className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Join Organization
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {showCreateForm && !organization && (
              <div className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-sm mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-semibold text-gray-900">
                    Create New Organization
                  </h4>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    showToast(
                      'Organization creation will be implemented soon',
                      'info'
                    );
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={organizationFormData.name}
                      onChange={e =>
                        setOrganizationFormData({
                          ...organizationFormData,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter organization name"
                      required
                      minLength={3}
                      maxLength={50}
                      className="text-sm"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      3-50 characters
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Description
                    </label>
                    <Textarea
                      value={organizationFormData.description}
                      onChange={e =>
                        setOrganizationFormData({
                          ...organizationFormData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe your organization (optional)"
                      rows="3"
                      maxLength={200}
                      className="text-sm"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      {organizationFormData.description.length}/200 characters
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      rounded="lg"
                      onClick={() => {
                        setShowCreateForm(false);
                        setOrganizationFormData({ name: '', description: '' });
                      }}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      rounded="lg"
                      disabled={isLoading || !organizationFormData.name.trim()}
                      isLoading={isLoading}
                      className="text-xs"
                    >
                      Create Organization
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {showJoinForm && !organization && (
              <div className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-sm mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-semibold text-gray-900">
                    Join Organization
                  </h4>
                  <button
                    onClick={() => setShowJoinForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    showToast(
                      'Organization join will be implemented soon',
                      'info'
                    );
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Join Code <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="Enter organization join code"
                      required
                      minLength={4}
                      maxLength={20}
                      className="text-sm"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      Enter the code provided by the organization owner
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      rounded="lg"
                      onClick={() => {
                        setShowJoinForm(false);
                        setJoinCode('');
                      }}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      rounded="lg"
                      disabled={isLoading || !joinCode.trim()}
                      isLoading={isLoading}
                      className="text-xs"
                    >
                      Join Organization
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render list view with just two groups
  const renderListView = () => {
    return (
      <div className="space-y-4">
        {/* Account Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => handleGroupClick('account', 'Account Information')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-200">
                <User className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-200">
                  Account Information
                </h3>
                <p className="text-xs text-gray-500">
                  Manage your account settings and personal information
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-all duration-200 flex-shrink-0" />
          </button>
        </div>

        {/* Organization */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => handleGroupClick('organization', 'Organization')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-200">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                  Organization
                </h3>
                <p className="text-xs text-gray-500">
                  Manage your organization settings and membership
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-all duration-200 flex-shrink-0" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="mb-1.5">
          <h1 className="text-2xl font-bold text-gray-900">
            {currentView === 'detail' ? selectedGroup?.title : 'Settings'}
          </h1>
          <p className="text-base text-gray-600 mt-1">
            {currentView === 'detail'
              ? 'Manage your settings and preferences'
              : 'Manage your account settings and preferences'}
          </p>
        </div>
      </div>

      {/* Back Button - Only show in detail view */}
      {currentView === 'detail' && (
        <div className="mb-5">
          <button
            onClick={handleBack}
            className="flex items-center space-x-1.5 text-gray-600 hover:text-purple-600 transition-colors duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-xs font-medium">Back to Settings</span>
          </button>
        </div>
      )}

      {/* Content Area */}
      <div
        className={`transition-all duration-300 ${
          currentView === 'detail' ? 'opacity-100' : 'opacity-100'
        }`}
      >
        {currentView === 'list'
          ? renderListView()
          : selectedGroup?.id === 'account'
            ? renderAccountDetailView()
            : selectedGroup?.id === 'organization'
              ? renderOrganizationDetailView()
              : null}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handlePhotoUpload}
        currentPhoto={user?.profilePhoto}
      />

      {/* Remove Photo Modal */}
      <RemovePhotoModal
        isOpen={isRemovePhotoModalOpen}
        onClose={() => setIsRemovePhotoModalOpen(false)}
        onConfirm={handleConfirmRemovePhoto}
        currentPhoto={user?.profilePhoto}
      />
    </div>
  );
}

export default Settings;
