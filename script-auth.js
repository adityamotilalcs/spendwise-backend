// --- Authentication Script ---
// Handles Login and Registration

const API_AUTH_URL = 'https://spendwise-backend-zeta.vercel.app/api';

// --- Login Logic ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', performLogin);
}

async function performLogin(e) {
    e.preventDefault();
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = loginForm.querySelector('button');

    const username = emailInput.value.trim(); // Django uses username, not email by default
    const password = passwordInput.value;

    try {
        submitBtn.disabled = true;
        submitBtn.innerText = "Signing in...";

        const response = await fetch(`${API_AUTH_URL}/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // ✅ CRITICAL FIX: Save as 'auth_token' to match script-api.js
            localStorage.setItem('auth_token', data.token); 
            localStorage.setItem('user_name', username);
            
            // Redirect to dashboard
            window.location.href = 'index.html';
        } else {
            alert(data.error || "Login failed. Please check your credentials.");
        }
    } catch (error) {
        console.error('Login Error:', error);
        alert("Network error. Please try again.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Sign In";
    }
}

// --- Registration Logic ---
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', performRegister);
}

async function performRegister(e) {
    e.preventDefault();
    const nameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email'); // Used as username
    const passInput = document.getElementById('password');
    const confirmPassInput = document.getElementById('confirm-password');
    const submitBtn = registerForm.querySelector('button');

    if (passInput.value !== confirmPassInput.value) {
        alert("Passwords do not match!");
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.innerText = "Creating Account...";

        const payload = {
            username: emailInput.value.trim(),
            password: passInput.value,
            email: emailInput.value.trim()
        };

        const response = await fetch(`${API_AUTH_URL}/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Registration successful! Please login.");
            window.location.href = 'signin.html';
        } else {
            const data = await response.json();
            // Handle Django error format (usually an object with arrays)
            let errorMsg = "Registration failed.";
            if (data.username) errorMsg = `Username: ${data.username[0]}`;
            else if (data.password) errorMsg = `Password: ${data.password[0]}`;
            
            alert(errorMsg);
        }
    } catch (error) {
        console.error('Register Error:', error);
        alert("Network error. Please try again.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "Sign Up";
    }
}