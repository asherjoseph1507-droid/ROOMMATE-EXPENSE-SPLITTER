// ═══════════════════════════════════════════════════════════
//  app.js  –  SplitMate Frontend Logic
//  Communicates with the Node.js backend via fetch() calls
// ═══════════════════════════════════════════════════════════

const API = 'http://localhost:5000/api';  // Backend URL

// Track if we're editing an expense
let editingExpenseId = null;

// ─── ON PAGE LOAD ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadRoommates();
  loadExpenses();

  // Hook up form submissions
  document.getElementById('expenseForm').addEventListener('submit', handleExpenseSubmit);
  document.getElementById('roommateForm').addEventListener('submit', handleRoommateSubmit);
});

// ─── NAVIGATION ───────────────────────────────────────────
function showSection(name) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(name).classList.add('active');
  event.target.classList.add('active');
}

// ─── TOAST NOTIFICATION ───────────────────────────────────
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ═══════════════════════════════════════════════════════════
//  ROOMMATES
// ═══════════════════════════════════════════════════════════

async function loadRoommates() {
  try {
    const res = await fetch(`${API}/roommates`);
    const data = await res.json();
    renderRoommateList(data);
    populateRoommateDropdowns(data);
  } catch (err) {
    console.error('Could not load roommates:', err);
  }
}

function renderRoommateList(roommates) {
  const container = document.getElementById('roommateList');
  if (!roommates.length) {
    container.innerHTML = '<p class="empty-msg">No roommates added yet.</p>';
    return;
  }
  container.innerHTML = roommates.map(r => `
    <div class="roommate-card">
      <div class="roommate-avatar">${r.name.charAt(0).toUpperCase()}</div>
      <div class="roommate-name">${r.name}</div>
      <div class="roommate-balance" id="rm-bal-${r._id}">Loading...</div>
      <button class="btn btn-sm btn-delete" onclick="deleteRoommate('${r._id}', '${r.name}')">Remove</button>
    </div>
  `).join('');
}

function populateRoommateDropdowns(roommates) {
  // Populate "Paid By" select
  const paidBySelect = document.getElementById('paidBy');
  const currentVal = paidBySelect.value;
  paidBySelect.innerHTML = '<option value="">-- Select Roommate --</option>' +
    roommates.map(r => `<option value="${r._id}" ${currentVal === r._id ? 'selected' : ''}>${r.name}</option>`).join('');

  // Populate "Split Among" checkboxes
  const splitDiv = document.getElementById('splitAmong');
  if (!roommates.length) {
    splitDiv.innerHTML = '<p class="empty-msg">Add roommates first to split expenses</p>';
    return;
  }
  splitDiv.innerHTML = roommates.map(r => `
    <label>
      <input type="checkbox" value="${r._id}" checked />
      ${r.name}
    </label>
  `).join('');
}

