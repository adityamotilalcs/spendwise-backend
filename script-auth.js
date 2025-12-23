// --- script-auth.js (Debug Version) ---
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
        console.log("Server Response:", data); // Check console to see if token is here

        if (response.ok) {
            // ✅ SUCCESS: Save & Redirect Immediately
            // We removed the alert() to make it faster and smoother
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user_name', username);
            
            console.log("Token saved. Redirecting to index.html...");
            window.location.href = 'index.html';
        } else {
            // ❌ FAILURE
            alert("Login Failed: " + (data.error || "Check credentials"));
        }
    } catch (error) {
        console.error('Login Error:', error);
        alert("Network Error: " + error.message);
    } finally {
        if(submitBtn) submitBtn.innerText = "Sign In";
    }
}