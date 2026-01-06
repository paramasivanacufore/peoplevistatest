import React, { useState, useEffect, useRef } from 'react';
import { Country, State, City } from 'country-state-city';

const LocationAutocomplete = ({ 
  type, // 'country', 'state', or 'city'
  value, 
  onChange, 
  onSelect,
  countryCode, // Required for states
  stateCode, // Required for cities
  error,
  label,
  required = false,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [allOptions, setAllOptions] = useState([]);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Load all options based on type
  useEffect(() => {
    let options = [];
    
    if (type === 'country') {
      options = Country.getAllCountries().map(country => ({
        value: country.isoCode,
        label: country.name,
        isoCode: country.isoCode
      }));
    } else if (type === 'state' && countryCode) {
      options = State.getStatesOfCountry(countryCode).map(state => ({
        value: state.isoCode,
        label: state.name,
        isoCode: state.isoCode
      }));
    } else if (type === 'city' && countryCode && stateCode) {
      options = City.getCitiesOfState(countryCode, stateCode).map(city => ({
        value: city.name,
        label: city.name
      }));
    }
    
    setAllOptions(options);
  }, [type, countryCode, stateCode]);

  // Update input value when value prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Handle input change
  const handleInputChange = (e) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);
    
    // Call onChange to update parent form data
    if (onChange) {
      onChange(e);
    }

    // Show dropdown and filter options only if input length >= 2
    if (inputVal.length >= 2) {
      const filtered = allOptions.filter(option =>
        option.label.toLowerCase().startsWith(inputVal.toLowerCase())
      );
      setFilteredOptions(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setFilteredOptions([]);
      setShowDropdown(false);
    }
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    setInputValue(option.label);
    setShowDropdown(false);
    
    // Call onSelect callback with the selected option
    if (onSelect) {
      onSelect(option);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle input focus
  const handleFocus = () => {
    if (inputValue.length >= 2 && filteredOptions.length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-bold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        disabled={disabled}
        placeholder={`Type at least 2 characters to search ${type}...`}
        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
          error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-blue-500'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {showDropdown && filteredOptions.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredOptions.map((option, index) => (
            <div
              key={index}
              onClick={() => handleOptionSelect(option)}
              className="px-3 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
      
      {showDropdown && filteredOptions.length === 0 && inputValue.length >= 2 && (
        <div 
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
        >
          <div className="px-3 py-2 text-gray-500">
            No {type} found
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;

