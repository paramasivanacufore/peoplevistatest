import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiRequest } from '../../utils/apiUtils';
import AuthBackground from './AuthBackground';
import './Login.css';

export default function OtpVerificationComponent() {
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [otpFocused, setOtpFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(30);
    const navigate = useNavigate();
    const location = useLocation();

    // Get email from location state only
    const [email, setEmail] = useState(() => {
        return location.state?.email || 'your email';
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setOtpError('');

        if (!otp) {
            setOtpError('Please enter the verification code');
            return;
        } else if (otp.length < 6) {
            setOtpError('Code must be 6 digits');
            return;
        }

        setIsLoading(true);
        try {
            // Call backend verify OTP API
            await apiRequest('/auth/verify-otp', {
                method: 'POST',
                data: {
                    email: email,
                    otp: otp,
                },
            });

            // Navigate to reset password page
            navigate('/reset-password', { state: { email, otp } });
        } catch (err) {
            // Handle error response from backend
            const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Invalid or expired OTP';
            setOtpError(errorMessage);
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
                            Verify Your<br />Identity
                        </h1>
                        <p
                            className="mb-6 sm:mb-8 md:mb-10 text-sm sm:text-base md:text-lg text-white/90 leading-relaxed"
                        >
                            We've sent a verification code to <strong>{email}</strong>.
                        </p>
                        <div className="flex items-center gap-3 sm:gap-4 text-white/80 text-sm sm:text-base">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <i className="fas fa-shield-alt text-lg sm:text-xl" style={{ color: '#f4ab21' }}></i>
                            </div>
                            <span>Secure your account.</span>
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
                                    <i className="fas fa-check-circle"></i>
                                </div>
                                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-[36px] font-bold text-gray-800 mb-2">Enter OTP</h2>
                                <p className="text-gray-500 text-xs sm:text-sm">Please enter the 6-digit code</p>
                            </div>
                            {/* OTP Input */}
                            <div className="relative mb-6">
                                <input
                                    type="text"
                                    maxLength="6"
                                    id="otpInput"
                                    className="w-full border rounded-[10px] outline-none transition-all duration-300 disabled:opacity-50 text-center font-bold px-3 sm:px-4 py-3 sm:py-4 text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-[26px] 2xl:text-[28px] tracking-[2px] sm:tracking-[4px] md:tracking-[6px] lg:tracking-[8px] xl:tracking-[10px] 2xl:tracking-[12px]"
                                    style={{
                                        border: `1px solid ${otpError ? '#e91e63' : '#e0e0e0'}`,
                                        background: '#FFF',
                                        boxShadow: otpFocused ? '0 5px 15px rgba(233, 30, 99, 0.1)' : 'none',
                                        borderColor: otpError ? '#e91e63' : (otpFocused ? '#011748' : '#e0e0e0')
                                    }}
                                    placeholder="_ _ _ _ _ _"
                                    value={otp}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setOtp(val);
                                        if (otpError) setOtpError('');
                                    }}
                                    onFocus={() => setOtpFocused(true)}
                                    onBlur={() => setOtpFocused(false)}
                                    disabled={isLoading}
                                    autoComplete="off"
                                />
                            </div>
                            {otpError && (
                                <div className="text-[#e91e63] text-xs sm:text-sm -mt-4 mb-5 text-center">
                                    {otpError}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-3 sm:py-4 rounded-[10px] text-white font-bold uppercase tracking-wider shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base"
                                style={{ background: '#011748' }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Verifying...' : 'Verify Code'}
                            </button>

                            <div className="text-center mt-4 sm:mt-6">
                                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                                    Didn't receive the code?{' '}
                                    {timer > 0 ? (
                                        <span className="font-semibold text-gray-400">Resend in 00:{timer < 10 ? `0${timer}` : timer}</span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    await apiRequest('/auth/forgot-password', {
                                                        method: 'POST',
                                                        data: { email: email },
                                                    });
                                                    setTimer(30);
                                                    setOtpError('');
                                                } catch (err) {
                                                    const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to resend OTP';
                                                    setOtpError(errorMessage);
                                                }
                                            }}
                                            className="font-bold text-people-blue hover:underline bg-transparent border-none cursor-pointer p-0"
                                            disabled={isLoading}
                                        >
                                            Resend OTP
                                        </button>
                                    )}
                                </p>
                                <a
                                    href="/login"
                                    onClick={(e) => { e.preventDefault(); navigate('/login'); }}
                                    className="text-xs sm:text-sm font-semibold text-gray-500 hover:text-people-blue transition-colors flex items-center justify-center gap-2"
                                >
                                    <i className="fas fa-arrow-left"></i> Back to Login
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthBackground>
    );
}
