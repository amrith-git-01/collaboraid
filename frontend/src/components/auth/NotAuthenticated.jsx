import { useNavigate } from 'react-router-dom';
import { ShieldX, Home, LogIn, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const NotAuthenticated = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const iconVariants = {
    hidden: {
      opacity: 0,
      scale: 0.5,
      rotate: -180,
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  const buttonVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 flex items-center justify-center px-4 py-8">
      <motion.div
        className="max-w-md w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Main Card */}
        <motion.div
          className="bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden"
          variants={itemVariants}
        >
          {/* Header with Icon */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-10 text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
            </div>

            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm"
              variants={iconVariants}
            >
              <ShieldX className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h1
              className="text-3xl font-bold text-white mb-3"
              variants={itemVariants}
            >
              Access Restricted
            </motion.h1>

            <motion.p
              className="text-purple-100 text-base font-medium"
              variants={itemVariants}
            >
              This page requires authentication
            </motion.p>
          </div>

          {/* Content */}
          <div className="px-8 py-10">
            <motion.div className="text-center mb-8" variants={itemVariants}>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                You're not authenticated
              </h2>

              <p className="text-gray-600 leading-relaxed text-base">
                Please log in to your account to access this protected route. If
                you don't have an account, you can create one from the login
                page.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <motion.button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-base"
                variants={buttonVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogIn className="w-5 h-5" />
                Login to Continue
              </motion.button>

              <motion.button
                onClick={handleGoHome}
                className="w-full border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-semibold py-4 px-6 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-base"
                variants={buttonVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Home className="w-5 h-5" />
                Go to Home
              </motion.button>

              <motion.button
                onClick={handleGoBack}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 px-6 rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-3 text-base"
                variants={buttonVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </motion.button>
            </div>

            {/* Additional Info */}
            <motion.div
              className="mt-8 pt-6 border-t border-gray-100"
              variants={itemVariants}
            >
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">
                  Need help? Contact us
                </p>
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors duration-200 hover:underline"
                >
                  Go to Login
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div className="text-center mt-6" variants={itemVariants}>
          <p className="text-xs text-gray-400">
            © 2024 Unite. All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotAuthenticated;
