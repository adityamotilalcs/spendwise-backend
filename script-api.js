// --- App Script (API Version) ---
// Handles Dashboard/Home page communicating with Django Backend

const API_BASE_URL = 'spendwise-backend-git-main-adityamotilalcs-projects.vercel.app/api';
let theme = localStorage.getItem('spendwise_theme') || 'light';

// Helper: Get Token
function getAuthToken() {
    return localStorage.getItem('auth_token');
}

// --- Initialization ---
window.addEventListener('load', function() {
    console.log("Home page loaded (API Mode)");
    
    // 1. Auth Check: Redirect to signin if no token found
    const token = getAuthToken();
    if (!token) {
        window.location.href = 'signin.html';
        return;
    }

    try { lucide.createIcons(); } catch(e) { console.warn('Lucide icons not loaded'); }

    // 2. Setup UI
    applyTheme(theme);
    rotateTip();
    setupForms();
    
    // 3. Set User Name (Optional: Fetch this from an API endpoint '/api/user/' if you expand backend)
    // For now, we use the stored name or default
    const storedName = localStorage.getItem('user_name');
    const greetingEl = document.getElementById('greeting');
    if (greetingEl) greetingEl.innerText = `Hello, ${storedName || 'User'}!`;

    // 4. Initial Data Load
    fetchTransactions();
});

function setupForms() {
    // Transaction Form
    const addTransactionForm = document.getElementById('form-add-transaction');
    if (addTransactionForm) {
        addTransactionForm.addEventListener('submit', addTransaction);
    }

    // Date Default
    const dateInput = document.getElementById('t-date');
    if (dateInput) dateInput.valueAsDate = new Date();

    // Category Toggle
    const typeSelect = document.getElementById('t-type');
    if (typeSelect) {
        typeSelect.addEventListener('change', toggleCategoryInput);
        toggleCategoryInput();
    }

    // Current Date Display
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const currentDateEl = document.getElementById('current-date');
    if (currentDateEl) {
        currentDateEl.innerText = new Date().toLocaleDateString('en-IN', options);
    }
}

// --- API Interactions ---

