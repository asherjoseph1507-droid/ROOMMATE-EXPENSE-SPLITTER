// ═══════════════════════════════════════════════════════════
//  server.js  –  SplitMate Backend (Node.js + Express + MongoDB)
// ═══════════════════════════════════════════════════════════

// 1. Import required packages
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');

// 2. Create the Express app
const app = express();
const PORT = 5000;

// 3. Middleware (these run before every request)
app.use(cors());                    // Allow requests from the browser (different port)
app.use(express.json());            // Parse incoming JSON data
app.use(express.static('public')); // Serve our HTML/CSS/JS files

// ─── CONNECT TO MONGODB ───────────────────────────────────
// Change 'splitmate' to your preferred database name
mongoose.connect('mongodb://asherjoseph1507_db_user:G5UwrS1QtwvM5jgY@ac-myu2ovg-shard-00-00.ddp4zk8.mongodb.net:27017,ac-myu2ovg-shard-00-01.ddp4zk8.mongodb.net:27017,ac-myu2ovg-shard-00-02.ddp4zk8.mongodb.net:27017/?ssl=true&replicaSet=atlas-tgzc5e-shard-0&authSource=admin&appName=Cluster0')
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ═══════════════════════════════════════════════════════════
//  DATABASE MODELS (Schemas)
//  These define the shape of data stored in MongoDB
// ═══════════════════════════════════════════════════════════

// ── Roommate Model ──
const roommateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});
const Roommate = mongoose.model('Roommate', roommateSchema);

// ── Expense Model ──
const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  amount:      { type: Number, required: true, min: 0 },
  paidBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'Roommate', required: true },
  splitAmong:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Roommate' }],
  date:        { type: Date, default: Date.now }
});
const Expense = mongoose.model('Expense', expenseSchema);

// ═══════════════════════════════════════════════════════════
//  ROUTES – ROOMMATES
// ═══════════════════════════════════════════════════════════

// GET all roommates
app.get('/api/roommates', async (req, res) => {
  try {
    const roommates = await Roommate.find().sort({ createdAt: 1 });
    res.json(roommates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch roommates' });
  }
});

// POST – add a new roommate
app.post('/api/roommates', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const roommate = new Roommate({ name });
    await roommate.save();
    res.status(201).json(roommate);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add roommate' });
  }
});

// DELETE – remove a roommate
app.delete('/api/roommates/:id', async (req, res) => {
  try {
    await Roommate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Roommate removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete roommate' });
  }
});

// ═══════════════════════════════════════════════════════════
//  ROUTES – EXPENSES
// ═══════════════════════════════════════════════════════════

// GET all expenses (with roommate names populated)
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('paidBy', 'name')           // Replace paidBy ID with { name }
      .populate('splitAmong', 'name')        // Replace each ID with { name }
      .sort({ date: -1 });                   // Latest first
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// GET one expense by ID
app.get('/api/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('paidBy', 'name')
      .populate('splitAmong', 'name');
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

// POST – add a new expense
app.post('/api/expenses', async (req, res) => {
  try {
    const { description, amount, paidBy, splitAmong } = req.body;

    // Basic validation
    if (!description || !amount || !paidBy || !splitAmong?.length) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const expense = new Expense({ description, amount, paidBy, splitAmong });
    await expense.save();

    // Return the populated version
    const populated = await expense.populate(['paidBy', 'splitAmong']);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// PUT – update an existing expense
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { description, amount, paidBy, splitAmong } = req.body;

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { description, amount, paidBy, splitAmong },
      { new: true }                           // Return the updated document
    ).populate('paidBy', 'name').populate('splitAmong', 'name');

    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// DELETE – remove an expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// ─── START THE SERVER ─────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 SplitMate server running at http://localhost:${PORT}`);
  console.log(`📂 Open your browser and go to: http://localhost:${PORT}`);
});
