import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Login from './Login';
import Signup from './Signup';

function AuthTabs() {
  const [activeTab, setActiveTab] = useState('login');

  const handleTabChange = tab => {
    setActiveTab(tab);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-8 lg:p-10">
        {/* Tab Navigation */}
        <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleTabChange('login')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-300 ${
              activeTab === 'login'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => handleTabChange('signup')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-300 ${
              activeTab === 'signup'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {activeTab === 'login' ? <Login /> : <Signup />}
          </motion.div>
        </AnimatePresence>
      </Card>
    </div>
  );
}

export default AuthTabs;
