// Professional Signup Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const emailInput = document.getElementById('signupEmail');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const captchaInput = document.getElementById('captchaInput');
    const captchaText = document.getElementById('captchaText');
    const refreshCaptchaBtn = document.getElementById('refreshCaptcha');
    const newPasswordToggle = document.getElementById('newPasswordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    const agreeTermsCheckbox = document.getElementById('agreeTerms');
    const submitBtn = document.getElementById('signupBtn');
    const problemInput = document.getElementById('problem');

    let currentCaptcha = '';

    // Generate Captcha
    function generateCaptcha() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let captcha = '';
        for (let i = 0; i < 6; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        currentCaptcha = captcha;
        captchaText.textContent = captcha;
    }

    // Initialize captcha
    generateCaptcha();

    // Refresh Captcha
    refreshCaptchaBtn.addEventListener('click', function() {
        generateCaptcha();
        captchaInput.value = '';
        hideError('error_box_captcha');
    });

    // Password Toggle Functionality
    newPasswordToggle.addEventListener('click', function() {
        const type = newPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        newPasswordInput.setAttribute('type', type);
        
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });

    confirmPasswordToggle.addEventListener('click', function() {
        const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordInput.setAttribute('type', type);
        
        const icon = this.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });

    // Form Validation
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validateNITJEmail(email) {
        return email.toLowerCase().endsWith('@nitj.ac.in');
    }

    function validatePassword(password) {
        // At least 6 characters, with at least one letter and one number
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
        return passwordRegex.test(password);
    }

    function validateCaptcha(input) {
        return input.toUpperCase() === currentCaptcha;
    }

    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    function hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    // Real-time validation
    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !validateEmail(email)) {
            showError('error_box_email', 'Please enter a valid email address');
        } else if (email && !validateNITJEmail(email)) {
            showError('error_box_email', 'Please use your NITJ email address');
        } else {
            hideError('error_box_email');
        }
    });

    newPasswordInput.addEventListener('blur', function() {
        const password = this.value.trim();
        if (password && !validatePassword(password)) {
            showError('error_box_newpass', 'Password must be at least 6 characters with letters and numbers');
        } else {
            hideError('error_box_newpass');
        }
    });

    confirmPasswordInput.addEventListener('blur', function() {
        const password = this.value.trim();
        const newPassword = newPasswordInput.value.trim();
        if (password && password !== newPassword) {
            showError('error_box_confirmpass', 'Passwords do not match');
        } else {
            hideError('error_box_confirmpass');
        }
    });

    captchaInput.addEventListener('blur', function() {
        const captcha = this.value.trim();
        if (captcha && !validateCaptcha(captcha)) {
            showError('error_box_captcha', 'Invalid captcha code');
        } else {
            hideError('error_box_captcha');
        }
    });

    // Form Submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        const captcha = captchaInput.value.trim();
        const agreeTerms = agreeTermsCheckbox.checked;
        
        // Clear previous errors
        hideError('error_box_email');
        hideError('error_box_newpass');
        hideError('error_box_confirmpass');
        hideError('error_box_captcha');
        
        // Validation
        let hasErrors = false;
        
        if (!email) {
            showError('error_box_email', 'Email is required');
            hasErrors = true;
        } else if (!validateEmail(email)) {
            showError('error_box_email', 'Please enter a valid email address');
            hasErrors = true;
        } else if (!validateNITJEmail(email)) {
            showError('error_box_email', 'Please use your NITJ email address');
            hasErrors = true;
        }
        
        if (!newPassword) {
            showError('error_box_newpass', 'Password is required');
            hasErrors = true;
        } else if (!validatePassword(newPassword)) {
            showError('error_box_newpass', 'Password must be at least 6 characters with letters and numbers');
            hasErrors = true;
        }
        
        if (!confirmPassword) {
            showError('error_box_confirmpass', 'Please confirm your password');
            hasErrors = true;
        } else if (confirmPassword !== newPassword) {
            showError('error_box_confirmpass', 'Passwords do not match');
            hasErrors = true;
        }
        
        if (!captcha) {
            showError('error_box_captcha', 'Please enter the captcha code');
            hasErrors = true;
        } else if (!validateCaptcha(captcha)) {
            showError('error_box_captcha', 'Invalid captcha code');
            hasErrors = true;
        }
        
        if (!agreeTerms) {
            alert('Please agree to the Terms & Conditions and Privacy Policy');
            hasErrors = true;
        }
        
        if (hasErrors) {
            return;
        }
        
        // Show loading state
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        submitBtn.disabled = true;
        
        // Check for server-side errors
        const problem = problemInput.value;
        if (problem) {
            if (problem.includes('email')) {
                showError('error_box_email', problem);
            } else if (problem.includes('password')) {
                showError('error_box_newpass', problem);
            } else if (problem.includes('captcha')) {
                showError('error_box_captcha', problem);
            } else {
                showError('error_box_email', problem);
            }
            
            // Reset button state
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
            return;
        }
        
        // Submit form
        setTimeout(() => {
            signupForm.submit();
        }, 500);
    });

    // Input focus effects
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });

    // Auto-focus first input
    if (emailInput && !emailInput.value) {
        emailInput.focus();
    }

    // Password strength indicator (optional enhancement)
    newPasswordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        updatePasswordStrengthIndicator(strength);
    });

    function calculatePasswordStrength(password) {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    }

    function updatePasswordStrengthIndicator(strength) {
        // This could be enhanced with a visual strength bar
        // For now, we'll just use the existing error display
        if (strength >= 4) {
            hideError('error_box_newpass');
        }
    }
}); 