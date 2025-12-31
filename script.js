// Global state
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let notes = JSON.parse(localStorage.getItem('expenseNotes')) || [];
let currentNoteId = null;
let catChart = null;
let trendChart = null;

// View toggling
function setView(isAuthed) {
  const appRoot = document.getElementById('appRoot');
  const auth = document.getElementById('authContainer');
  if (!appRoot || !auth) return;
  if (isAuthed) {
    auth.style.display = 'none';
    appRoot.style.display = '';
    updateDashboard();
    updateEntriesList();
    renderNotes();
    hydrateProfileSidebar();
    setTodayOnDateInput();
  } else {
    auth.style.display = 'flex';
    appRoot.style.display = 'none';
  }
}

function hydrateProfileSidebar() {
  const p = JSON.parse(localStorage.getItem('userProfile')) || {};
  const nameEl = document.getElementById('sidebarName');
  const ageEl = document.getElementById('sidebarAge');
  if (nameEl) nameEl.textContent = p.name || 'Guest';
  if (ageEl) ageEl.textContent = p.age ? 'Age: ' + p.age : 'Age: --';
}

function setTodayOnDateInput() {
  const dateInput = document.getElementById('date');
  if (dateInput) dateInput.valueAsDate = new Date();
}

// Navigation
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
  document.querySelectorAll('.sidebar nav a').forEach((a) => a.classList.remove('active'));
  const nav = document.getElementById('nav-' + id);
  if (nav) nav.classList.add('active');
  const toggle = document.getElementById('sidebar-toggle');
  if (toggle) toggle.checked = false;
}

function scrollReports(dir) {
  const grid = document.getElementById('reportGrid');
  if (!grid) return;
  const scrollAmount = grid.clientWidth;
  grid.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
}

// Dashboard
function updateDashboard() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const dailyTotal = expenses.filter((e) => e.date === todayStr).reduce((sum, e) => sum + e.amount, 0);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const weeklyTotal = expenses.filter((e) => new Date(e.date) >= startOfWeek).reduce((sum, e) => sum + e.amount, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyTotal = expenses.filter((e) => new Date(e.date) >= startOfMonth).reduce((sum, e) => sum + e.amount, 0);

  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const yearlyTotal = expenses.filter((e) => new Date(e.date) >= startOfYear).reduce((sum, e) => sum + e.amount, 0);

  const limDaily = parseFloat(localStorage.getItem('dailyLimit')) || 500;
  const limMonthly = parseFloat(localStorage.getItem('monthlyLimit')) || 20000;
  const limYearly = parseFloat(localStorage.getItem('yearlyLimit')) || limMonthly * 12;
  const limWeekly = parseFloat(localStorage.getItem('weeklyLimit')) || limMonthly / 4;
  const savingsTarget = parseFloat(localStorage.getItem('savingsTarget')) || 10000;

  updateCard('card-daily', dailyTotal, limDaily);
  updateCard('card-weekly', weeklyTotal, limWeekly);
  updateCard('card-monthly', monthlyTotal, limMonthly);
  updateCard('card-yearly', yearlyTotal, limYearly);

  const cats = {};
  expenses.forEach((e) => (cats[e.category] = (cats[e.category] || 0) + e.amount));
  const topCat = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
  const topCatName = document.getElementById('topCatName');
  const topCatAmount = document.getElementById('topCatAmount');
  if (topCatName) topCatName.textContent = topCat ? topCat[0] : '-';
  if (topCatAmount) topCatAmount.textContent = topCat ? `₹${topCat[1]}` : '₹0';

  const transCount = document.getElementById('transCount');
  if (transCount) transCount.textContent = expenses.length;

  const savings = Math.max(0, limMonthly - monthlyTotal);
  const savingsAmount = document.getElementById('savingsAmount');
  const savingsTargetEl = document.getElementById('savingsTarget');
  if (savingsAmount) savingsAmount.textContent = `₹${savings}`;
  if (savingsTargetEl) savingsTargetEl.textContent = `Target: ₹${formatNumber(savingsTarget)}`;

  const recent = expenses.slice(-4).reverse();
  const list = document.getElementById('recentList');
  if (list) {
    if (recent.length) {
      list.innerHTML = recent
        .map(
          (e) => `
        <li style="display:flex; justify-content:space-between; padding:8px; background:var(--bg-800); border-radius:4px;">
          <span>${e.category}</span>
          <span style="color:var(--text)">₹${e.amount}</span>
        </li>`
        )
        .join('');
    } else {
      list.innerHTML = '<li>No transactions</li>';
    }
  }

  updateReports();
}

