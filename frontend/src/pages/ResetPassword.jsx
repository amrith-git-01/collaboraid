import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { userService } from '../services/userService';
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [passwordData, setPasswordData] = useState({
    password: '',
    passwordConfirm: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate token format on component mount
  useEffect(() => {
    if (!token || token.length !== 64) {
      setTokenValid(false);
      showToast('Invalid reset link format', 'error');
    }
  }, [token, showToast]);

  // Validate password requirements
  const validatePassword = password => {
    const errors = [];
    if (password.length < 6) errors.push('At least 6 characters');
    if (!/\d/.test(password)) errors.push('One number');
    return errors;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Clear previous errors
    setValidationErrors({});

    // Validate password
    const passwordValidationErrors = validatePassword(passwordData.password);
    if (passwordValidationErrors.length > 0) {
      setValidationErrors(prev => ({
        ...prev,
        password: `Password must contain: ${passwordValidationErrors.join(', ')}`,
      }));
      return;
    }

    // Validate password confirmation
    if (passwordData.password !== passwordData.passwordConfirm) {
      setValidationErrors(prev => ({
        ...prev,
        passwordConfirm: 'Passwords do not match',
      }));
      return;
    }

    setIsLoading(true);

    try {
      const result = await userService.resetPassword(token, {
        password: passwordData.password,
        passwordConfirm: passwordData.passwordConfirm,
      });

      if (result && result.status === 'success') {
        setIsSuccess(true);
        showToast(
          'Password reset successfully! Redirecting to login...',
          'success'
        );

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    } catch (error) {
      console.error('Password reset error:', error);

      if (error.response?.status === 400) {
        setTokenValid(false);
        showToast(
          'Reset link is invalid or has expired. Please request a new one.',
          'error'
        );
      } else {
        const errorMessage =
          error.response?.data?.message ||
          'Failed to reset password. Please try again.';
        showToast(errorMessage, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // If token is invalid, show error message
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid Reset Link
          </h1>
          <p className="text-gray-600 mb-6">
            This password reset link is invalid or has expired. Please request a
            new password reset link.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  // If password reset was successful, show success message
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Password Reset Successfully!
          </h1>
          <p className="text-gray-600 mb-6">
            Your password has been reset successfully. You will be redirected to
            the login page shortly.
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Reset Your Password
          </h1>
          <p className="text-gray-600">
            Enter your new password below. Make sure it's secure and memorable.
          </p>
        </div>

        {/* Password Requirements */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Password Requirements:</strong> At least 6 characters and
            one number.
          </p>
        </div>

        {/* Reset Password Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={passwordData.password}
                onChange={handleInputChange}
                placeholder="Enter new password"
                className={validationErrors.password ? 'border-red-500' : ''}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.password}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                name="passwordConfirm"
                value={passwordData.passwordConfirm}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                className={
                  validationErrors.passwordConfirm ? 'border-red-500' : ''
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {validationErrors.passwordConfirm && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.passwordConfirm}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/login')}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Remember your password?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