// 1. GET Transactions
async function fetchTransactions() {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateUI(data);
        } else if (response.status === 401) {
            // Token expired or invalid
            logout();
        } else {
            console.error('Failed to fetch transactions');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 2. POST Transaction
async function addTransaction(e) {
    e.preventDefault();
    
    const desc = document.getElementById('t-desc').value.trim();
    const amount = document.getElementById('t-amount').value;
    const date = document.getElementById('t-date').value;
    const type = document.getElementById('t-type').value; // 'expense' or 'income'

    if (!amount || !date) {
        alert("Please fill in amount and date.");
        return;
    }

    const category = (type === 'expense') ? document.getElementById('t-category').value : 'Income';

    // Construct payload matching Django Serializer fields
    const payload = {
        description: desc,
        amount: parseFloat(amount),
        date: date,
        transaction_type: type, 
        category: category
    };

    try {
        const response = await fetch(`${API_BASE_URL}/transactions/`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${getAuthToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            // Reset Form
            document.getElementById('t-desc').value = '';
            document.getElementById('t-amount').value = '';
            document.getElementById('t-date').valueAsDate = new Date();
            document.getElementById('t-type').value = 'expense';
            toggleCategoryInput();

            alert("Transaction added!");
            fetchTransactions(); // Refresh list
        } else {
            const err = await response.json();
            alert("Error adding transaction: " + JSON.stringify(err));
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// 3. DELETE Transaction
async function deleteTransaction(id) {
    if (!confirm("Delete this transaction?")) return;

    // UI Optimistic update (remove immediately for smoothness)
    const el = document.querySelector(`.transaction-item[data-id="${id}"]`);
    if (el) el.style.opacity = '0.5';

    try {
        const response = await fetch(`${API_BASE_URL}/transactions/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${getAuthToken()}`
            }
        });

        if (response.ok) {
            fetchTransactions();
        } else {
            alert("Failed to delete transaction.");
            if (el) el.style.opacity = '1';
        }
    } catch (error) {
        console.error('Error:', error);
        if (el) el.style.opacity = '1';
    }
}

// --- UI Logic (Preserved from original) ---

function updateUI(transactions) {
    const list = document.getElementById('transaction-list');
    const bars = document.getElementById('category-bars');
    
    if (!list || !bars) return;
    
    list.innerHTML = "";
    bars.innerHTML = "";
    
    let inc = 0, exp = 0, cats = {};
    
    // Django returns date as YYYY-MM-DD string, sort by date desc
    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sorted.forEach(t => {
        // Map API fields to UI variables
        // API: transaction_type | UI logic: type
        // API: description | UI logic: desc
        const tType = t.transaction_type; 
        const tAmt = parseFloat(t.amount);

        if (tType === 'income') {
            inc += tAmt;
        } else {
            exp += tAmt;
            cats[t.category] = (cats[t.category] || 0) + tAmt;
        }
        
        const div = document.createElement('div');
        div.className = 'transaction-item enter';
        div.dataset.id = t.id;
        
        const amountColor = tType === 'income' ? '#00b894' : '#ff7675';
        const amountSign = tType === 'income' ? '+' : '-';
        
        div.innerHTML = `
            <div>
                <strong>${t.description || 'No description'}</strong>
                <br>
                <small class="muted">${t.date} • ${t.category}</small>
            </div>
            <div style="text-align:right">
                <div style="font-weight:bold; color:${amountColor}">
                    ${amountSign}₹${tAmt.toFixed(2)}
                </div>
                <button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button>
            </div>
        `;
        list.appendChild(div);
    });

    if (sorted.length === 0) {
        list.innerHTML = "<p class='muted' style='text-align:center'>No transactions found.</p>";
    }

    // Update Stats
    animateNumber(document.getElementById('total-balance'), (inc - exp));
    animateNumber(document.getElementById('total-income'), inc);
    animateNumber(document.getElementById('total-expense'), exp);

    // Update Bars
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

function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_name');
    window.location.href = 'signin.html';
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
    }
}

function animateNumber(element, value) {
    if (!element) return;
    const startText = element.innerText || '';
    const startNum = parseFloat(startText.replace(/[₹, ]+/g, '')) || 0;
    const endNum = parseFloat(value) || 0;
    const duration = 600;
    const startTime = performance.now();

    function fmt(n) {
        const parts = n.toFixed(2).split('.');
        return '₹' + parts[0] + '.' + parts[1];
    }

    function step(now) {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; 
        const current = startNum + (endNum - startNum) * eased;
        element.innerText = fmt(current);
        if (t < 1) requestAnimationFrame(step);
        else element.innerText = fmt(endNum);
    }
    requestAnimationFrame(step);
}

function switchTab(tab) {
    document.querySelectorAll('.view-section').forEach(e => e.classList.remove('active'));
    const target = document.getElementById(`${tab}-view`);
    if (target) target.classList.add('active');
    
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(n => n.classList.remove('active'));
    
    // Hardcoded check based on original HTML structure
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
    // Button icon update logic...
    const btn = document.querySelector('.btn-theme');
    if (btn) {
        const icon = btn.querySelector('.theme-icon');
        const label = btn.querySelector('.theme-label');
        if (icon && label) {
            icon.textContent = t === 'dark' ? '🌙' : '☀️';
            label.textContent = t === 'dark' ? 'Dark Mode' : 'Light Mode';
        }
    }
}

const tips = [
    "Use the 50/30/20 rule: 50% Needs, 30% Wants, 20% Savings.",
    "Avoid impulse buying: Wait 24 hours before big purchases.",
    "Track small expenses—they add up quickly!",
    "Cancel unused subscriptions to save ₹500+ a month."
];

function rotateTip() {
    const el = document.getElementById('tip-text');
    if (el) {
        el.innerText = tips[Math.floor(Math.random() * tips.length)];
        setInterval(() => {
            el.innerText = tips[Math.floor(Math.random() * tips.length)];
        }, 10000);
    }
}