function updateCard(id, amount, limit) {
  const el = document.getElementById(id);
  if (!el) return;
  el.querySelector('h2').textContent = `${amount}`;
  el.querySelector('small').textContent = `Limit ${formatNumber(limit)}`;
  const fraction = el.querySelector('.ring-fraction');
  if (fraction) fraction.textContent = `${formatNumber(amount)}/${formatNumber(limit)}`;

  const percent = Math.min(100, (amount / limit) * 100);
  el.querySelector('.ring').style.setProperty('--percent', `${percent}%`);
  el.querySelector('.ring-percent').textContent = `${Math.round(percent)}%`;
}

function formatNumber(num) {
  if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return Math.round(num);
}

// Add expense
function bindExpenseForm() {
  const form = document.getElementById('expenseForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const desc = document.getElementById('description').value;
    const date = document.getElementById('date').value;

    expenses.push({ id: Date.now(), amount, category, paymentMethod, description: desc, date });
    localStorage.setItem('expenses', JSON.stringify(expenses));

    alert('Expense Added');
    form.reset();
    setTodayOnDateInput();
    updateDashboard();
    updateEntriesList();
  });
}

function updateEntriesList() {
  const list = document.getElementById('entriesList');
  if (!list) return;
  const recent = expenses.slice(-5).reverse();
  if (!recent.length) {
    list.innerHTML = '<p style="color:var(--muted); text-align:center;">No expenses yet. Add one!</p>';
    return;
  }
  list.innerHTML = recent
    .map(
      (e) => `
      <div style="display:flex; justify-content:space-between; padding:12px; background:var(--bg-800); border-radius:8px;">
        <div>
          <div style="font-weight:bold">${e.category} <span style="font-size:10px; background:var(--bg-900); padding:2px 6px; border-radius:4px; margin-left:5px; color:var(--muted)">${e.paymentMethod || 'Cash'}</span></div>
          <div style="font-size:12px; color:var(--muted)">${e.description}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:bold">₹${e.amount}</div>
          <div style="font-size:12px; color:var(--muted)">${e.date}</div>
        </div>
      </div>`
    )
    .join('');
}

