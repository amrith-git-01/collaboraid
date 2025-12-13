import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import Input from './ui/Input';
import locationService from '../services/locationService';

const LocationSearch = ({
  value = '',
  onChange,
  onLocationSelect,
  placeholder = 'Search for a location...',
  className = '',
  error = false,
  errorColor = 'red',
}) => {
  const [searchQuery, setSearchQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const isSelectingRef = useRef(false);

  // Sync with external value prop
  useEffect(() => {
    // Only update if value actually changed and we're not in the middle of selecting
    // Also skip if the value matches the selected location's display text (to prevent re-search after selection)
    if (
      value !== searchQuery &&
      !isSelectingRef.current &&
      value !== (selectedLocation?.displayName || selectedLocation?.address)
    ) {
    setSearchQuery(value);
    }
  }, [value, searchQuery, selectedLocation]);

  // Debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Skip search if we're in the middle of selecting a location
    if (isSelectingRef.current) {
      return;
    }

    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchLocations = async query => {
    try {
      const results = await locationService.searchPlaces(query, 5);
      console.log('Location search results for "' + query + '":', results);
      setSuggestions(results || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Location search error for "' + query + '":', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
      setSuggestions([]);
      setShowSuggestions(true); // Still show "no results" message
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = e => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onChange?.(newValue);
    setShowSuggestions(true);
    
    if (selectedLocation) {
      setSelectedLocation(null);
    }
  };

  const handleSelectSuggestion = suggestion => {
    const displayText = suggestion.displayName || suggestion.address;

    // Clear any pending search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    isSelectingRef.current = true;
    // Clear suggestions immediately to prevent dropdown from showing
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchQuery(displayText);
    setSelectedLocation(suggestion);
    onChange?.(displayText);
    onLocationSelect?.(suggestion);
    // Reset isSelecting flag after a delay to allow parent state updates to complete
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 500);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedLocation(null);
    setSuggestions([]);
    setShowSuggestions(false);
    onChange?.('');
    onLocationSelect?.(null);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          icon={MapPin}
          className="pr-10"
          error={error}
          errorColor={errorColor}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isLoading && (
        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
          <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar">
          {suggestions.map(suggestion => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.displayName || suggestion.address}
                  </p>
                  {suggestion.fullAddress &&
                    suggestion.fullAddress !== suggestion.displayName && (
                    <p className="text-xs text-gray-500 truncate">
                      {suggestion.fullAddress}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showSuggestions &&
        !isLoading &&
        searchQuery.length >= 2 &&
        suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <p className="text-sm text-gray-500 text-center">
            No locations found. Try a different search term.
          </p>
            <p className="text-xs text-gray-400 text-center mt-1">
              Make sure you're searching for a city, address, or landmark.
            </p>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
