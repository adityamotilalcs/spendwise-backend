// --- Variables ---
let transactions = JSON.parse(localStorage.getItem('spendwise_transactions')) || [];
let currentUser = JSON.parse(localStorage.getItem('spendwise_user'));
let theme = localStorage.getItem('spendwise_theme') || 'light';

const tips = [
    "Use the 50/30/20 rule: 50% Needs, 30% Wants, 20% Savings.",
    "Avoid impulse buying: Wait 24 hours before big purchases.",
    "Track small expenses—they add up quickly!",
    "Cancel unused subscriptions to save ₹500+ a month."
];

// Global functions for toggle links (can be called directly from HTML)
function toggleToRegister(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    console.log("Switching to Register");
    document.getElementById('signin-container').classList.add('hidden');
    document.getElementById('register-container').classList.remove('hidden');
    return false;
}

function toggleToSignIn(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    console.log("Switching to Sign In");
    document.getElementById('register-container').classList.add('hidden');
    document.getElementById('signin-container').classList.remove('hidden');
    return false;
}

// --- Initialization ---
window.addEventListener('load', function() {
    try { 
        lucide.createIcons(); 
    } catch(e) {
        console.warn('Lucide icons not loaded');
    }

    applyTheme(theme);
    rotateTip();
    
    console.log("Initializing event listeners...");
    
    // 1. Setup Toggle Links with event listeners (backup)
    const showRegisterBtn = document.getElementById('show-register');
    const showSignInBtn = document.getElementById('show-signin');
    
    if (showRegisterBtn) {
        console.log("Register button found, adding listener");
        showRegisterBtn.addEventListener('click', toggleToRegister);
    } else {
        console.warn("Register button NOT found");
    }
    
    if (showSignInBtn) {
        console.log("Sign In button found, adding listener");
        showSignInBtn.addEventListener('click', toggleToSignIn);
    } else {
        console.warn("Sign In button NOT found");
    }

    // 2. Setup Forms
    const loginForm = document.getElementById('form-login');
    const registerForm = document.getElementById('form-register');
    const addTransactionForm = document.getElementById('form-add-transaction');
    
    if (loginForm) {
        loginForm.addEventListener('submit', performLogin);
        console.log("Login form listener added");
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', performRegister);
        console.log("Register form listener added");
    }
    
    if (addTransactionForm) {
        addTransactionForm.addEventListener('submit', addTransaction);
        console.log("Add transaction form listener added");
    }

    // 3. Defaults
    const dateInput = document.getElementById('t-date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    // Ensure category visibility matches the current type initially
    const typeSelect = document.getElementById('t-type');
    if (typeSelect) {
        typeSelect.addEventListener('change', toggleCategoryInput);
        toggleCategoryInput();
    }

    // Update current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const currentDateEl = document.getElementById('current-date');
    if (currentDateEl) {
        currentDateEl.innerText = new Date().toLocaleDateString('en-IN', options);
    }

    // 4. Check Login State
    if (currentUser && currentUser.isLoggedIn) {
        showDashboard();
    } else {
        showLogin();
    }
    
    console.log("Initialization complete");
});

// --- Login / Register Logic ---
function performRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();

    if (!name || !email || !pass) {
        alert("Please fill in all fields to register.");
        return;
    }

    if (pass.length < 4) {
        alert("Password must be at least 4 characters long.");
        return;
    }

    const userData = { name, email, password: pass, isLoggedIn: true };
    localStorage.setItem('spendwise_user', JSON.stringify(userData));
    
    currentUser = userData;
    console.log("Registration successful for:", email);
    alert("Registration Successful! Welcome " + name);
    
    // Reset form
    document.getElementById('form-register').reset();
    showDashboard();
}

function performLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value.trim();

    if (!email || !pass) {
        alert("Please enter both email and password.");
        return;
    }
    
    let storedUser = JSON.parse(localStorage.getItem('spendwise_user'));

    if (storedUser && storedUser.email === email && storedUser.password === pass) {
        storedUser.isLoggedIn = true;
        localStorage.setItem('spendwise_user', JSON.stringify(storedUser));
        currentUser = storedUser;
        console.log("Login successful for:", email);
        
        // Reset form
        document.getElementById('form-login').reset();
        showDashboard();
    } else if (storedUser && storedUser.email === email) {
        alert("Incorrect Password");
    } else {
        alert("User not found. Please Register first.");
    }
}

function logout() {
    if (currentUser) {
        currentUser.isLoggedIn = false;
        localStorage.setItem('spendwise_user', JSON.stringify(currentUser));
    }
    showLogin();
}

// --- View Switching ---
function showDashboard() {
    document.body.classList.remove('login-mode');
    document.body.classList.add('app-mode');
    
    const loginSection = document.getElementById('login-section');
    const appWrapper = document.getElementById('app-wrapper');
    
    if (loginSection) {
        loginSection.classList.add('hidden');
        loginSection.classList.remove('active');
    }
    if (appWrapper) {
        appWrapper.classList.remove('hidden');
        appWrapper.classList.add('active');
    }

    // Safely set greeting, fall back to 'User' if name is missing
    const name = (currentUser && currentUser.name) ? currentUser.name : 'User';
    const greetingEl = document.getElementById('greeting');
    if (greetingEl) greetingEl.innerText = `Hello, ${name}!`;
    
    updateUI();
}

