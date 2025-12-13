import { Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../../contexts/LoadingContext';
import { useToastNavigation } from '../../hooks/useToastNavigation';
import { userService } from '../../services/userService';
import Input from '../ui/Input';
import Button from '../ui/Button';

function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();
  const { startLoading, stopLoading } = useLoading();
  const { navigateIfNoToast } = useToastNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);

  const validateForm = () => {
    const errors = {};

    // Email validation - only validate if field has content
    if (loginData.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // Password validation - only validate if field has content
    if (loginData.password.trim()) {
      if (loginData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();

    // Let HTML5 required validation handle empty fields
    // Only show custom validation errors for filled fields with invalid content
    if (!validateForm()) {
      // Show first validation error (only for filled fields with invalid content)
      const firstError = Object.values(validationErrors)[0];
      if (firstError) {
        showToast(firstError, 'error');
      }
      return;
    }

    // Check if required fields are filled (HTML5 validation)
    if (!loginData.email.trim() || !loginData.password.trim()) {
      // Don't show toast for empty required fields - let HTML5 handle it
      return;
    }

    startLoading();

    login(loginData)
      .then(result => {
        stopLoading();

        if (result.meta.requestStatus === 'fulfilled') {
          // Show success toast with longer duration
          const successToastId = showToast(
            'Welcome back! Redirecting to dashboard...',
            'success',
            3000
          );

          // Wait for toast to disappear then navigate
          setTimeout(() => {
            // Use React Router navigation instead of window.location.href
            navigate('/home', { replace: true });
          }, 3000);
        } else if (result.meta.requestStatus === 'rejected') {
          showToast(
            result.payload || 'Login failed. Please try again.',
            'error',
            6000
          );
        }
      })
      .catch(error => {
        stopLoading();
        showToast('Something went wrong. Please try again.', 'error', 6000);
      });
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleForgotPassword = async e => {
    e.preventDefault();

    if (!forgotPasswordEmail.trim()) {
      showToast('Please enter your email address', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotPasswordEmail)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setIsForgotPasswordLoading(true);

    try {
      const result = await userService.forgotPassword(forgotPasswordEmail);

      if (result && result.status === 'success') {
        showToast('Password reset link sent to your email!', 'success');
        setShowForgotPasswordModal(false);
        setForgotPasswordEmail('');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage =
        error.response?.data?.message ||
        'Failed to send reset link. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  const handleBlur = e => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    // Only validate if field has content
    if (name === 'email' && loginData.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: 'Please enter a valid email address',
        }));
      } else {
        // Clear error if validation passes
        setValidationErrors(prev => ({
          ...prev,
          [name]: '',
        }));
      }
    }

    if (name === 'password' && loginData.password.trim()) {
      if (loginData.password.length < 6) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: 'Password must be at least 6 characters',
        }));
      } else {
        // Clear error if validation passes
        setValidationErrors(prev => ({
          ...prev,
          [name]: '',
        }));
      }
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
        <p className="text-gray-600">
          Welcome back! Please sign in to your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            type="email"
            name="email"
            placeholder="Email address"
            value={loginData.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
            icon={Mail}
            required
            className={
              validationErrors.email && touched.email ? 'border-red-500' : ''
            }
          />
          {validationErrors.email && touched.email && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.email}
            </p>
          )}
        </div>

        <div>
          <Input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={loginData.password}
            onChange={handleInputChange}
            onBlur={handleBlur}
            icon={Lock}
            rightIcon={showPassword ? EyeOff : Eye}
            onRightIconClick={() => setShowPassword(!showPassword)}
            required
            className={
              validationErrors.password && touched.password
                ? 'border-red-500'
                : ''
            }
          />
          {validationErrors.password && touched.password && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.password}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <button
            type="button"
            className="text-sm text-purple-600 hover:text-purple-700 transition-colors duration-300"
            onClick={() => {
              setForgotPasswordEmail(loginData.email);
              setShowForgotPasswordModal(true);
            }}
          >
            Forgot password?
          </button>
        </div>

        <div className="flex gap-4 mt-6">
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => {
              setLoginData({ email: '', password: '' });
              setValidationErrors({});
              setTouched({});
              setShowPassword(false);
              showToast('Form reset successfully', 'info', 3000);
            }}
            disabled={isLoading}
          >
            Reset
          </Button>
        </div>
      </form>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Reset Password
              </h3>
              <button
                onClick={() => setShowForgotPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotPasswordEmail}
                  onChange={e => setForgotPasswordEmail(e.target.value)}
                  icon={Mail}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isForgotPasswordLoading}
                >
                  {isForgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgotPasswordModal(false)}
                  disabled={isForgotPasswordLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
