// --- script-auth.js (API Version) ---
// This connects to the Django Backend running on port 8000

// const API_URL = 'http://localhost:8000/api';  
const API_URL = 'https://spendwise-backend-1-42pc.onrender.com'; 

// Handle Registration
async function performRegister(e) {
    if (e) e.preventDefault(); // Stop the form from reloading the page
    
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;

    try {
        // Send data to Django
        const response = await fetch(`${API_URL}/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username: email,  // Django uses 'username', we map email to it
                email: email, 
                password: pass 
            })
        });

        if (response.ok) {
            alert('Registration successful! Please login.');
            window.location.href = 'signin.html';
        } else {
            const data = await response.json();
            alert('Registration failed: ' + JSON.stringify(data));
        }
    } catch (err) {
        console.error('Error connecting to backend:', err);
        alert('Could not connect to the server. Is Django running?');
    }
}

// Handle Login
async function performLogin(e) {
    if (e) e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-pass').value;

    try {
        const response = await fetch(`${API_URL}/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password: pass })
        });
        
        if (response.ok) {
            const data = await response.json();
            // SAVE THE TOKEN! This is your key to the backend.
            localStorage.setItem('auth_token', data.token);
            // Optionally save the name/email for display
            localStorage.setItem('user_name', email);
            
            window.location.href = 'home.html';
        } else {
            alert('Invalid credentials');
        }
    } catch (err) {
        console.error(err);
        alert('Could not connect to the server.');
    }
}