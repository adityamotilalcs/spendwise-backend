// --- script-auth.js ---
const API_AUTH_URL = 'https://spendwise-backend-zeta.vercel.app/api';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Find the Form
    const loginForm = document.getElementById('form-login'); 
    
    if (loginForm) {
        // Remove HTML-side interference
        loginForm.removeAttribute('onsubmit'); 
        
        // Attach the listener safely
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // STOP page reload
            console.log("Form submitted via JS listener");
            await performLogin();
        });
    } else {
        console.error("ERROR: Could not find form with id 'form-login'");
    }
});

async function performLogin() {
    const submitBtn = document.querySelector('.submit-btn');
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-pass');

    // Safety check
    if (!emailInput || !passInput) {
        console.error("Inputs not found!");
        return;
    }

    const username = emailInput.value.trim();
    const password = passInput.value;

    try {
        if(submitBtn) submitBtn.innerText = "Connecting...";

        const response = await fetch(`${API_AUTH_URL}/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log("Server Response:", data); // Expand this in console to check!

        if (response.ok) {
            // ✅ FIX: Check for 'token' OR 'key' OR 'access'
            const serverToken = data.token || data.key || data.access;

            if (serverToken) {
                // Save exactly as 'auth_token' for the dashboard script
                localStorage.setItem('auth_token', serverToken);
                localStorage.setItem('user_name', username);
                
                console.log("Token found:", serverToken);
                window.location.href = 'index.html';
            } else {
                alert("Login successful, but token is missing from server response!");
                console.error("Missing token in data:", data);
            }
        } else {
            // ❌ Handle Login Failure (Wrong password, etc.)
            alert("Login Failed: " + (data.error || "Check your email/password"));
        }
    } catch (error) {
        console.error('Login Error:', error);
        alert("Network Error: " + error.message);
    } finally {
        if(submitBtn) submitBtn.innerText = "Sign In";
    }
}