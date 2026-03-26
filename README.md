# 🏠 EquiNest – Roommate Expense Splitter
### Complete Setup Guide for Beginners

---

## 📁 Project Folder Structure

When you're done, your project should look like this:

```
roommate-splitter/
│
├── server.js          ← Backend (Node.js server)
├── package.json       ← Project config & dependencies list
│
└── public/            ← Frontend files (what the browser sees)
    ├── index.html     ← The webpage structure
    ├── style.css      ← The visual styling
    └── app.js         ← Frontend interactivity
```

---

## 🛠️ STEP-BY-STEP SETUP GUIDE

### ✅ STEP 1 – Install Node.js (if you haven't already)

1. Open your browser and go to: **https://nodejs.org**
2. Click the big green **"LTS"** button to download
3. Run the downloaded installer and click **Next** through all steps
4. To verify it worked, open a terminal and type:
   ```
   node --version
   ```
   You should see something like `v20.10.0`

> **What is Node.js?**  
> It's a program that lets you run JavaScript on your computer (not just in a browser).
> Your backend server is written in JavaScript, so Node.js is needed to run it.

---

### ✅ STEP 2 – Install MongoDB (your database)

MongoDB stores all your expenses and roommate data.

1. Go to: **https://www.mongodb.com/try/download/community**
2. Choose your OS (Windows/Mac/Linux) and download
3. Run the installer → choose **"Complete"** setup type
4. Also install **MongoDB Compass** (a visual UI for your database) — check the box during install

> **What is MongoDB?**  
> It's a database — like a smart storage cabinet where all your app's data is saved.
> Even if you restart the server, your data stays safe.

---

### ✅ STEP 3 – Open the Project in VS Code

1. Open **VS Code**
2. Click **File → Open Folder**
3. Select your `roommate-splitter` folder

---

### ✅ STEP 4 – Open the Terminal in VS Code

In VS Code, press:
- Windows: `Ctrl + `` ` (backtick key, top-left of keyboard)
- Mac: `Cmd + `` `

You'll see a terminal appear at the bottom of VS Code.

---

### ✅ STEP 5 – Install Project Dependencies

In the terminal, make sure you're inside the `roommate-splitter` folder, then run:

```bash
npm install
```

> **What does this do?**  
> It reads `package.json` and downloads the required packages:
> - **express** → the web server framework
> - **mongoose** → connects Node.js to MongoDB
> - **cors** → allows the browser to talk to your server
> - **nodemon** → automatically restarts server when you save changes

You'll see a `node_modules` folder appear — that's all the downloaded packages.

---

### ✅ STEP 6 – Start MongoDB

**On Windows:**
1. Press `Win + R`, type `services.msc`, press Enter
2. Find **MongoDB** in the list
3. Right-click → **Start**

**On Mac:**
Open a terminal and run:
```bash
brew services start mongodb-community
```

**Verify MongoDB is running** by opening **MongoDB Compass** and clicking **Connect**.

---

### ✅ STEP 7 – Run the Server

In VS Code terminal, type:

```bash
npm start
```

You should see:
```
✅ MongoDB connected successfully!
🚀 SplitMate server running at http://localhost:5000
📂 Open your browser and go to: http://localhost:5000
```

> **Tip for development:** Use `npm run dev` instead — it uses `nodemon` which
> automatically restarts the server every time you save a file.

---

### ✅ STEP 8 – Open the App in Your Browser

Go to: **http://localhost:5000**

Your app is now running! 🎉

---

## 🎮 HOW TO USE THE APP

### 1. Add Roommates (start here!)
- Click the **"Roommates"** tab
- Type a name and click **Add**
- Repeat for all your roommates

### 2. Add an Expense
- Click the **"Expenses"** tab
- Fill in the form:
  - **Description**: What was the expense? (e.g. "Monthly groceries")
  - **Amount**: How much did it cost?
  - **Paid By**: Who paid for it?
  - **Split Among**: Who shares this cost? (check/uncheck names)
- Click **Add Expense**

### 3. See Who Owes Whom
- Click the **"Dashboard"** tab
- The **"Who Owes Whom"** section shows exactly what everyone owes

### 4. Edit or Delete Expenses
- In the **Expenses** tab, each expense has **Edit** and **Delete** buttons
- Click **Edit** to change any detail, then click **Update Expense**

---

## 🔧 HOW THE CODE WORKS (Explained Simply)

```
Browser (HTML/CSS/JS)
       ↕  HTTP requests (fetch)
Node.js Server (server.js)
       ↕  Mongoose queries
MongoDB Database
```

1. **User adds an expense** → `app.js` sends a `POST` request to the server
2. **Server receives it** → `server.js` validates the data
3. **Server saves it** → MongoDB stores it permanently
4. **Page refreshes data** → `app.js` fetches the updated list and displays it

### API Endpoints (the server's "routes"):

| Method | URL | What it does |
|--------|-----|--------------|
| GET | /api/roommates | Get all roommates |
| POST | /api/roommates | Add a new roommate |
| DELETE | /api/roommates/:id | Delete a roommate |
| GET | /api/expenses | Get all expenses |
| GET | /api/expenses/:id | Get one expense |
| POST | /api/expenses | Add a new expense |
| PUT | /api/expenses/:id | Update an expense |
| DELETE | /api/expenses/:id | Delete an expense |

---

## ❓ TROUBLESHOOTING

**Problem: "Cannot connect to MongoDB"**
→ MongoDB is not running. Start it (see Step 6 above).

**Problem: "Port 5000 already in use"**
→ Another app is using port 5000. In `server.js`, change `const PORT = 5000` to `5001`.

**Problem: npm install fails**
→ Make sure you're inside the `roommate-splitter` folder in the terminal.

**Problem: Page not loading**
→ Make sure the server is running (`npm start`) and go to `http://localhost:5000`.

---

## 🚀 EXTENDING THE APP (Next Steps)

- Add **categories** to expenses (Food, Utilities, Rent, etc.)
- Add a **"Mark as Settled"** button to clear a debt
- Add **user authentication** (login/signup)
- Deploy online using **Railway** or **Render** (free hosting)