function showLogin() {
    document.body.classList.remove('app-mode');
    document.body.classList.add('login-mode');
    
    const appWrapper = document.getElementById('app-wrapper');
    const loginSection = document.getElementById('login-section');
    
    if (appWrapper) {
        appWrapper.classList.add('hidden');
        appWrapper.classList.remove('active');
    }
    if (loginSection) {
        loginSection.classList.remove('hidden');
        loginSection.classList.add('active');
    }
    
    // Clear forms
    const loginForm = document.getElementById('form-login');
    const registerForm = document.getElementById('form-register');
    const signinContainer = document.getElementById('signin-container');
    const registerContainer = document.getElementById('register-container');
    
    if (loginForm) loginForm.reset();
    if (registerForm) registerForm.reset();
    
    // Show sign-in, hide register
    if (signinContainer) signinContainer.classList.remove('hidden');
    if (registerContainer) registerContainer.classList.add('hidden');
}

// --- Transaction Logic ---
function addTransaction(e) {
    e.preventDefault();
    
    const descRaw = document.getElementById('t-desc').value;
    const desc = descRaw ? descRaw.trim() : '';
    const amount = document.getElementById('t-amount').value;
    const date = document.getElementById('t-date').value;
    const type = document.getElementById('t-type').value;

    // Description is optional. Only require amount and date.
    if (!amount || !date) {
        alert("Please fill in amount and date for the transaction.");
        return;
    }

    const category = (type === 'expense') ? document.getElementById('t-category').value : 'Income';

    const t = {
        id: Date.now(),
        desc: desc,
        amount: parseFloat(amount),
        date: date,
        type: type,
        category: category
    };

    transactions.push(t);
    localStorage.setItem('spendwise_transactions', JSON.stringify(transactions));
    updateUI();
    
    // Clear inputs
    document.getElementById('t-desc').value = '';
    document.getElementById('t-amount').value = '';
    document.getElementById('t-date').valueAsDate = new Date();
    document.getElementById('t-type').value = 'expense';
    toggleCategoryInput();
}

function toggleCategoryInput() {
    const type = document.getElementById('t-type').value;
    const catGroup = document.getElementById('category-group');
    const catSelect = document.getElementById('t-category');
    
    if (!catGroup || !catSelect) return;
    
    if (type === 'income') {
        catGroup.style.display = 'none';
        catSelect.value = 'Others';
    } else {
        catGroup.style.display = 'block';
        if (!catSelect.value) catSelect.value = 'Others';
    }
}

function deleteTransaction(id) {
    if (confirm("Delete this transaction?")) {
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem('spendwise_transactions', JSON.stringify(transactions));
        updateUI();
    }
}

function updateUI() {
    const list = document.getElementById('transaction-list');
    const bars = document.getElementById('category-bars');
    
    if (!list || !bars) return;
    
    list.innerHTML = "";
    bars.innerHTML = "";
    
    let inc = 0, exp = 0, cats = {};
    
    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sorted.forEach(t => {
        if (t.type === 'income') {
            inc += t.amount;
        } else {
            exp += t.amount;
            cats[t.category] = (cats[t.category] || 0) + t.amount;
        }
        
        const div = document.createElement('div');
        div.className = 'transaction-item';
        
        const amountColor = t.type === 'income' ? '#00b894' : '#ff7675';
        const amountSign = t.type === 'income' ? '+' : '-';
        
        div.innerHTML = `
            <div>
                <strong>${t.desc || 'No description'}</strong>
                <br>
                <small class="muted">${t.date} • ${t.category}</small>
            </div>
            <div style="text-align:right">
                <div style="font-weight:bold; color:${amountColor}">
                    ${amountSign}₹${t.amount.toFixed(2)}
                </div>
                <button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button>
            </div>
        `;
        list.appendChild(div);
    });

    if (sorted.length === 0) {
        list.innerHTML = "<p class='muted' style='text-align:center'>No transactions yet.</p>";
    }

    // Update summary cards
    document.getElementById('total-balance').innerText = `₹${(inc - exp).toFixed(2)}`;
    document.getElementById('total-income').innerText = `₹${inc.toFixed(2)}`;
    document.getElementById('total-expense').innerText = `₹${exp.toFixed(2)}`;

    // Update category breakdown
    for (let c in cats) {
        const pct = (cats[c] / exp) * 100;
        const barDiv = document.createElement('div');
        barDiv.className = 'bar-container';
        barDiv.innerHTML = `
            <div class="bar-label">
                <span>${c}</span>
                <span>₹${cats[c].toFixed(2)} (${Math.round(pct)}%)</span>
            </div>
            <div class="progress-bg">
                <div class="progress-fill" style="width:${pct}%"></div>
            </div>
        `;
        bars.appendChild(barDiv);
    }
}

function switchTab(tab) {
    const viewSections = document.querySelectorAll('.view-section');
    viewSections.forEach(e => e.classList.remove('active'));
    
    const targetView = document.getElementById(`${tab}-view`);
    if (targetView) targetView.classList.add('active');
    
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(n => n.classList.remove('active'));
    
    if (tab === 'dashboard') navItems[0].classList.add('active');
    if (tab === 'reports') navItems[1].classList.add('active');
}

function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('spendwise_theme', theme);
    applyTheme(theme);
}

function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
}

function rotateTip() {
    const el = document.getElementById('tip-text');
    if (el) {
        el.innerText = tips[Math.floor(Math.random() * tips.length)];
        setInterval(() => {
            el.innerText = tips[Math.floor(Math.random() * tips.length)];
        }, 10000);
    }
}
