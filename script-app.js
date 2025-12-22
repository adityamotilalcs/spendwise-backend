// --- App Script ---
// Handles Dashboard/Home page

// Safe storage helpers: handle browser tracking-prevention blocking localStorage
const __storageFallback_app = {};
let __storageAvailable_app = true;

function showStorageBlockedBannerApp() {
    try {
        if (window.__storageBannerDismissed) return;
        if (document.getElementById('storage-blocked-banner')) return;
        const b = document.createElement('div');
        b.id = 'storage-blocked-banner';
        b.style.position = 'fixed';
        b.style.left = '0';
        b.style.right = '0';
        b.style.top = '0';
        b.style.padding = '10px 12px';
        b.style.background = '#ffcc00';
        b.style.color = '#111';
        b.style.textAlign = 'center';
        b.style.zIndex = '9999';
        b.style.fontWeight = '600';
        b.style.display = 'flex';
        b.style.alignItems = 'center';
        b.style.justifyContent = 'space-between';

        const msg = document.createElement('div');
        msg.style.flex = '1';
        msg.style.textAlign = 'left';
        msg.innerHTML = 'Storage blocked by browser privacy settings. App will run in temporary mode.';

        const help = document.createElement('div');
        help.style.marginLeft = '12px';
        help.style.fontWeight = '400';
        help.innerHTML = '<button id="storage-help-btn-app" style="margin-right:8px;padding:6px 8px;border-radius:6px;border:1px solid rgba(0,0,0,0.08);background:white;cursor:pointer">How to fix</button>';

        const closeBtn = document.createElement('button');
        closeBtn.innerText = 'Dismiss';
        closeBtn.style.marginLeft = '12px';
        closeBtn.style.padding = '6px 10px';
        closeBtn.style.borderRadius = '6px';
        closeBtn.style.border = '1px solid rgba(0,0,0,0.08)';
        closeBtn.style.background = '#fff';
        closeBtn.style.cursor = 'pointer';

        b.appendChild(msg);
        b.appendChild(help);
        b.appendChild(closeBtn);

        document.body.appendChild(b);

        document.getElementById('storage-help-btn-app').addEventListener('click', () => {
            const detailsId = 'storage-help-details-app';
            if (document.getElementById(detailsId)) return;
            const d = document.createElement('div');
            d.id = detailsId;
            d.style.position = 'fixed';
            d.style.top = '56px';
            d.style.right = '16px';
            d.style.width = '360px';
            d.style.background = '#fff';
            d.style.color = '#111';
            d.style.border = '1px solid rgba(0,0,0,0.08)';
            d.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
            d.style.padding = '12px';
            d.style.zIndex = '10000';
            d.innerHTML = '<strong>Quick fixes</strong><ul style="margin-top:8px"><li>Serve the project over <code>http://localhost</code> (Live Server or Python). Example:<pre style="background:#f6f6f6;padding:6px;border-radius:4px;margin-top:6px">cd "<em>path/to/project</em>"\npython3 -m http.server 5500</pre></li><li>Allow site storage in browser Privacy settings or disable Tracking prevention for the site.</li></ul>';
            const closeD = document.createElement('button');
            closeD.innerText = 'Close';
            closeD.style.marginTop = '8px';
            closeD.style.padding = '6px 8px';
            closeD.style.cursor = 'pointer';
            d.appendChild(closeD);
            document.body.appendChild(d);
            closeD.addEventListener('click', () => d.remove());
        });

        closeBtn.addEventListener('click', () => {
            window.__storageBannerDismissed = true;
            b.remove();
        });
    } catch (e) { console.warn('Could not show storage banner', e); }
}

function safeSetItemApp(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { __storageAvailable_app = false; __storageFallback_app[key] = value; showStorageBlockedBannerApp(); return false; }
}
function safeGetItemApp(key) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
    catch (e) { __storageAvailable_app = false; showStorageBlockedBannerApp(); return (__storageFallback_app.hasOwnProperty(key) ? __storageFallback_app[key] : null); }
}
function safeRemoveItemApp(key) {
    try { localStorage.removeItem(key); return true; }
    catch (e) { __storageAvailable_app = false; delete __storageFallback_app[key]; showStorageBlockedBannerApp(); return false; }
}

let transactions = safeGetItemApp('spendwise_transactions') || [];
let currentUser = safeGetItemApp('spendwise_user');
let theme = (safeGetItemApp('spendwise_theme') || 'light');

const tips = [
    "Use the 50/30/20 rule: 50% Needs, 30% Wants, 20% Savings.",
    "Avoid impulse buying: Wait 24 hours before big purchases.",
    "Track small expenses—they add up quickly!",
    "Cancel unused subscriptions to save ₹500+ a month."
];

