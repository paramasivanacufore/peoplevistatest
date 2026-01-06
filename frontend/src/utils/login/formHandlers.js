// Form submission handlers for login
import { validateEmail, validatePassword, validateRequired, validateOTP } from './formUtils';
import { handleApiError, categorizeError, setFieldError, clearAllErrors } from './errorHandler';
import { loginUser, sendForgotPasswordOTP, verifyOTP, resetPassword, resendOTP } from './apiUtils';

// Login form handler
export const handleLoginSubmit = async (formData, recaptchaToken, setErrors, setLoading, navigate, authContext) => {
  console.log('🔍 Form Handler - Form data received:', formData);
  console.log('🔍 Form Handler - Remember me value:', formData.remember_me);
  setLoading(true);
  clearAllErrors(setErrors);

  try {
    // Client-side validation
    const emailError = validateRequired(formData.login, 'Email address');
    if (emailError) {
      setFieldError(setErrors, 'login', emailError);
      setLoading(false);
      return;
    }

    if (!validateEmail(formData.login)) {
      setFieldError(setErrors, 'login', 'Please enter a valid email address');
      setLoading(false);
      return;
    }

    const passwordError = validateRequired(formData.password, 'Password');
    if (passwordError) {
      setFieldError(setErrors, 'password', passwordError);
      setLoading(false);
      return;
    }

    // if (!recaptchaToken) {
    //   setFieldError(setErrors, 'general', 'Please complete the reCAPTCHA verification');
    //   setLoading(false);
    //   return;
    // }

    // API call
    const { data } = await loginUser(formData, recaptchaToken);

    // Session is stored in HTTP-only cookie by backend
    // Remember me is handled by cookie expiry time (30 days vs 24 hours)
    // User data will be stored in React state via authContext.login()
    console.log('🔍 Form Handler - Session stored in HTTP-only cookie by backend');
    console.log('🔍 Form Handler - Remember me:', formData.remember_me, '(handled by cookie expiry)');

    // Update authentication context and wait for it to complete (without permissions)
    if (authContext && authContext.login) {
      console.log('🔍 Form Handler - Calling authContext.login with remember_me:', formData.remember_me);
      // Only pass user data without permissions - permissions will be fetched on-demand
      await authContext.login(data.user, null, null, formData.remember_me);
    }
    
    // Clear browser history and navigate to dashboard
    window.history.replaceState(null, '', '/dashboard');
    navigate('/dashboard', { replace: true });

  } catch (error) {
    const errorMessage = handleApiError(error, 'Login failed. Please try again.');
    const categorizedError = categorizeError(errorMessage);
    
    if (categorizedError.type === 'general') {
      setFieldError(setErrors, 'general', categorizedError.message);
    } else {
      setFieldError(setErrors, categorizedError.type, categorizedError.message);
    }
  } finally {
    setLoading(false);
  }
};

// Forgot password handler
export const handleForgotPasswordSubmit = async (email, setErrors, setLoading, navigate) => {
  setLoading(true);
  clearAllErrors(setErrors);

  try {
    const emailError = validateRequired(email, 'Email address');
    if (emailError) {
      setFieldError(setErrors, 'login', emailError);
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setFieldError(setErrors, 'login', 'Please enter a valid email address');
      setLoading(false);
      return;
    }

    await sendForgotPasswordOTP(email);
    navigate('/forgot-password', { state: { email } });

  } catch (error) {
    const errorMessage = handleApiError(error, 'Failed to send OTP');
    const categorizedError = categorizeError(errorMessage);
    
    if (categorizedError.type === 'login') {
      setFieldError(setErrors, 'login', categorizedError.message);
    } else {
      setFieldError(setErrors, 'general', categorizedError.message);
    }
  } finally {
    setLoading(false);
  }
};

// OTP verification handler
export const handleOTPSubmit = async (email, otp, setErrors, setLoading, onNext) => {
  setLoading(true);
  clearAllErrors(setErrors);

  try {
    const otpString = otp.join('');
    const otpError = validateOTP(otpString);
    if (otpError) {
      setFieldError(setErrors, 'otp', otpError);
      setLoading(false);
      return;
    }

    // Check if it's the hardcoded test OTP
    if (otpString === '123456') {
      // Accept the hardcoded OTP without API verification
      // Add a small delay to simulate verification
      await new Promise(resolve => setTimeout(resolve, 500));
      onNext(otpString);
      return; // Important: return here to prevent any further execution
    }
    
    // Verify with the backend for actual OTP
    await verifyOTP(email, otpString);
    onNext(otpString);

  } catch (error) {
    const errorMessage = handleApiError(error, 'Invalid OTP');
    const categorizedError = categorizeError(errorMessage);
    setFieldError(setErrors, 'otp', categorizedError.message);
  } finally {
    setLoading(false);
  }
};

// Reset password handler
export const handleResetPasswordSubmit = async (email, otp, newPassword, confirmPassword, setErrors, setLoading, navigate, login) => {
  clearAllErrors(setErrors);

  try {
    // Validate passwords
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setFieldError(setErrors, 'newPassword', passwordValidation.errors[0]);
      return { success: false };
    }

    if (newPassword !== confirmPassword) {
      setFieldError(setErrors, 'confirmPassword', 'Passwords do not match');
      return { success: false };
    }

    // Check if using the hardcoded test OTP
    if (otp === '123456') {
      // For test OTP, just return success without backend call or login
      // Add a small delay to simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      // The modal will show and redirect to login page
      return { success: true, data: { message: 'Password reset successful' } };
    }
    
    // Use actual backend API for real OTP
    else {
      const { data } = await resetPassword(email, otp, newPassword);

      // User data will be stored in React state via login() function
      // No storage needed - cookies handle authentication

      // Update auth state (without permissions - fetched on-demand)
      login(data, null, null);
      
      // Return success instead of navigating directly
      return { success: true, data };
    }

  } catch (error) {
    const errorMessage = handleApiError(error, 'Failed to reset password');
    const categorizedError = categorizeError(errorMessage);
    setFieldError(setErrors, 'newPassword', categorizedError.message);
    return { success: false };
  }
};

// Resend OTP handler
export const handleResendOTP = async (email, setErrors, setResendLoading, setCountdown) => {
  setResendLoading(true);
  clearAllErrors(setErrors);

  try {
    await resendOTP(email);
    setCountdown(600); // Reset countdown to 10 minutes to match backend OTP_EXPIRE_MINUTES
  } catch (error) {
    const errorMessage = handleApiError(error, 'Failed to resend OTP');
    setFieldError(setErrors, 'resend', errorMessage);
  } finally {
    setResendLoading(false);
  }
};
