import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiRequest } from '../../utils/apiUtils';
import AuthBackground from './AuthBackground';
import './Login.css';

export default function ForgotPasswordComponent() {
    const location = useLocation();
    // Initialize state from location state only
    const [email, setEmail] = useState(() => {
        return location.state?.email || '';
    });
    const [emailError, setEmailError] = useState('');
    const [emailFocused, setEmailFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Ensure email is updated if location state changes (e.g. back button)
    useEffect(() => {
        const stateEmail = location.state?.email;

        if (stateEmail && stateEmail !== email) {
            setEmail(stateEmail);
        }

        if (stateEmail || email) {
            setEmailFocused(true);
        }
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEmailError('');

        if (!email) {
            setEmailError('Email is required');
            return;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        try {
            // Call backend forgot password API
            await apiRequest('/auth/forgot-password', {
                method: 'POST',
                data: {
                    email: email,
                },
            });

            // Navigate to OTP verification page
            navigate('/verify-otp', { state: { email } });
        } catch (err) {
            // Handle error response from backend
            const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.';
            setEmailError(errorMessage);
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
                            Forgot Your<br />Password?
                        </h1>
                        <p
                            className="mb-6 sm:mb-8 md:mb-10 text-sm sm:text-base md:text-lg text-white/90 leading-relaxed"
                        >
                            Don't worry! It happens. Please check the email address associated with your account.
                        </p>
                        <div className="flex items-center gap-3 sm:gap-4 text-white/80 text-sm sm:text-base">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <i className="fas fa-lock-open text-lg sm:text-xl" style={{ color: '#f4ab21' }}></i>
                            </div>
                            <span>We'll send you a verification code.</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Form Section */}
                <div className="flex-1 bg-transparent lg:bg-white p-5 sm:p-6 md:p-8 lg:p-[50px] xl:p-[60px] w-full lg:w-1/2 h-full flex items-center justify-center relative">

                    <div className="w-full max-w-[400px]">
                        <form 
                            className="bg-white rounded-[30px] p-6 sm:p-8 md:p-10 lg:p-[40px] shadow-2xl"
                            onSubmit={handleSubmit}
                        >
                            <div className="text-center mb-6 sm:mb-8 md:mb-10">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-people-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 text-people-blue text-lg sm:text-xl md:text-2xl">
                                    <i className="fas fa-key"></i>
                                </div>
                                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-[36px] font-bold text-gray-800 mb-2">Reset Password</h2>
                                <p className="text-gray-500 text-xs sm:text-sm">Enter your email to continue</p>
                            </div>
                            {/* Email Input */}
                            <div className="relative mb-6">
                                <input
                                    type="text"
                                    id="emailInput"
                                    value={email}
                                    onChange={(e) => {
                                        // Only allow editing if email wasn't passed from login
                                        if (!location.state?.email) {
                                            setEmail(e.target.value);
                                        }
                                    }}
                                    className="w-full border rounded-[10px] outline-none transition-all duration-300 disabled:opacity-50 px-3 sm:px-4 py-3 text-sm sm:text-base pl-10 sm:pl-11 md:pl-12"
                                    disabled={isLoading}
                                    readOnly={!!location.state?.email}
                                    style={{
                                        border: `1px solid ${emailError ? '#e91e63' : '#e0e0e0'}`,
                                        background: '#FFF',
                                        boxShadow: emailFocused ? '0 5px 15px rgba(233, 30, 99, 0.1)' : 'none',
                                        borderColor: emailError ? '#e91e63' : (emailFocused ? '#011748' : '#e0e0e0'),
                                        cursor: location.state?.email ? 'not-allowed' : 'text'
                                    }}
                                />
                                <i
                                    className="fas fa-envelope absolute pointer-events-none transition-all duration-300 left-3 sm:left-4 top-1/2 -translate-y-1/2 text-base sm:text-lg"
                                    style={{
                                        color: emailFocused ? '#f4ab21' : '#aaa'
                                    }}
                                ></i>
                                <label
                                    htmlFor="emailInput"
                                    className={`absolute pointer-events-none transition-all duration-300 left-10 sm:left-11 md:left-12 ${
                                        email || emailFocused 
                                            ? 'top-0 -translate-y-1/2 text-xs sm:text-xs' 
                                            : 'top-1/2 -translate-y-1/2 text-sm sm:text-base'
                                    } px-1 ${email || emailFocused ? 'bg-white' : 'bg-transparent'}`}
                                    style={{
                                        color: email || emailFocused ? '#f4ab21' : '#aaa',
                                        fontWeight: email || emailFocused ? 600 : 'normal'
                                    }}
                                >
                                    Email Address
                                </label>
                            </div>
                            {emailError && (
                                <div className="text-[#e91e63] text-xs sm:text-sm -mt-4 mb-4 sm:mb-5 ml-1">
                                    {emailError}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-3 sm:py-4 rounded-[10px] text-white font-bold uppercase tracking-wider shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base"
                                style={{ background: '#011748' }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sending...' : 'Send OTP'}
                            </button>

                            <div className="text-center mt-4 sm:mt-6">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-xs sm:text-sm font-semibold text-gray-500 hover:text-people-blue transition-colors flex items-center justify-center gap-2 w-full bg-transparent border-none cursor-pointer"
                                >
                                    <i className="fas fa-arrow-left"></i> Back to Login
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthBackground>
    );
}
