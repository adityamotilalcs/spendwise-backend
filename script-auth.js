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

    // Debug: Check if inputs exist
    if (!emailInput || !passInput) {
        alert("Error: Could not find email or password inputs in HTML.");
        return;
    }

    const username = emailInput.value.trim();
    const password = passInput.value;

    try {
        if(submitBtn) submitBtn.innerText = "Connecting...";

        console.log("Sending request to:", `${API_AUTH_URL}/login/`);
        
        const response = await fetch(`${API_AUTH_URL}/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log("Server Response:", data);

        if (response.ok) {
            // ✅ SUCCESS
            if (data.token) {
                // Save it
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_name', username);
                
                // Verify it saved
                if (localStorage.getItem('auth_token')) {
                    alert("Login Successful! Token saved. Redirecting...");
                    window.location.href = 'index.html';
                } else {
                    alert("Error: Browser refused to save LocalStorage.");
                }
            } else {
                alert("Login worked, but server sent no token: " + JSON.stringify(data));
            }
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