import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FilterDropdown = ({
  options = [],
  value = 'all',
  onChange,
  placeholder = 'Select option',
  getIcon = () => null,
  getLabel = val => val,
  minWidth = '160px',
  className = '',
  disabled = false,
  onOpenChange = () => {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        onOpenChange(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
      onOpenChange(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, onOpenChange]);

  const handleToggle = () => {
    if (disabled) return;

    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    onOpenChange(newIsOpen);
  };

  const handleOptionClick = optionValue => {
    onChange(optionValue);
    setIsOpen(false);
    onOpenChange(false);
  };

  const currentOption =
    options.find(option => option.value === value) || options[0];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={`flex items-center justify-between px-2.5 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200 min-w-0 flex-shrink text-sm ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{ minWidth: minWidth }}
      >
        <div className="flex items-center space-x-1.5">
          {getIcon(value)}
          <span className="text-gray-700 whitespace-nowrap text-sm">
            {getLabel(value)}
          </span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-gray-400 transition-transform flex-shrink-0 ml-1.5 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
          >
            {options.map((option, index) => (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.1, delay: index * 0.05 }}
                onClick={() => handleOptionClick(option.value)}
                className={`w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors text-sm ${
                  value === option.value
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700'
                } ${option.value === 'all' ? 'border-b border-gray-100' : ''}`}
              >
                {option.icon}
                <span>{option.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterDropdown;