// Reports
function updateReports() {
  const cats = {};
  expenses.forEach((e) => (cats[e.category] = (cats[e.category] || 0) + e.amount));

  const catCanvas = document.getElementById('categoryChart');
  if (catCanvas) {
    const ctxCat = catCanvas.getContext('2d');
    if (catChart) catChart.destroy();
    catChart = new Chart(ctxCat, {
      type: 'doughnut',
      data: {
        labels: Object.keys(cats),
        datasets: [
          {
            data: Object.values(cats),
            backgroundColor: ['#525252', '#737373', '#a3a3a3', '#d4d4d4', '#404040'],
            borderColor: '#000',
          },
        ],
      },
      options: { plugins: { legend: { position: 'right', labels: { color: '#fff' } } } },
    });
  }

  const daily = {};
  expenses.forEach((e) => (daily[e.date] = (daily[e.date] || 0) + e.amount));
  const sortedDates = Object.keys(daily).sort();

  const trendCanvas = document.getElementById('trendChart');
  if (trendCanvas) {
    const ctxTrend = trendCanvas.getContext('2d');
    if (trendChart) trendChart.destroy();
    trendChart = new Chart(ctxTrend, {
      type: 'line',
      data: {
        labels: sortedDates,
        datasets: [
          {
            label: 'Daily',
            data: sortedDates.map((d) => daily[d]),
            borderColor: '#737373',
            backgroundColor: 'rgba(115,115,115,0.2)',
            fill: true,
          },
        ],
      },
      options: { scales: { y: { ticks: { color: '#fff' }, grid: { color: '#333' } }, x: { ticks: { color: '#fff' } } } },
    });
  }

  const totalExpVal = expenses.reduce((a, b) => a + b.amount, 0);
  const repTotal = document.getElementById('repTotal');
  if (repTotal) repTotal.textContent = `₹${totalExpVal}`;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyTotal = expenses.filter((e) => new Date(e.date) >= startOfMonth).reduce((sum, e) => sum + e.amount, 0);
  const limMonthly = parseFloat(localStorage.getItem('monthlyLimit')) || 20000;
  const monthPercent = Math.min(100, (monthlyTotal / limMonthly) * 100);
  const repMonthStatus = document.getElementById('repMonthStatus');
  const repMonthBar = document.getElementById('repMonthBar');
  if (repMonthStatus) repMonthStatus.textContent = `${Math.round(monthPercent)}%`;
  if (repMonthBar) {
    repMonthBar.style.width = `${monthPercent}%`;
    repMonthBar.style.background = monthPercent > 90 ? 'var(--danger)' : 'var(--text)';
  }

  const totalDays = sortedDates.length || 1;
  const totalExp = totalExpVal;
  const repAvgDaily = document.getElementById('repAvgDaily');
  if (repAvgDaily) repAvgDaily.textContent = `₹${Math.round(totalExp / totalDays)}`;

  const highestDay = Object.entries(daily).sort((a, b) => b[1] - a[1])[0];
  const repHighestDay = document.getElementById('repHighestDay');
  if (repHighestDay) repHighestDay.textContent = highestDay ? `${highestDay[0]} (₹${highestDay[1]})` : '-';

  const sortedExpenses = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const repTopList = document.getElementById('repTopList');
  if (repTopList)
    repTopList.innerHTML = sortedExpenses
      .map(
        (e) => `
      <div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--border);">
        <span>${e.category}</span>
        <span style="font-weight:bold">₹${e.amount}</span>
      </div>`
      )
      .join('');

  const summaryList = document.getElementById('historySummaryList');
  const allExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  const top5 = allExpenses.slice(0, 5);
  if (summaryList) {
    if (!top5.length) {
      summaryList.innerHTML = '<p style="color:var(--muted); text-align:center;">No transactions found</p>';
    } else {
      summaryList.innerHTML = top5
        .map(
          (e) => `
        <div style="display:flex; justify-content:space-between; padding:10px; background:var(--bg-800); border-radius:6px; align-items:center;">
          <div>
            <div style="font-weight:500">${e.category}</div>
            <div style="font-size:12px; color:var(--muted)">${e.date} • ${e.paymentMethod || 'Cash'}</div>
          </div>
          <div style="font-weight:bold">₹${e.amount}</div>
        </div>`
        )
        .join('');
    }
  }

  const fullBody = document.getElementById('fullHistoryTableBody');
  if (fullBody) {
    if (!allExpenses.length) {
      fullBody.innerHTML = '<tr><td colspan="5" style="padding:15px; text-align:center; color:var(--muted)">No transactions found</td></tr>';
    } else {
      fullBody.innerHTML = allExpenses
        .map(
          (e) => `
        <tr style="border-bottom:1px solid var(--border);">
          <td style="padding:8px;">${e.date}</td>
          <td style="padding:8px;">${e.category}</td>
          <td style="padding:8px;">${e.description}</td>
          <td style="padding:8px;">${e.paymentMethod || 'Cash'}</td>
          <td style="padding:8px; text-align:right; font-weight:bold;">₹${e.amount}</td>
        </tr>`
        )
        .join('');
    }
  }
}

function openHistoryModal() {
  const modal = document.getElementById('historyModal');
  if (modal) modal.style.display = 'grid';
}
function closeHistoryModal() {
  const modal = document.getElementById('historyModal');
  if (modal) modal.style.display = 'none';
}