async function handleRoommateSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('roommateName');
  const name = nameInput.value.trim();
  if (!name) return;

  try {
    const res = await fetch(`${API}/roommates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error('Failed');
    nameInput.value = '';
    showToast(`${name} added to the household! 🎉`);
    loadRoommates();
  } catch (err) {
    showToast('Could not add roommate', 'error');
  }
}

async function deleteRoommate(id, name) {
  if (!confirm(`Remove ${name} from the household?\nThis won't delete their past expenses.`)) return;
  try {
    await fetch(`${API}/roommates/${id}`, { method: 'DELETE' });
    showToast(`${name} removed`);
    loadRoommates();
  } catch (err) {
    showToast('Could not remove roommate', 'error');
  }
}

// ═══════════════════════════════════════════════════════════
//  EXPENSES
// ═══════════════════════════════════════════════════════════

async function loadExpenses() {
  try {
    const res = await fetch(`${API}/expenses`);
    const data = await res.json();
    renderExpenses(data);
    renderDashboard(data);
  } catch (err) {
    console.error('Could not load expenses:', err);
  }
}

function renderExpenses(expenses) {
  const container = document.getElementById('expenseList');
  if (!expenses.length) {
    container.innerHTML = '<p class="empty-msg">No expenses yet. Add one above!</p>';
    return;
  }
  const icons = ['🛒','🍕','💡','🚿','📺','🏠','🎮','🌐','🍺','☕'];
  container.innerHTML = expenses.map((exp, i) => {
    const paidName = exp.paidBy?.name || 'Unknown';
    const splitNames = exp.splitAmong?.map(r => r.name).join(', ') || 'Everyone';
    const icon = icons[i % icons.length];
    return `
      <div class="expense-item" id="exp-${exp._id}">
        <div class="expense-icon">${icon}</div>
        <div class="expense-info">
          <div class="expense-desc">${exp.description}</div>
          <div class="expense-meta">Paid by <strong>${paidName}</strong> · ${new Date(exp.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
          <div class="expense-split-tag">Split: ${splitNames}</div>
        </div>
        <div class="expense-amount">₹${Number(exp.amount).toLocaleString('en-IN')}</div>
        <div class="expense-actions">
          <button class="btn btn-sm btn-edit" onclick="editExpense('${exp._id}')">Edit</button>
          <button class="btn btn-sm btn-delete" onclick="deleteExpense('${exp._id}')">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

async function handleExpenseSubmit(e) {
  e.preventDefault();

  const desc = document.getElementById('desc').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const paidBy = document.getElementById('paidBy').value;
  const checkboxes = document.querySelectorAll('#splitAmong input[type="checkbox"]:checked');
  const splitAmong = Array.from(checkboxes).map(cb => cb.value);

  if (!desc || !amount || !paidBy || !splitAmong.length) {
    showToast('Please fill in all fields & select split members', 'error');
    return;
  }

  const body = { description: desc, amount, paidBy, splitAmong };

  try {
    if (editingExpenseId) {
      // UPDATE existing expense
      await fetch(`${API}/expenses/${editingExpenseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      showToast('Expense updated ✅');
      cancelEdit();
    } else {
      // CREATE new expense
      await fetch(`${API}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      showToast('Expense added! 💸');
    }
    e.target.reset();
    loadExpenses();
    loadRoommates(); // refresh balances
  } catch (err) {
    showToast('Could not save expense', 'error');
  }
}

async function editExpense(id) {
  try {
    const res = await fetch(`${API}/expenses/${id}`);
    const exp = await res.json();

    document.getElementById('desc').value = exp.description;
    document.getElementById('amount').value = exp.amount;
    document.getElementById('paidBy').value = exp.paidBy?._id || exp.paidBy;

    // Check correct checkboxes
    const ids = exp.splitAmong.map(r => r._id || r);
    document.querySelectorAll('#splitAmong input[type="checkbox"]').forEach(cb => {
      cb.checked = ids.includes(cb.value);
    });

    editingExpenseId = id;
    document.getElementById('submitBtn').textContent = 'Update Expense';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';

    // Navigate to Expenses tab
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('expenses').classList.add('active');
    document.querySelectorAll('.nav-btn')[1].classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Editing expense...', 'success');
  } catch (err) {
    showToast('Could not load expense for editing', 'error');
  }
}

function cancelEdit() {
  editingExpenseId = null;
  document.getElementById('expenseForm').reset();
  document.getElementById('submitBtn').textContent = 'Add Expense';
  document.getElementById('cancelEditBtn').style.display = 'none';
}

async function deleteExpense(id) {
  if (!confirm('Delete this expense?')) return;
  try {
    await fetch(`${API}/expenses/${id}`, { method: 'DELETE' });
    showToast('Expense deleted');
    loadExpenses();
    loadRoommates();
  } catch (err) {
    showToast('Could not delete expense', 'error');
  }
}

// ═══════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════

function renderDashboard(expenses) {
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const count = expenses.length;

  // Stats cards
  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Total Spent</div>
      <div class="stat-value gold">₹${totalSpent.toLocaleString('en-IN')}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Expenses</div>
      <div class="stat-value teal">${count}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Avg Per Expense</div>
      <div class="stat-value">${count ? '₹' + Math.round(totalSpent/count).toLocaleString('en-IN') : '–'}</div>
    </div>
  `;

  // Compute balances
  const owes = {};    // owes[payer][debtor] = amount

  expenses.forEach(exp => {
    const payerId = exp.paidBy?._id || String(exp.paidBy);
    const payerName = exp.paidBy?.name || 'Unknown';
    const members = exp.splitAmong || [];
    if (!members.length) return;
    const share = exp.amount / members.length;

    members.forEach(m => {
      const mid = m._id || String(m);
      const mname = m.name || mid;
      if (mid === payerId) return;  // payer doesn't owe themselves

      // mid owes payerId 'share'
      if (!owes[mname]) owes[mname] = {};
      if (!owes[mname][payerName]) owes[mname][payerName] = 0;
      owes[mname][payerName] += share;
    });
  });

  // Render balance list
  const container = document.getElementById('balanceSummary');
  const rows = [];
  Object.entries(owes).forEach(([debtor, creditors]) => {
    Object.entries(creditors).forEach(([creditor, amt]) => {
      if (amt > 0.01) rows.push({ debtor, creditor, amt });
    });
  });

  // Also update roommate balance chips
  rows.forEach(row => {
    // find roommate cards and update their balance text
  });

  if (!rows.length) {
    container.innerHTML = '<p class="empty-msg">All settled up! 🎉</p>';
    return;
  }

  container.innerHTML = rows.map(r => `
    <div class="balance-item">
      <span class="balance-arrow">💸</span>
      <div class="balance-text">
        <strong>${r.debtor}</strong> owes <strong>${r.creditor}</strong>
      </div>
      <div class="balance-amount">₹${r.amt.toFixed(2)}</div>
    </div>
  `).join('');
}
