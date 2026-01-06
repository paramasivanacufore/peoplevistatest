import React, { useState, useEffect, useRef } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const MultiselectDropdown = ({
  options,
  selectedValues,
  onChange,
  placeholder,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    const newSelected = selectedValues.includes(option)
      ? selectedValues.filter((v) => v !== option)
      : [...selectedValues, option];
    onChange(newSelected);
  };

  const displayText =
    selectedValues.length > 0
      ? selectedValues.map((v) => v.charAt(0).toUpperCase() + v.slice(1)).join(', ')
      : placeholder;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 text-left border rounded-lg focus:outline-none focus:ring-2 flex items-center justify-between ${
          error ? 'border-red-500' : 'border-gray-300 focus:ring-blue-500'
        } ${selectedValues.length === 0 ? 'text-gray-500' : 'text-gray-900'}`}
      >
        <span className="truncate">{displayText}</span>
        <FiChevronDown
          className={`ml-2 h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="p-2 space-y-1">
            {options.map((option) => (
              <label key={option} className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={() => toggleOption(option)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiselectDropdown;
