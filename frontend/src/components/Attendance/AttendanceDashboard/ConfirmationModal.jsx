import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning', showInput = false, inputPlaceholder = 'Enter comments...', inputLabel = 'Comments (Optional)' }) => {
    const [inputValue, setInputValue] = useState('');

    // Reset input when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setInputValue('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(showInput ? inputValue : undefined);
    };

    const typeStyles = {
        warning: {
            icon: 'text-yellow-600',
            iconBg: 'bg-yellow-100',
            button: 'bg-[#011748] hover:bg-[#011748]/90'
        },
        danger: {
            icon: 'text-red-600',
            iconBg: 'bg-red-100',
            button: 'bg-red-600 hover:bg-red-700'
        },
        success: {
            icon: 'text-green-600',
            iconBg: 'bg-green-100',
            button: 'bg-green-600 hover:bg-green-700'
        }
    };

    const styles = typeStyles[type] || typeStyles.warning;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                {/* Background overlay */}
                <div 
                    className="fixed inset-0 transition-opacity bg-black bg-opacity-40"
                    onClick={onClose}
                ></div>

                {/* Modal panel - centered */}
                <div className="relative inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-lg w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${styles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                                <FiAlertCircle className={`h-6 w-6 ${styles.icon}`} />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    {title}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {message}
                                    </p>
                                    {showInput && (
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {inputLabel}
                                            </label>
                                            <textarea
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                rows={3}
                                                placeholder={inputPlaceholder}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#011748] focus:border-transparent resize-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white ${styles.button} focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm`}
                        >
                            {confirmText}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#011748] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;