// Notes
function renderNotes() {
  const grid = document.getElementById('notesGrid');
  if (!grid) return;
  if (notes.length === 0) {
    grid.innerHTML = '<p style="color:var(--muted); grid-column:1/-1; text-align:center;">No notes yet.</p>';
    return;
  }
  grid.innerHTML = notes
    .map(
      (n) => `
      <div class="note-card" onclick="editNote(${n.id})">
        <h3>${n.title || 'Untitled'}</h3>
        <p>${n.content ? n.content.substring(0, 60) + '...' : 'No content'}</p>
        ${n.reminder && n.reminder.date ? `
          <div style="margin-top:8px; font-size:12px; color:var(--warning); display:flex; gap:8px; align-items:center;">
            <span>⏰ ${n.reminder.date} ${n.reminder.time || ''}</span>
            ${n.reminder.amount ? `<span style="background:var(--bg-800); padding:2px 6px; border-radius:4px;">₹${n.reminder.amount}</span>` : ''}
          </div>
        ` : ''}
      </div>`
    )
    .join('');
}

function createNewNote() {
  currentNoteId = Date.now();
  document.getElementById('noteTitle').value = '';
  document.getElementById('noteBody').value = '';
  document.getElementById('noteDate').value = '';
  document.getElementById('noteTime').value = '';
  document.getElementById('noteAmount').value = '';
  document.getElementById('noteModal').style.display = 'grid';
}

function editNote(id) {
  currentNoteId = id;
  const n = notes.find((x) => x.id === id);
  if (n) {
    document.getElementById('noteTitle').value = n.title;
    document.getElementById('noteBody').value = n.content;
    document.getElementById('noteDate').value = n.reminder ? n.reminder.date : '';
    document.getElementById('noteTime').value = n.reminder && n.reminder.time ? n.reminder.time : '';
    document.getElementById('noteAmount').value = n.reminder && n.reminder.amount ? n.reminder.amount : '';
    document.getElementById('noteModal').style.display = 'grid';
  }
}

function saveNote() {
  if (!currentNoteId) return;
  let n = notes.find((x) => x.id === currentNoteId);
  const title = document.getElementById('noteTitle').value;
  const content = document.getElementById('noteBody').value;
  const date = document.getElementById('noteDate').value;
  const time = document.getElementById('noteTime').value;
  const amount = document.getElementById('noteAmount').value;

  if (!n) {
    n = { id: currentNoteId };
    notes.push(n);
  }
  n.title = title;
  n.content = content;
  n.lastModified = new Date().toISOString();

  if (date) {
    n.reminder = { date, time, amount };
  } else {
    delete n.reminder;
  }

  localStorage.setItem('expenseNotes', JSON.stringify(notes));
  renderNotes();
  closeNoteModal();
}

function deleteNote() {
  if (confirm('Delete note?')) {
    notes = notes.filter((n) => n.id !== currentNoteId);
    localStorage.setItem('expenseNotes', JSON.stringify(notes));
    renderNotes();
    closeNoteModal();
  }
}

function closeNoteModal() {
  document.getElementById('noteModal').style.display = 'none';
}

// Settings
function openSettingsModal() {
  const modal = document.getElementById('settingsModal');
  if (modal) modal.style.display = 'grid';
  const map = {
    setDaily: 'dailyLimit',
    setWeekly: 'weeklyLimit',
    setMonthly: 'monthlyLimit',
    setYearly: 'yearlyLimit',
    setSavings: 'savingsTarget',
  };
  Object.entries(map).forEach(([inputId, key]) => {
    const input = document.getElementById(inputId);
    if (input) input.value = localStorage.getItem(key) || '';
  });
}
function closeSettingsModal() {
  const modal = document.getElementById('settingsModal');
  if (modal) modal.style.display = 'none';
}
function saveSettings() {
  localStorage.setItem('weeklyLimit', document.getElementById('setWeekly').value);
  localStorage.setItem('dailyLimit', document.getElementById('setDaily').value);
  localStorage.setItem('monthlyLimit', document.getElementById('setMonthly').value);
  localStorage.setItem('yearlyLimit', document.getElementById('setYearly').value);
  localStorage.setItem('savingsTarget', document.getElementById('setSavings').value);
  alert('Settings Saved');
  closeSettingsModal();
  updateDashboard();
}
function resetData() {
  if (confirm('Reset all data?')) {
    localStorage.removeItem('expenses');
    expenses = [];
    updateDashboard();
    updateEntriesList();
    alert('Data Reset');
    closeSettingsModal();
  }
}

