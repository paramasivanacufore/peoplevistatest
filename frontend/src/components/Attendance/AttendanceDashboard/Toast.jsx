import React, { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiX } from 'react-icons/fi';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const typeStyles = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            icon: 'text-green-600',
            iconBg: 'bg-green-100',
            text: 'text-green-800'
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: 'text-red-600',
            iconBg: 'bg-red-100',
            text: 'text-red-800'
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            icon: 'text-yellow-600',
            iconBg: 'bg-yellow-100',
            text: 'text-yellow-800'
        }
    };

    const styles = typeStyles[type] || typeStyles.success;
    const Icon = type === 'success' ? FiCheckCircle : type === 'error' ? FiXCircle : FiAlertCircle;

    return (
        <div className={`fixed top-4 right-4 z-50 min-w-[300px] max-w-md ${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 animate-slide-in`}>
            <div className="flex items-start">
                <div className={`flex-shrink-0 ${styles.iconBg} rounded-full p-1.5`}>
                    <Icon className={`w-5 h-5 ${styles.icon}`} />
                </div>
                <div className={`ml-3 flex-1 ${styles.text}`}>
                    <p className="text-sm font-medium">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className={`ml-4 flex-shrink-0 ${styles.text} hover:opacity-75 transition-opacity`}
                >
                    <FiX className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;

