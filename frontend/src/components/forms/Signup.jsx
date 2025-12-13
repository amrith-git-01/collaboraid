import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useToastNavigation } from '../../hooks/useToastNavigation';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const { register, isLoading } = useAuth();
  const { showToast } = useToast();
  const { startLoading, stopLoading } = useLoading();
  const { navigateIfNoToast, canNavigate } = useToastNavigation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateForm = () => {
    const errors = {};

    // Name validation - only validate if field has content
    if (signupData.name.trim()) {
      if (signupData.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters long';
      }
    }

    // Email validation - only validate if field has content
    if (signupData.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // Password validation - only validate if field has content
    if (signupData.password.trim()) {
      if (signupData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      } else if (!/\d/.test(signupData.password)) {
        errors.password = 'Password must contain at least one number';
      }
    }

    // Confirm password validation - only validate if field has content
    if (signupData.passwordConfirm.trim()) {
      if (signupData.password !== signupData.passwordConfirm) {
        errors.passwordConfirm = 'Passwords do not match';
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
    if (
      !signupData.name.trim() ||
      !signupData.email.trim() ||
      !signupData.password.trim() ||
      !signupData.passwordConfirm.trim()
    ) {
      // Don't show toast for empty required fields - let HTML5 handle it
      return;
    }

    startLoading();

    register(signupData)
      .then(result => {
        stopLoading();

        if (result.meta.requestStatus === 'fulfilled') {
          // Clear form first
          setSignupData({
            name: '',
            email: '',
            password: '',
            passwordConfirm: '',
          });
          setValidationErrors({});
          setTouched({});

          // Show success toast with longer duration
          const successToastId = showToast(
            'Welcome! Redirecting to dashboard...',
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
            result.payload || 'Signup failed. Please try again.',
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
    setSignupData(prev => ({ ...prev, [name]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleBlur = e => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate single field on blur
    if (name === 'name' && signupData.name.trim()) {
      if (signupData.name.trim().length < 2) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: 'Name must be at least 2 characters long',
        }));
      }
    }

    if (name === 'email' && signupData.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: 'Please enter a valid email address',
        }));
      }
    }

    if (name === 'password' && signupData.password.trim()) {
      if (signupData.password.length < 6) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: 'Password must be at least 6 characters',
        }));
      } else if (!/(?=.*\d)/.test(signupData.password)) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: 'Password must contain at least one number',
        }));
      }
    }

    if (name === 'passwordConfirm' && signupData.passwordConfirm.trim()) {
      if (signupData.password !== signupData.passwordConfirm) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: 'Passwords do not match',
        }));
      }
    }
  };

  const handleBackToLogin = () => {
    if (canNavigate) {
      navigateIfNoToast('/login');
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Create Account
        </h2>
        <p className="text-gray-600">
          Join us today and start creating amazing events.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            type="text"
            name="name"
            placeholder="Full name"
            value={signupData.name}
            onChange={handleInputChange}
            onBlur={handleBlur}
            icon={User}
            required
            className={
              validationErrors.name && touched.name ? 'border-red-500' : ''
            }
          />
          {validationErrors.name && touched.name && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
          )}
        </div>

        <div>
          <Input
            type="email"
            name="email"
            placeholder="Email address"
            value={signupData.email}
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
            value={signupData.password}
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
          {!validationErrors.password && signupData.password && (
            <p className="mt-1 text-sm text-gray-500">
              Password must be at least 6 characters with a number
            </p>
          )}
        </div>

        <div>
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            name="passwordConfirm"
            placeholder="Confirm Password"
            value={signupData.passwordConfirm}
            onChange={handleInputChange}
            onBlur={handleBlur}
            icon={Lock}
            rightIcon={showConfirmPassword ? EyeOff : Eye}
            onRightIconClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            required
            className={
              validationErrors.passwordConfirm && touched.passwordConfirm
                ? 'border-red-500'
                : ''
            }
          />
          {validationErrors.passwordConfirm && touched.passwordConfirm && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.passwordConfirm}
            </p>
          )}
        </div>

        <div className="flex gap-4 mt-6">
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign up'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => {
              setSignupData({
                name: '',
                email: '',
                password: '',
                passwordConfirm: '',
              });
              setValidationErrors({});
              setTouched({});
              setShowPassword(false);
              setShowConfirmPassword(false);
              showToast('Form reset successfully', 'info', 3000);
            }}
            disabled={isLoading}
          >
            Reset
          </Button>
        </div>
      </form>

      {/* Back to Login Link */}
      <div className="mt-6 text-center">
        <button
          onClick={handleBackToLogin}
          disabled={!canNavigate}
          className={`text-sm text-purple-600 hover:text-purple-700 transition-colors duration-300 ${
            !canNavigate ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
}

export default Signup;
