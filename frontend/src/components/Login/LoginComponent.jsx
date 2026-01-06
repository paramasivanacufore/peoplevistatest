import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/apiUtils';
import { useAuth } from '../../context/AuthContext';
import AuthBackground from './AuthBackground';
import Logo from '../../assets/images/Logo.png';
import Logo1 from '../../assets/images/Logo1.png';
import AcuforeLogo from '../../assets/images/acufore-logo.png';
import './Login.css';

export default function LoginComponent() {
    const { login } = useAuth();
    const [isActive, setIsActive] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [recaptchaError, setRecaptchaError] = useState('');
    const [recaptchaToken, setRecaptchaToken] = useState('');
    const recaptchaRef = useRef(null);
    const navigate = useNavigate();

    const emailInputRef = useRef(null);
    const passwordInputRef = useRef(null);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const showLoginForm = () => {
        setIsActive(true);
    };

    const handleLogin = useCallback(async (e) => {
        e?.preventDefault();
        setError('');
        setEmailError('');
        setPasswordError('');
        setRecaptchaError('');

        let isValid = true;

        // Validate email/username
        if (!email || email.trim() === '') {
            setEmailError('Email or username is required');
            isValid = false;
        } else if (email.trim().length < 3) {
            setEmailError('Email or username must be at least 3 characters');
            isValid = false;
        } else if (email.includes('@') && !/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Please enter a valid email address');
            isValid = false;
        }

        // Validate password
        if (!password || password.trim() === '') {
            setPasswordError('Password is required');
            isValid = false;
        } else if (password.length < 1) {
            setPasswordError('Password cannot be empty');
            isValid = false;
        }

        if (!isValid) return;

        // Validate reCAPTCHA
        // if (!recaptchaToken || recaptchaToken.trim() === '') {
        //     setRecaptchaError('Please complete the reCAPTCHA verification');
        //     setError('Please complete the reCAPTCHA verification');
        //     return;
        // }

        setIsLoading(true);
        try {
            // Call backend login API
            const response = await apiRequest('/auth/login', {
                method: 'POST',
                data: {
                    login: email, // Backend accepts username or email as 'login'
                    password: password,
                    remember_me: rememberMe,
                    recaptcha_token: recaptchaToken,
                },
            });

            // Update auth context with user data and session_id
            if (response.user && response.session_id) {
                login(response.user, response.session_id, rememberMe);
            }

            // Navigate to dashboard
            navigate('/dashboard');
        } catch (err) {
            // Handle error response from backend
            const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
            const errorLower = errorMessage.toLowerCase();
            
            // Clear previous errors
            setEmailError('');
            setPasswordError('');
            setRecaptchaError('');
            setError('');
            
            // Handle specific error types
            if (errorLower.includes('recaptcha') || errorLower.includes('captcha')) {
                // reCAPTCHA related errors
                setRecaptchaError('reCAPTCHA verification failed. Please try again.');
                setError('reCAPTCHA verification failed. Please complete the verification again.');
                
                // Reset reCAPTCHA
                if (window.grecaptcha && recaptchaRef.current) {
                    window.grecaptcha.reset();
                    setRecaptchaToken('');
                }
            } else if (errorLower.includes('invalid credentials') || errorLower.includes('incorrect') || errorLower.includes('wrong password') || errorLower.includes('user not found')) {
                // Credential errors
                setEmailError('Invalid email/username or password');
                setPasswordError('Invalid email/username or password');
                setError('Invalid email/username or password. Please check your credentials and try again.');
                
                // Reset reCAPTCHA on credential error
                if (window.grecaptcha && recaptchaRef.current) {
                    window.grecaptcha.reset();
                    setRecaptchaToken('');
                }
            } else if (errorLower.includes('rate limit') || errorLower.includes('too many attempts')) {
                // Rate limiting errors
                setError(errorMessage);
                setEmailError('Too many login attempts. Please wait before trying again.');
                
                // Reset reCAPTCHA
                if (window.grecaptcha && recaptchaRef.current) {
                    window.grecaptcha.reset();
                    setRecaptchaToken('');
                }
            } else {
                // Generic errors
                setError(errorMessage);
                
                // Reset reCAPTCHA on any error
                if (window.grecaptcha && recaptchaRef.current) {
                    window.grecaptcha.reset();
                    setRecaptchaToken('');
                }
            }
        } finally {
            setIsLoading(false);
        }
    }, [email, password, rememberMe, recaptchaToken, navigate]);

    // Handle enter key for login
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Enter' && isActive) {
                handleLogin(e);
            }
        };
        document.addEventListener('keypress', handleKeyPress);
        return () => document.removeEventListener('keypress', handleKeyPress);
    }, [isActive, handleLogin]);

    // Initialize reCAPTCHA when login form is active
    useEffect(() => {
        if (!isActive || !recaptchaRef.current) return;

        const initRecaptcha = () => {
            if (window.grecaptcha && recaptchaRef.current) {
                // Clear any existing widget
                if (recaptchaRef.current.hasChildNodes()) {
                    recaptchaRef.current.innerHTML = '';
                }
                
                // Get reCAPTCHA site key from environment variable or use provided key
                const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LcxlowrAAAAABkUaWvLg9bBJ-vM1ifxjaqt7jyN';
                
                const widgetId = window.grecaptcha.render(recaptchaRef.current, {
                    sitekey: recaptchaSiteKey,
                    callback: (token) => {
                        setRecaptchaToken(token);
                        setRecaptchaError('');
                        setError('');
                    },
                    'expired-callback': () => {
                        setRecaptchaToken('');
                        setRecaptchaError('reCAPTCHA expired. Please verify again.');
                    },
                    'error-callback': () => {
                        setRecaptchaToken('');
                        setRecaptchaError('reCAPTCHA error. Please try again.');
                        setError('reCAPTCHA error. Please try again.');
                    }
                });
                
                return () => {
                    if (window.grecaptcha && widgetId) {
                        try {
                            window.grecaptcha.reset(widgetId);
                        } catch (e) {
                            // Ignore reset errors
                        }
                    }
                };
            }
        };

        // Wait for grecaptcha to be available
        if (window.grecaptcha) {
            return initRecaptcha();
        } else {
            // Poll for grecaptcha to load
            const interval = setInterval(() => {
                if (window.grecaptcha) {
                    clearInterval(interval);
                    initRecaptcha();
                }
            }, 100);
            
            return () => clearInterval(interval);
        }
    }, [isActive]);


    const floatingWords = [
        { icon: 'fa-money-bill-wave', text: 'Payroll', delay: '0s' },
        { icon: 'fa-chart-line', text: 'Sales Pipeline', delay: '1s' },
        { icon: 'fa-user-plus', text: 'Recruitment', delay: '2s' },
        { icon: 'fa-bullhorn', text: 'Lead Management', delay: '1.5s' },
        { icon: 'fa-tachometer-alt', text: 'Performance', delay: '0.7s' },
        { icon: 'fa-chart-pie', text: 'Customer Analytics', delay: '2.3s' },
        { icon: 'fa-clock', text: 'Attendance', delay: '1.2s' },
        { icon: 'fa-handshake', text: 'Deal Tracking', delay: '1.8s' },
    ];

    const wordPositions = [
        'top-[5%] left-[5%]',
        'top-[6%] right-[8%]',
        'top-[50%] left-[2%]',
        'bottom-[26%] right-[12%]',
        'bottom-[15%] left-[10%]',
        'top-[26%] right-[5%]',
        'bottom-[5%] right-[38%]',
        'top-[18%] left-[20%]',
    ];

    return (
        <AuthBackground>
            {/* Main Container */}
            <div className={`login-container flex bg-transparent lg:bg-white rounded-[30px] lg:rounded-[30px] rounded-none shadow-none lg:shadow-2xl overflow-hidden max-w-[1100px] xl:max-w-[1200px] 2xl:max-w-[1200px] w-full lg:w-[90%] min-h-[100vh] lg:min-h-[600px] relative z-10 animate-slide-in flex-col lg:flex-row ${isActive ? 'active' : ''}`}>
                {/* Left Panel - Welcome Section */}
                <div 
                    className={`left-panel-lg flex lg:flex flex-1 bg-people-blue p-5 sm:p-6 md:p-8 lg:p-[50px] xl:p-[60px] absolute left-0 top-0 w-full lg:w-1/2 h-full overflow-hidden flex-col z-[3]`}
                >
                    {/* Animated background shapes */}
                    <div className="absolute w-[300px] h-[300px] rounded-full bg-white/10 top-[-100px] left-[-100px] animate-pulse-slow"></div>
                    <div className="absolute w-[200px] h-[200px] rounded-full bg-white/10 bottom-[-50px] right-[-50px] animate-pulse-medium" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute w-[150px] h-[150px] rounded-full bg-white/10 top-1/2 left-[20%] animate-pulse-fast" style={{ animationDelay: '1s' }}></div>

                    {/* Logo */}
                    <div className="flex items-center gap-4 mb-10 sm:mb-12 md:mb-16 lg:mb-20 relative z-[2]">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center">
                            <img
                                src={Logo}
                                alt="PeopleVista Logo"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    e.target.src = Logo1;
                                }}
                            />
                        </div>
                    </div>

                    {/* Welcome Content */}
                    <div className="relative z-[2] flex-1 flex flex-col justify-center">
                        <h1
                            className="text-white mb-4 sm:mb-5 leading-tight text-2xl sm:text-3xl md:text-4xl lg:text-[45px] xl:text-[48px] 2xl:text-[50px] font-bold"
                            style={{ lineHeight: '1.2', color: 'white' }}
                        >
                            Welcome Back To PeopleVista
                        </h1>
                        <p
                            className="mb-6 sm:mb-8 md:mb-10 text-sm sm:text-base md:text-lg text-white/90 leading-relaxed"
                        >
                            To keep connected with us please<br />login with your personal info
                        </p>
                        <button
                            className={`bg-transparent border-2 border-white text-white px-6 sm:px-8 md:px-10 lg:px-12 py-3 sm:py-4 rounded-full cursor-pointer transition-all duration-300 uppercase self-start hover:bg-white hover:-translate-y-0.5 hover:shadow-lg text-sm sm:text-base font-semibold tracking-wide relative z-10 ${isActive ? 'opacity-0 pointer-events-none' : ''}`}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#faae11';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'white';
                            }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                showLoginForm();
                            }}
                        >
                            Sign In
                        </button>
                    </div>
                </div>

                {/* Login Panel */}
                <div className={`login-panel-lg flex-1 bg-white p-5 sm:p-6 md:p-8 lg:p-[50px] xl:p-[60px] absolute left-0 lg:left-0 top-0 w-full lg:w-1/2 h-full flex items-center justify-center z-[2] lg:z-[4] ${
                    isActive 
                        ? 'opacity-100 translate-x-0 pointer-events-auto' 
                        : 'opacity-0 translate-x-full lg:opacity-0 lg:translate-x-0 pointer-events-none'
                }`}>

                    <div className="w-full max-w-[400px] relative z-10">
                        <form
                            className="bg-white rounded-[30px] p-6 sm:p-8 md:p-10 lg:p-[40px] shadow-2xl"
                            onSubmit={handleLogin}
                        >
                            <h2
                                className="text-center text-gray-800 text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-bold mb-2 sm:mb-3"
                            >
                                Sign In
                            </h2>
                            <p
                                className="text-center text-gray-600 text-xs sm:text-sm mb-6 sm:mb-8"
                            >
                                Enter your credentials to access your account
                            </p>

                            {/* Email Input */}
                            <div className={`relative ${emailError ? 'mb-3' : 'mb-6'}`}>
                                <input
                                    ref={emailInputRef}
                                    type="text"
                                    id="emailInput"
                                    className="w-full border rounded-[10px] outline-none transition-all duration-300 disabled:opacity-50 px-3 sm:px-4 py-3 text-sm sm:text-base pl-10 sm:pl-11 md:pl-12"
                                    style={{
                                        border: `1px solid ${emailError ? '#e91e63' : '#e0e0e0'}`,
                                        background: '#FFF',
                                        boxShadow: emailFocused ? '0 5px 15px rgba(233, 30, 99, 0.1)' : 'none',
                                        borderColor: emailError ? '#e91e63' : (emailFocused ? '#011748' : '#e0e0e0')
                                    }}
                                    placeholder=" "
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (emailError) setEmailError('');
                                    }}
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => setEmailFocused(false)}
                                    disabled={isLoading}
                                />
                                <i
                                    className="fas fa-envelope absolute pointer-events-none transition-all duration-300 left-3 sm:left-4 top-1/2 -translate-y-1/2 text-base sm:text-lg"
                                    style={{
                                        color: emailFocused ? '#f4ab21' : '#aaa'
                                    }}
                                    aria-hidden="true"
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
                                <div className="text-[#e91e63] text-xs sm:text-sm -mt-2 mb-5 ml-1">
                                    {emailError}
                                </div>
                            )}

                            {/* Password Input */}
                            <div className={`relative ${passwordError ? 'mb-3' : 'mb-6'}`}>
                                <input
                                    ref={passwordInputRef}
                                    type={showPassword ? "text" : "password"}
                                    id="passwordInput"
                                    className="w-full border rounded-[10px] outline-none transition-all duration-300 disabled:opacity-50 px-3 sm:px-4 py-3 text-sm sm:text-base pl-10 sm:pl-11 md:pl-12 pr-10 sm:pr-11 md:pr-12"
                                    style={{
                                        border: `1px solid ${passwordError ? '#e91e63' : '#e0e0e0'}`,
                                        background: '#FFF',
                                        boxShadow: passwordFocused ? '0 5px 15px rgba(233, 30, 99, 0.1)' : 'none',
                                        borderColor: passwordError ? '#e91e63' : (passwordFocused ? '#011748' : '#e0e0e0')
                                    }}
                                    placeholder=" "
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (passwordError) setPasswordError('');
                                    }}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                    disabled={isLoading}
                                />
                                <i
                                    className="fas fa-lock absolute pointer-events-none transition-all duration-300 left-3 sm:left-4 top-1/2 -translate-y-1/2 text-base sm:text-lg"
                                    style={{
                                        color: passwordFocused ? '#f4ab21' : '#aaa'
                                    }}
                                    aria-hidden="true"
                                ></i>
                                <label
                                    htmlFor="passwordInput"
                                    className={`absolute pointer-events-none transition-all duration-300 left-10 sm:left-11 md:left-12 ${
                                        password || passwordFocused 
                                            ? 'top-0 -translate-y-1/2 text-xs sm:text-xs' 
                                            : 'top-1/2 -translate-y-1/2 text-sm sm:text-base'
                                    } px-1 ${password || passwordFocused ? 'bg-white' : 'bg-transparent'}`}
                                    style={{
                                        color: password || passwordFocused ? '#f4ab21' : '#aaa',
                                        fontWeight: password || passwordFocused ? 600 : 'normal'
                                    }}
                                >
                                    Password
                                </label>
                                {/* Eye Icon for Show/Hide Password */}
                                <div
                                    className="absolute cursor-pointer transition-colors duration-300 right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </div>
                            </div>
                            {passwordError && (
                                <div className="text-[#e91e63] text-xs sm:text-sm -mt-2 mb-5 ml-1">
                                    {passwordError}
                                </div>
                            )}

                            {/* Remember Me & Forgot Password */}
                            <div className="flex justify-between items-center mb-6 sm:mb-6 relative z-10 text-xs sm:text-sm">
                                <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        disabled={isLoading}
                                        className="w-4 h-4 sm:w-[18px] sm:h-[18px] cursor-pointer"
                                    />
                                    Remember me
                                </label>
                                <a
                                    href="/forgot-password"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setEmailError('');
                                        setError('');
                                        // Validate email before navigating
                                        if (!email || email.trim() === '') {
                                            setEmailError('Please enter your email to reset password');
                                            emailInputRef.current?.focus();
                                            // Scroll to input if needed
                                            emailInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            return;
                                        } else if (email.includes('@') && !/\S+@\S+\.\S+/.test(email)) {
                                            setEmailError('Please enter a valid email address');
                                            emailInputRef.current?.focus();
                                            return;
                                        }
                                        // Pass email via location state only
                                        navigate('/forgot-password', { state: { email } });
                                    }}
                                    className="no-underline hover:underline text-[#011748] font-semibold"
                                >
                                    Forgot Password?
                                </a>
                            </div>

                            {/* Google reCAPTCHA */}
                            <div className="mb-6 flex flex-col items-center recaptcha-container">
                                <div ref={recaptchaRef} className="recaptcha-wrapper"></div>
                                {recaptchaError && (
                                    <div className="text-[#e91e63] text-xs sm:text-sm mt-2 text-center">
                                        {recaptchaError}
                                    </div>
                                )}
                            </div>

                            {/* General Error Message */}
                            {error && !emailError && !passwordError && !recaptchaError && (
                                <div className="text-[#e91e63] text-xs sm:text-sm mb-4 text-center p-2.5 bg-[#ffeef0] rounded-md border border-[#e91e63]">
                                    {error}
                                </div>
                            )}

                            {/* Login Button */}
                            <button
                                type="submit"
                                className="w-full py-3 sm:py-4 border-none rounded-[10px] text-white cursor-pointer transition-all duration-300 uppercase hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base font-semibold tracking-wide"
                                style={{
                                    background: '#011748',
                                    boxShadow: isLoading ? 'none' : undefined
                                }}
                                onMouseEnter={(e) => {
                                    if (!isLoading) {
                                        e.currentTarget.style.boxShadow = '0 10px 25px rgba(233, 30, 99, 0.3)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Panel - Illustration Section (Desktop Only) */}
                <div className={`right-panel-lg hidden lg:flex flex-1 bg-gradient-to-br from-blue-50 via-gray-50 to-purple-50 p-8 lg:p-[50px] xl:p-[60px] absolute right-0 top-0 w-1/2 h-full items-center justify-center z-[1] overflow-hidden transition-opacity duration-800`}>
                    {/* Geometric background shapes */}
                    <div className="absolute w-[300px] h-[300px] rounded-full top-[-100px] right-[-100px] animate-pulse-medium" style={{ background: 'radial-gradient(circle, rgba(74, 144, 226, 0.05) 0%, transparent 70%)' }}></div>
                    <div className="absolute w-[200px] h-[200px] rounded-full bottom-[-50px] left-[-50px] animate-pulse-very-slow" style={{ background: 'radial-gradient(circle, rgba(1, 23, 72, 0.03) 0%, transparent 70%)', animationDelay: '2s' }}></div>
                    <div className="absolute w-[150px] h-[150px] rounded-full top-[40%] right-[10%] animate-pulse-fast" style={{ background: 'radial-gradient(circle, rgba(74, 144, 226, 0.04) 0%, transparent 70%)', animationDelay: '1s' }}></div>

                    {/* Floating Words */}
                    {floatingWords.map((word, index) => (
                        <div
                            key={index}
                            className={`absolute py-2.5 px-5 rounded-[20px] pointer-events-auto bg-white/40 backdrop-blur-md border-[10px] border-gray-50 uppercase transition-all duration-300 flex items-center animate-float-word hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_6px_16px_rgba(1,23,72,0.12)] ${wordPositions[index]}`}
                            style={{
                                animationDelay: word.delay,
                                fontSize: '12px',
                                fontWeight: 600,
                                letterSpacing: '0.5px',
                                color: '#011748',
                                gap: '8px',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.border = '5px solid rgb(244 171 33)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.border = '10px solid rgb(245 247 251)';
                            }}
                        >
                            <i
                                className={`fas ${word.icon}`}
                                aria-hidden="true"
                                style={{ color: '#f4ab21', fontSize: '16px' }}
                            ></i>
                            {word.text}
                        </div>
                    ))}

                    {/* Logo Wrapper */}
                    <div
                        className="relative z-10 w-[180px] h-[180px] flex items-center justify-center rounded-full bg-white/35 border-[10px] border-gray-50 backdrop-blur-[15px] shadow-[0_20px_50px_rgba(1,23,72,0.15),inset_0_0_20px_rgba(74,144,226,0.1),inset_0_0_0_1px_rgba(255,255,255,0.5)] animate-logo-float transition-all duration-300 hover:scale-105 hover:border-people-gold-light hover:shadow-[0_25px_60px_rgba(1,23,72,0.2),inset_0_0_25px_rgba(74,144,226,0.15),inset_0_0_0_1px_rgba(255,255,255,0.6)]"
                    >
                        <img
                            src={AcuforeLogo}
                            alt="Acufore Logo"
                            className="w-[130px] h-auto object-contain drop-shadow-lg"
                        />
                    </div>
                </div>
            </div>
        </AuthBackground>
    );
}
