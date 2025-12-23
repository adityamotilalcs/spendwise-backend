// --- App Script (Connected to Backend) ---
// Handles Dashboard/Home page

// ✅ BACKEND URL (Points to your live server)
const API_URL = 'https://spendwise-backend-zeta.vercel.app/api';

let transactions = [];
let currentUser = JSON.parse(localStorage.getItem('spendwise_user'));
let theme = localStorage.getItem('spendwise_theme') || 'light';

// --- Initialization ---
window.addEventListener('load', function() {
    console.log("Home page loaded");
    
    // Redirect if no token
    const token = localStorage.getItem('userToken');
    if (!token) {
        window.location.href = 'signin.html';
        return;
    }

    try { lucide.createIcons(); } catch(e) {}

    applyTheme(theme);
    rotateTip();
    
    // Setup Forms
    const addTransactionForm = document.getElementById('form-add-transaction');
    if (addTransactionForm) {
        addTransactionForm.addEventListener('submit', addTransaction);
    }

    // Load Data from Backend
    fetchTransactions();

    // UI Defaults
    const dateInput = document.getElementById('t-date');
    if (dateInput) dateInput.valueAsDate = new Date();

    const typeSelect = document.getElementById('t-type');
    if (typeSelect) {
        typeSelect.addEventListener('change', toggleCategoryInput);
        toggleCategoryInput();
    }

    // Set Greeting
    const greetingEl = document.getElementById('greeting');
    if (greetingEl && currentUser) greetingEl.innerText = `Hello, ${currentUser.username || 'User'}!`;
});

// --- 1. GET TRANSACTIONS (Read from Server) ---
async function fetchTransactions() {
    const token = localStorage.getItem('userToken');
    const list = document.getElementById('transaction-list');
    
    // Show loading state
    if(list) list.innerHTML = '<p style="text-align:center;">Loading transactions...</p>';

    try {
        const response = await fetch(`${API_URL}/transactions/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            }
        });

        if (response.status === 401) {
            logout(); // Token expired
            return;
        }

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        transactions = data; // Update global variable
        updateUI(); // Render the list

    } catch (error) {
        console.error("Error loading transactions:", error);
        if(list) list.innerHTML = '<p style="text-align:center; color:red;">Failed to load data.</p>';
    }
}

// --- 2. ADD TRANSACTION (Send to Server) ---
async function addTransaction(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('userToken');
    const desc = document.getElementById('t-desc').value;
    const amount = document.getElementById('t-amount').value;
    const date = document.getElementById('t-date').value;
    const type = document.getElementById('t-type').value;
    const category = (type === 'expense') ? document.getElementById('t-category').value : 'Income';

    const newTxn = {
        description: desc,
        amount: parseFloat(amount),
        date: date,
        transaction_type: type, // Backend expects 'transaction_type'
        category: category
    };

    try {
        const response = await fetch(`${API_URL}/transactions/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify(newTxn)
        });

        if (response.ok) {
            alert("Transaction added!");
            // Refresh list from server to get the new ID and data
            fetchTransactions(); 
            
            // Clear form
            document.getElementById('t-desc').value = '';
            document.getElementById('t-amount').value = '';
        } else {
            const errData = await response.json();
            alert("Error: " + JSON.stringify(errData));
        }

    } catch (error) {
        console.error("Error adding transaction:", error);
        alert("Failed to connect to server.");
    }
}

// --- 3. DELETE TRANSACTION (Remove from Server) ---
async function deleteTransaction(id) {
    if (!confirm("Delete this transaction?")) return;
    
    const token = localStorage.getItem('userToken');

    try {
        const response = await fetch(`${API_URL}/transactions/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${token}`
            }
        });

        if (response.ok) {
            // Remove from UI immediately for speed
            transactions = transactions.filter(t => t.id !== id);
            updateUI();
        } else {
            alert("Failed to delete.");
        }

    } catch (error) {
        console.error("Delete error:", error);
    }
}

// --- UI Helper Functions (Same as before, just slight tweaks) ---

function updateUI() {
    const list = document.getElementById('transaction-list');
    const bars = document.getElementById('category-bars');
    
    if (!list || !bars) return;
    
    list.innerHTML = "";
    bars.innerHTML = "";
    
    let inc = 0, exp = 0, cats = {};
    
    // Sort by date (newest first)
    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sorted.forEach(t => {
        // Backend uses 'transaction_type', handle that
        const type = t.transaction_type || t.type; 

        if (type === 'income') {
            inc += parseFloat(t.amount);
        } else {
            exp += parseFloat(t.amount);
            cats[t.category] = (cats[t.category] || 0) + parseFloat(t.amount);
        }
        
        const div = document.createElement('div');
        div.className = 'transaction-item';
        div.dataset.id = t.id;
        
        const amountColor = type === 'income' ? '#00b894' : '#ff7675';
        const amountSign = type === 'income' ? '+' : '-';
        
        div.innerHTML = `
            <div>
                <strong>${t.description || t.desc || 'No description'}</strong>
                <br>
                <small class="muted">${t.date} • ${t.category}</small>
            </div>
            <div style="text-align:right">
                <div style="font-weight:bold; color:${amountColor}">
                    ${amountSign}₹${parseFloat(t.amount).toFixed(2)}
                </div>
                <button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button>
            </div>
        `;
        list.appendChild(div);
    });

    if (sorted.length === 0) {
        list.innerHTML = "<p class='muted' style='text-align:center'>No transactions yet.</p>";
    }

    // Update Totals
    document.getElementById('total-balance').innerText = `₹${(inc - exp).toFixed(2)}`;
    document.getElementById('total-income').innerText = `₹${inc.toFixed(2)}`;
    document.getElementById('total-expense').innerText = `₹${exp.toFixed(2)}`;

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
    localStorage.removeItem('userToken');
    localStorage.removeItem('spendwise_user');
    window.location.href = 'signin.html';
}

function toggleCategoryInput() {
    const type = document.getElementById('t-type').value;
    const catGroup = document.getElementById('category-group');
    if (catGroup) {
        catGroup.style.display = (type === 'income') ? 'none' : 'block';
    }
}

// --- Theme & Tips (Keep these as they are) ---
function applyTheme(t) { document.documentElement.setAttribute('data-theme', t); }
function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('spendwise_theme', theme);
    applyTheme(theme);
}
const tips = ["Track small expenses!", "Use the 50/30/20 rule.", "Avoid impulse buys."];
function rotateTip() {
    const el = document.getElementById('tip-text');
    if(el) el.innerText = tips[Math.floor(Math.random() * tips.length)];
}