// --- Initialization ---
window.addEventListener('load', function() {
    console.log("Home page loaded");
    
    // Redirect to signin if not logged in
    if (!currentUser || !currentUser.isLoggedIn) {
        window.location.href = 'signin.html';
        return;
    }

    try { 
        lucide.createIcons(); 
    } catch(e) {
        console.warn('Lucide icons not loaded');
    }

    applyTheme(theme);
    rotateTip();
    
    // Setup Forms
    const addTransactionForm = document.getElementById('form-add-transaction');
    
    if (addTransactionForm) {
        addTransactionForm.addEventListener('submit', addTransaction);
        console.log("Add transaction form listener added");
    }

    // Defaults
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

    // Set user greeting
    const name = (currentUser && currentUser.name) ? currentUser.name : 'User';
    const greetingEl = document.getElementById('greeting');
    if (greetingEl) greetingEl.innerText = `Hello, ${name}!`;
    
    // Load UI
    updateUI();
    
    console.log("Home page initialization complete");
});

// --- Logout ---
function logout() {
    if (currentUser) {
        currentUser.isLoggedIn = false;
        safeSetItemApp('spendwise_user', currentUser);
    }
    console.log("Logged out successfully");
    window.location.href = 'signin.html';
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
    safeSetItemApp('spendwise_transactions', transactions);
    updateUI();
    
    // Clear inputs
    document.getElementById('t-desc').value = '';
    document.getElementById('t-amount').value = '';
    document.getElementById('t-date').valueAsDate = new Date();
    document.getElementById('t-type').value = 'expense';
    toggleCategoryInput();
    
    alert("Transaction added successfully!");
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
    if (!confirm("Delete this transaction?")) return;

    // Find the transaction DOM element and animate it out before removing from storage
    const el = document.querySelector(`.transaction-item[data-id="${id}"]`);
    const removeFromStore = () => {
        transactions = transactions.filter(t => t.id !== id);
        safeSetItemApp('spendwise_transactions', transactions);
        updateUI();
    };

    if (el) {
        // add exit class to trigger CSS transition
        el.classList.add('exit');

        // Try to catch transitionend for a clean removal
        let handled = false;
        const onEnd = (ev) => {
            if (handled) return;
            handled = true;
            el.removeEventListener('transitionend', onEnd);
            removeFromStore();
        };
        el.addEventListener('transitionend', onEnd);

        // Fallback: if transitionend doesn't fire, remove after 350ms
        setTimeout(() => { if (!handled) removeFromStore(); }, 400);
    } else {
        // If element not found in DOM, just remove immediately
        removeFromStore();
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
        // add entry animation class
        div.className = 'transaction-item enter';
        // attach identifier for animated deletion
        div.dataset.id = t.id;
        
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

    // Update summary cards with animated counters
    animateNumber(document.getElementById('total-balance'), (inc - exp));
    animateNumber(document.getElementById('total-income'), inc);
    animateNumber(document.getElementById('total-expense'), exp);

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
    safeSetItemApp('spendwise_theme', theme);
    applyTheme(theme);
}

function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    // Update theme button icon and label to show current mode
    try {
        const btn = document.querySelector('.btn-theme');
        if (!btn) return;
        // Ensure we have a span.theme-icon we can set text on (lucide or other libs may replace nodes)
        let icon = btn.querySelector('.theme-icon');
        let label = btn.querySelector('.theme-label');

        // If icon doesn't exist or was replaced by an SVG, recreate it as a span
        if (!icon || icon.tagName.toLowerCase() !== 'span') {
            const newIcon = document.createElement('span');
            newIcon.className = 'theme-icon';
            if (icon) {
                try { icon.replaceWith(newIcon); } catch(e) { btn.insertBefore(newIcon, label); }
            } else {
                btn.insertBefore(newIcon, label);
            }
            icon = newIcon;
        }

        if (!label) {
            label = document.createElement('span');
            label.className = 'theme-label';
            btn.appendChild(label);
        }

        // Use inline SVG icons (fill=currentColor) for consistent rendering across platforms
        const sunSVG = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="12" cy="12" r="4"></circle>
                <g stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="M4.93 4.93l1.41 1.41" />
                    <path d="M17.66 17.66l1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="M4.93 19.07l1.41-1.41" />
                    <path d="M17.66 6.34l1.41-1.41" />
                </g>
            </svg>`;

        const moonSVG = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path fill="currentColor" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>`;

        if (t === 'dark') {
            icon.innerHTML = moonSVG;
            label.textContent = 'Dark mode';
            btn.setAttribute('aria-pressed', 'true');
            btn.setAttribute('aria-label', 'Dark mode');
        } else {
            icon.innerHTML = sunSVG;
            label.textContent = 'Light mode';
            btn.setAttribute('aria-pressed', 'false');
            btn.setAttribute('aria-label', 'Light mode');
        }

        // animate icon change
        icon.classList.remove('icon-change');
        // force reflow to restart animation
        void icon.offsetWidth;
        icon.classList.add('icon-change');
        setTimeout(() => icon.classList.remove('icon-change'), 500);
    } catch (e) { console.warn(e); }
}

// Animate numeric counters for stats. element should be a DOM node and value is number.
function animateNumber(element, value) {
    if (!element) return;
    const isBalance = element.id === 'total-balance';
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
        const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOut
        const current = startNum + (endNum - startNum) * eased;
        element.innerText = fmt(current);
        if (t < 1) requestAnimationFrame(step);
        else element.innerText = fmt(endNum);
    }
    requestAnimationFrame(step);
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