// Profile
function openProfileModal() {
  const toggle = document.getElementById('sidebar-toggle');
  if (toggle) toggle.checked = false;
  const p = JSON.parse(localStorage.getItem('userProfile')) || {};
  const name = document.getElementById('profName');
  const age = document.getElementById('profAge');
  if (name) name.value = p.name || '';
  if (age) age.value = p.age || '';
  document.getElementById('profileModal').style.display = 'grid';
}
function closeProfileModal() {
  document.getElementById('profileModal').style.display = 'none';
}
function saveProfile() {
  const name = document.getElementById('profName').value;
  const age = document.getElementById('profAge').value;
  localStorage.setItem('userProfile', JSON.stringify({ name, age }));
  hydrateProfileSidebar();
  closeProfileModal();
}

// Auth
function showSignup() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'block';
}
function showLogin() {
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPwd = input.type === 'password';
  input.type = isPwd ? 'text' : 'password';
  const button = [...document.querySelectorAll('.toggle-password')].find((b) => b.dataset.target === inputId);
  if (button) {
    const eyeIcon = button.querySelector('.eye-icon');
    if (eyeIcon) {
      eyeIcon.innerHTML = isPwd
        ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>'
        : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    }
  }
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find((u) => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify({ name: user.name, email: user.email }));
    alert('Login successful!');
    setView(true);
  } else {
    alert('Invalid email or password. Please try again.');
  }
}

function handleSignup(event) {
  event.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];
  if (users.some((u) => u.email === email)) {
    alert('Email already registered. Please login.');
    return;
  }

  users.push({ name, email, password });
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify({ name, email }));
  alert('Account created successfully!');
  setView(true);
}

function handleLogout() {
  localStorage.removeItem('currentUser');
  setView(false);
}

// Swipe sidebar
let touchStartX = 0;
let touchEndX = 0;
function bindSwipe() {
  document.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  document.addEventListener(
    'touchend',
    (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    },
    { passive: true }
  );
}
function handleSwipe() {
  const toggle = document.getElementById('sidebar-toggle');
  const swipeThreshold = 50;
  if (!toggle) return;
  if (touchEndX > touchStartX + swipeThreshold && touchStartX < 30) toggle.checked = true;
  if (touchEndX < touchStartX - swipeThreshold && toggle.checked) toggle.checked = false;
}

// Modal close helpers used inline
function closeSettingsModalProxy() { closeSettingsModal(); }

// Event binding on load
window.addEventListener('DOMContentLoaded', () => {
  // Auth links/buttons
  const loginFormEl = document.getElementById('loginFormEl');
  const signupFormEl = document.getElementById('signupFormEl');
  const linkShowSignup = document.getElementById('linkShowSignup');
  const linkShowLogin = document.getElementById('linkShowLogin');
  const toggleButtons = document.querySelectorAll('.toggle-password');

  if (loginFormEl) loginFormEl.addEventListener('submit', handleLogin);
  if (signupFormEl) signupFormEl.addEventListener('submit', handleSignup);
  if (linkShowSignup) linkShowSignup.addEventListener('click', (e) => { e.preventDefault(); showSignup(); });
  if (linkShowLogin) linkShowLogin.addEventListener('click', (e) => { e.preventDefault(); showLogin(); });
  toggleButtons.forEach((btn) => btn.addEventListener('click', () => togglePassword(btn.dataset.target)));

  bindExpenseForm();
  bindSwipe();

  const currentUser = localStorage.getItem('currentUser');
  setView(!!currentUser);
});

// Export globals for inline handlers
window.scrollToSection = scrollToSection;
window.scrollReports = scrollReports;
window.createNewNote = createNewNote;
window.editNote = editNote;
window.saveNote = saveNote;
window.deleteNote = deleteNote;
window.closeNoteModal = closeNoteModal;
window.openSettingsModal = openSettingsModal;
window.closeSettingsModal = closeSettingsModal;
window.saveSettings = saveSettings;
window.resetData = resetData;
window.handleLogout = handleLogout;
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.saveProfile = saveProfile;
window.openHistoryModal = openHistoryModal;
window.closeHistoryModal = closeHistoryModal;
window.createNewNote = createNewNote;
window.editNote = editNote;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.showSignup = showSignup;
window.showLogin = showLogin;
