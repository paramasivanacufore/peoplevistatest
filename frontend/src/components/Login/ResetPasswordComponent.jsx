import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiRequest } from '../../utils/apiUtils';
import AuthBackground from './AuthBackground';
import Toast from '../Attendance/AttendanceDashboard/Toast';
import './Login.css';

export default function ResetPasswordComponent() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');
    const [passFocused, setPassFocused] = useState(false);
    const [confirmFocused, setConfirmFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || '';
    const otp = location.state?.otp || '';

    const validatePassword = (pwd) => {
        const errors = [];
        
        if (pwd.length < 8) {
            errors.push('Password must be at least 8 characters');
        }
        if (pwd.length > 16) {
            errors.push('Password must be at most 16 characters');
        }
        if (!/[A-Z]/.test(pwd)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(pwd)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(pwd)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
            errors.push('Password must contain at least one symbol');
        }
        
        return errors;
    };

    // Get individual validation status for dynamic display
    const getPasswordValidationStatus = (pwd) => {
        return {
            lengthValid: pwd.length >= 8 && pwd.length <= 16,
            hasUppercase: /[A-Z]/.test(pwd),
            hasLowercase: /[a-z]/.test(pwd),
            hasNumber: /[0-9]/.test(pwd),
            hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
            isValid: validatePassword(pwd).length === 0 && pwd.length > 0
        };
    };

    const passwordValidation = getPasswordValidationStatus(password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setConfirmError('');

        let isValid = true;
        
        if (!password) {
            setPasswordError('New password is required');
            isValid = false;
        } else {
            const passwordErrors = validatePassword(password);
            if (passwordErrors.length > 0) {
                setPasswordError(passwordErrors[0]);
                isValid = false;
            }
        }

        if (password !== confirmPassword) {
            setConfirmError('Passwords do not match');
            isValid = false;
        }

        if (!isValid) return;

        // Check if OTP is available
        if (!otp) {
            setPasswordError('OTP is required. Please go back and verify your OTP again.');
            return;
        }

        setIsLoading(true);
        try {
            // Call backend reset password API
            const response = await apiRequest('/auth/reset-password', {
                method: 'POST',
                data: {
                    email: email,
                    otp: otp,
                    new_password: password,
                },
            });

            // Password reset successful - show toast and redirect to login
            setToast({ 
                show: true, 
                message: 'Password reset successfully! Please log in with your new password.', 
                type: 'success' 
            });
            // Navigate after a short delay to allow user to see the toast
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            // Handle error response from backend
            const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to reset password. Please try again.';
            setPasswordError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthBackground>
            {/* Main Container */}
            <div className="flex bg-transparent lg:bg-white rounded-[30px] lg:rounded-[30px] rounded-none shadow-none lg:shadow-2xl overflow-visible lg:overflow-hidden max-w-[1100px] xl:max-w-[1150px] 2xl:max-w-[1150px] w-full lg:w-[88%] min-h-[100vh] lg:min-h-[600px] relative z-10 animate-slide-in flex-col lg:flex-row">

                {/* Left Panel - Info Section */}
                <div className="hidden lg:flex flex-1 bg-people-blue p-8 sm:p-10 md:p-12 lg:p-[50px] xl:p-[60px] w-full lg:w-1/2 flex-col justify-center relative overflow-hidden">
                    {/* Animated background shapes */}
                    <div className="absolute w-[300px] h-[300px] rounded-full bg-white/10 top-[-100px] left-[-100px] animate-pulse-slow"></div>
                    <div className="absolute w-[200px] h-[200px] rounded-full bg-white/10 bottom-[-50px] right-[-50px] animate-pulse-medium" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute w-[150px] h-[150px] rounded-full bg-white/10 top-1/2 left-[20%] animate-pulse-fast" style={{ animationDelay: '1s' }}></div>

                    <div className="relative z-[2] flex-1 flex flex-col justify-center">
                        <h1
                            className="text-white mb-4 sm:mb-5 leading-tight text-2xl sm:text-3xl md:text-4xl lg:text-[45px] xl:text-[48px] 2xl:text-[50px] font-bold"
                            style={{ lineHeight: '1.2', color: 'white' }}
                        >
                            Create New<br />Password
                        </h1>
                        <p
                            className="mb-6 sm:mb-8 md:mb-10 text-sm sm:text-base md:text-lg text-white/90 leading-relaxed"
                        >
                            Your new password should be different from previously used passwords.
                        </p>
                        <ul className="text-white/80 space-y-2 sm:space-y-3 text-sm sm:text-base">
                            <li className="flex items-center gap-3">
                                {passwordValidation.lengthValid ? (
                                    <i className="fas fa-check-circle text-green-400"></i>
                                ) : (
                                    <i className="fas fa-times-circle" style={{ color: '#e75757e0' }}></i>
                                )}
                                <span style={{ color: passwordValidation.lengthValid ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)' }}>
                                    8-16 characters
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                {passwordValidation.hasUppercase ? (
                                    <i className="fas fa-check-circle text-green-400"></i>
                                ) : (
                                    <i className="fas fa-times-circle" style={{ color: '#e75757e0' }}></i>
                                )}
                                <span style={{ color: passwordValidation.hasUppercase ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)' }}>
                                    One uppercase letter
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                {passwordValidation.hasLowercase ? (
                                    <i className="fas fa-check-circle text-green-400"></i>
                                ) : (
                                    <i className="fas fa-times-circle" style={{ color: '#e75757e0' }}></i>
                                )}
                                <span style={{ color: passwordValidation.hasLowercase ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)' }}>
                                    One lowercase letter
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                {passwordValidation.hasNumber ? (
                                    <i className="fas fa-check-circle text-green-400"></i>
                                ) : (
                                    <i className="fas fa-times-circle" style={{ color: '#e75757e0' }}></i>
                                )}
                                <span style={{ color: passwordValidation.hasNumber ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)' }}>
                                    One number
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                {passwordValidation.hasSymbol ? (
                                    <i className="fas fa-check-circle text-green-400"></i>
                                ) : (
                                    <i className="fas fa-times-circle" style={{ color: '#e75757e0' }}></i>
                                )}
                                <span style={{ color: passwordValidation.hasSymbol ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)' }}>
                                    One symbol
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Panel - Form Section */}
                <div className="flex-1 bg-transparent lg:bg-white p-5 sm:p-6 md:p-8 lg:p-[50px] xl:p-[60px] w-full lg:w-1/2 h-full flex items-center justify-center relative">

                    <div className="w-full max-w-[400px]">
                        <form 
                            className="bg-white rounded-[30px] p-6 sm:p-8 md:p-10 lg:p-[40px] shadow-2xl"
                            onSubmit={handleSubmit} 
                            autoComplete="off"
                        >
                            <div className="text-center mb-6 sm:mb-8 md:mb-10">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-people-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 text-people-blue text-lg sm:text-xl md:text-2xl">
                                    <i className="fas fa-lock"></i>
                                </div>
                                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-[36px] font-bold text-gray-800 mb-2">Set New Password</h2>
                                <p className="text-gray-500 text-xs sm:text-sm">
                                    {email ? `Resetting password for ${email}` : "Please type something you'll remember"}
                                </p>
                            </div>
                            {/* Password Input */}
                            <div className="relative mb-6">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="passInput"
                                    name="new-password"
                                    autoComplete="off"
                                    data-form-type="other"
                                    data-lpignore="true"
                                    data-1p-ignore="true"
                                    data-dashlane-ignore="true"
                                    data-bitwarden-watching="false"
                                    readOnly={!passFocused}
                                    onFocus={(e) => {
                                        e.target.removeAttribute('readonly');
                                        setPassFocused(true);
                                    }}
                                    className="w-full border rounded-[10px] outline-none transition-all duration-300 disabled:opacity-50 px-3 sm:px-4 py-3 text-sm sm:text-base pl-10 sm:pl-11 md:pl-12 pr-10 sm:pr-11 md:pr-12"
                                    style={{
                                        border: `1px solid ${passwordError ? '#e91e63' : '#e0e0e0'}`,
                                        background: '#FFF',
                                        boxShadow: passFocused ? '0 5px 15px rgba(233, 30, 99, 0.1)' : 'none',
                                        borderColor: passwordError ? '#e91e63' : (passFocused ? '#011748' : '#e0e0e0')
                                    }}
                                    placeholder=" "
                                    value={password}
                                    onChange={(e) => {
                                        const newPassword = e.target.value;
                                        setPassword(newPassword);
                                        // Clear error if password becomes valid
                                        const errors = validatePassword(newPassword);
                                        if (errors.length === 0 && newPassword.length > 0) {
                                            setPasswordError('');
                                        } else if (passwordError) {
                                            setPasswordError(errors[0] || '');
                                        }
                                    }}
                                    onBlur={() => setPassFocused(false)}
                                    disabled={isLoading}
                                />
                                <i
                                    className="fas fa-lock absolute pointer-events-none transition-all duration-300 left-3 sm:left-4 top-1/2 -translate-y-1/2 text-base sm:text-lg"
                                    style={{
                                        color: passFocused ? '#f4ab21' : '#aaa'
                                    }}
                                ></i>
                                <label
                                    htmlFor="passInput"
                                    className={`absolute pointer-events-none transition-all duration-300 left-10 sm:left-11 md:left-12 ${
                                        password || passFocused 
                                            ? 'top-0 -translate-y-1/2 text-xs sm:text-xs' 
                                            : 'top-1/2 -translate-y-1/2 text-sm sm:text-base'
                                    } px-1 ${password || passFocused ? 'bg-white' : 'bg-transparent'}`}
                                    style={{
                                        color: password || passFocused ? '#f4ab21' : '#aaa',
                                        fontWeight: password || passFocused ? 600 : 'normal'
                                    }}
                                >
                                    New Password
                                </label>
                                {/* Eye Icon */}
                                <div
                                    className="absolute cursor-pointer transition-colors duration-300 right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </div>
                            </div>
                            {passwordError && (
                                <div className={`text-[#e91e63] text-xs sm:text-sm ${password ? 'mt-0' : '-mt-4'} mb-4 ml-1`}>
                                    {passwordError}
                                </div>
                            )}

                            {/* Confirm Password Input */}
                            <div className="relative mb-6">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmInput"
                                    name="confirm-new-password"
                                    autoComplete="off"
                                    data-form-type="other"
                                    data-lpignore="true"
                                    data-1p-ignore="true"
                                    data-dashlane-ignore="true"
                                    data-bitwarden-watching="false"
                                    readOnly={!confirmFocused}
                                    onFocus={(e) => {
                                        e.target.removeAttribute('readonly');
                                        setConfirmFocused(true);
                                    }}
                                    className="w-full border rounded-[10px] outline-none transition-all duration-300 disabled:opacity-50 px-3 sm:px-4 py-3 text-sm sm:text-base pl-10 sm:pl-11 md:pl-12 pr-10 sm:pr-11 md:pr-12"
                                    style={{
                                        border: `1px solid ${confirmError ? '#e91e63' : '#e0e0e0'}`,
                                        background: '#FFF',
                                        boxShadow: confirmFocused ? '0 5px 15px rgba(233, 30, 99, 0.1)' : 'none',
                                        borderColor: confirmError ? '#e91e63' : (confirmFocused ? '#011748' : '#e0e0e0')
                                    }}
                                    placeholder=" "
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        const newConfirmPassword = e.target.value;
                                        setConfirmPassword(newConfirmPassword);
                                        if (confirmError) {
                                            if (newConfirmPassword === password) {
                                                setConfirmError('');
                                            }
                                        }
                                    }}
                                    onBlur={() => {
                                        setConfirmFocused(false);
                                        if (confirmPassword && confirmPassword !== password) {
                                            setConfirmError('Passwords do not match');
                                        }
                                    }}
                                    disabled={isLoading}
                                />
                                <i
                                    className="fas fa-shield-alt absolute pointer-events-none transition-all duration-300 left-3 sm:left-4 top-1/2 -translate-y-1/2 text-base sm:text-lg"
                                    style={{
                                        color: confirmFocused ? '#f4ab21' : '#aaa'
                                    }}
                                ></i>
                                <label
                                    htmlFor="confirmInput"
                                    className={`absolute pointer-events-none transition-all duration-300 left-10 sm:left-11 md:left-12 ${
                                        confirmPassword || confirmFocused 
                                            ? 'top-0 -translate-y-1/2 text-xs sm:text-xs' 
                                            : 'top-1/2 -translate-y-1/2 text-sm sm:text-base'
                                    } px-1 ${confirmPassword || confirmFocused ? 'bg-white' : 'bg-transparent'}`}
                                    style={{
                                        color: confirmPassword || confirmFocused ? '#f4ab21' : '#aaa',
                                        fontWeight: confirmFocused ? 600 : 'normal'
                                    }}
                                >
                                    Confirm Password
                                </label>
                                {/* Eye Icon */}
                                <div
                                    className="absolute cursor-pointer transition-colors duration-300 right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </div>
                            </div>
                            {confirmError && (
                                <div className="text-[#e91e63] text-xs sm:text-sm -mt-4 mb-5 ml-1">
                                    {confirmError}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-3 sm:py-4 rounded-[10px] text-white font-bold uppercase tracking-wider shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base"
                                style={{ background: '#011748' }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            {/* Toast Notification */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '', type: 'success' })}
                    duration={3000}
                />
            )}
        </AuthBackground>
    );
}
