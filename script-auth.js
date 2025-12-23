// --- Authentication Script ---
const API_AUTH_URL = 'https://spendwise-backend-zeta.vercel.app/api';

// Wait for DOM to load so we find elements correctly
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Setup Login Form
    const loginForm = document.getElementById('form-login'); // ✅ Matches your HTML ID
    if (loginForm) {
        // Remove the inline onsubmit to prevent conflicts
        loginForm.removeAttribute('onsubmit'); 
        loginForm.addEventListener('submit', performLogin);
    }

    // 2. Setup Register Form (Assuming standard IDs for register page)
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', performRegister);
    }
});

// --- Login Function ---
async function performLogin(e) {
    e.preventDefault(); // Stop page reload

    const submitBtn = document.querySelector('.submit-btn');
    const emailInput = document.getElementById('login-email'); // ✅ Matches your HTML ID
    const passInput = document.getElementById('login-pass');   // ✅ Matches your HTML ID

    const username = emailInput.value.trim();
    const password = passInput.value;

    try {
        if(submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = "Signing in...";
        }

        const response = await fetch(`${API_AUTH_URL}/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // ✅ Save token with the correct name for the dashboard to find
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_name', username);
            window.location.href = 'index.html';
        } else {
            alert(data.error || "Login failed. Check your credentials.");
        }
    } catch (error) {
        console.error('Login Error:', error);
        alert("Network error. Please try again.");
    } finally {
        if(submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Sign In";
        }
    }
}

// --- Register Function ---
async function performRegister(e) {
    e.preventDefault();
    // ... (Your register logic here, ensure IDs match register.html)
}