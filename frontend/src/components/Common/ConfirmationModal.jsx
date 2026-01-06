import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "warning" // warning, danger, info
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          borderColor: 'border-red-200'
        };
      case 'info':
        return {
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          confirmBg: 'bg-blue-600 hover:bg-blue-700',
          borderColor: 'border-blue-200'
        };
      default: // warning
        return {
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
          borderColor: 'border-yellow-200'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl max-w-sm w-full border ${styles.borderColor}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${styles.iconBg}`}>
              <FiAlertTriangle className={`w-4 h-4 ${styles.iconColor}`} />
            </div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          <p className="text-gray-600 text-xs leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 p-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-3 py-1.5 text-xs font-medium text-white rounded-md transition-colors ${styles.confirmBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
