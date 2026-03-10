# 🗄️ CipherSQLStudio

> An interactive SQL learning platform where students practice queries against real PostgreSQL databases with AI-powered hints.

---

## 🗺️ What This App Does

1. **Admin pre-loads assignments** into MongoDB (done via seed script)
2. **Students browse assignments** on the frontend
3. **Student opens an assignment** → sees the question + sample data tables
4. **Student writes SQL** in the Monaco editor (same editor as VS Code)
5. **Student clicks "Run Query"** → Backend creates a private PostgreSQL schema, inserts sample data, runs the query, returns results
6. **If stuck**, student clicks "Get Hint" → Backend calls Gemini/OpenAI API with a special prompt that returns guidance but NOT the solution
7. **Progress is saved** to MongoDB

---

## 🏗️ Architecture

```
Browser (React)
    │
    ├── GET /api/assignments     → MongoDB: fetch assignment list
    ├── POST /api/query/execute  → PostgreSQL: run SQL in sandbox schema
    └── POST /api/query/hint     → LLM API (Gemini/OpenAI): get hint
```

### Data Flow Diagram
```
User writes SQL
    │
    ▼
React frontend (port 3000)
    │  POST /api/query/execute { query, assignmentId, sessionId }
    ▼
Express backend (port 5000)
    │
    ├── 1. Fetch assignment sampleTables from MongoDB
    │
    ├── 2. CREATE SCHEMA workspace_<sessionId> in PostgreSQL
    │
    ├── 3. CREATE TABLE + INSERT sample rows in that schema
    │
    ├── 4. SET search_path TO workspace_<sessionId>
    │
    ├── 5. Execute user's query (with 5-second timeout)
    │
    ├── 6. DROP SCHEMA workspace_<sessionId> CASCADE (cleanup)
    │
    └── 7. Return { rows, fields, rowCount, executionTime }
              │
              ▼
         React renders results table
```

---

## 📁 Folder Structure

```
CipherSQLStudio/
├── backend/
│   ├── config/
│   │   ├── mongodb.js      ← MongoDB Atlas connection
│   │   └── postgres.js     ← PostgreSQL connection pool
│   ├── controllers/
│   │   ├── assignmentController.js  ← GET assignments logic
│   │   └── queryController.js       ← Execute query + hint logic
│   ├── models/
│   │   ├── Assignment.js   ← MongoDB schema for assignments
│   │   └── UserProgress.js ← MongoDB schema for progress
│   ├── routes/
│   │   ├── assignments.js  ← URL routes for assignments
│   │   └── query.js        ← URL routes for query + hints
│   ├── utils/
│   │   ├── sandbox.js      ← PostgreSQL sandboxing logic ⭐
│   │   ├── llmHint.js      ← LLM API calls + prompt engineering ⭐
│   │   └── seedData.js     ← Script to populate sample assignments
│   ├── server.js           ← Express app entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Navbar.jsx
    │   │   │   └── DifficultyBadge.jsx
    │   │   ├── assignments/
    │   │   │   ├── AssignmentCard.jsx
    │   │   │   └── SampleDataViewer.jsx
    │   │   ├── editor/
    │   │   │   ├── SqlEditor.jsx   ← Monaco Editor wrapper ⭐
    │   │   │   └── QueryResults.jsx
    │   │   └── hints/
    │   │       └── HintPanel.jsx   ← AI hint UI ⭐
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── AssignmentsPage.jsx
    │   │   └── AttemptPage.jsx     ← Main working page ⭐
    │   ├── styles/                 ← Vanilla SCSS (no CSS frameworks)
    │   │   ├── base/
    │   │   │   ├── _variables.scss ← Colors, fonts, spacing
    │   │   │   ├── _mixins.scss    ← Reusable CSS blocks
    │   │   │   └── _reset.scss     ← Browser reset
    │   │   ├── components/         ← Component-specific styles
    │   │   ├── layouts/            ← Page layout styles
    │   │   └── main.scss           ← Imports everything
    │   ├── utils/api.js            ← All API calls
    │   ├── App.jsx                 ← Router setup
    │   └── main.jsx                ← React entry point
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Step-by-Step Setup (Complete Beginner Guide)

### Prerequisites - Install These First

**1. Install Node.js**
- Go to https://nodejs.org and download the "LTS" version
- After installing, open a terminal/command prompt and verify:
  ```bash
  node --version    # Should show v18+ or v20+
  npm --version     # Should show 9+
  ```

**2. Install PostgreSQL**
- Go to https://www.postgresql.org/download/
- Download and install for your OS
- During installation, set a password for the "postgres" user — **remember this password!**
- After installing, verify:
  ```bash
  psql --version    # Should show psql (PostgreSQL) 14+ or 15+
  ```

**3. Create the PostgreSQL Database**
- Open a terminal and run:
  ```bash
  # Connect to PostgreSQL as admin
  psql -U postgres
  
  # Inside psql, create the database (copy paste this):
  CREATE DATABASE ciphersqlstudio_sandbox;
  
  # Verify it was created:
  \l
  
  # Exit psql:
  \q
  ```

**4. Get a MongoDB Atlas Account (Free)**
- Go to https://www.mongodb.com/atlas/database
- Click "Try Free" → create account
- Create a FREE cluster (M0 tier)
- Click "Connect" → "Connect your application" → Copy the connection string
- It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`

**5. Get an LLM API Key**

**Option A - Google Gemini (Recommended - Free tier available):**
- Go to https://makersuite.google.com/app/apikey
- Click "Create API Key"
- Copy the key

**Option B - OpenAI:**
- Go to https://platform.openai.com/api-keys
- Click "Create new secret key"
- Copy the key

---

### Installation Steps

**Step 1: Download/Clone this project**
```bash
# If you have git:
git clone <your-repo-url>
cd CipherSQLStudio

# OR just download the ZIP and extract it
```

**Step 2: Install backend dependencies**
```bash
cd backend
npm install
```
This downloads all the packages listed in `backend/package.json`.

**Step 3: Configure backend environment**
```bash
# Copy the example file
cp .env.example .env

# Now open .env in any text editor and fill in your values:
```

Open `backend/.env` and fill in:
```env
PORT=5000
NODE_ENV=development

# Your MongoDB Atlas connection string (from Step 4 above)
MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/ciphersqlstudio?retryWrites=true&w=majority

# PostgreSQL (use the password you set during PostgreSQL installation)
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=ciphersqlstudio_sandbox
PG_USER=postgres
PG_PASSWORD=yourpostgrespassword

# LLM API (pick one):
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxx
LLM_PROVIDER=gemini
# OR:
# OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
# LLM_PROVIDER=openai

FRONTEND_URL=http://localhost:3000
```

**Step 4: Seed the database with sample assignments**
```bash
# Still in the backend folder:
node utils/seedData.js
```
You should see:
```
✅ Connected to MongoDB
🗑️  Cleared existing assignments
✅ Inserted 6 sample assignments
  - [Easy] Select All Employees
  - [Easy] Filter by Department
  - [Medium] Average Salary by Department
  - [Medium] Join Orders with Customers
  - [Easy] Top 3 Highest Paid Employees
  - [Hard] Subquery: Above Average Salary
✅ Seed complete!
```

**Step 5: Start the backend server**
```bash
# Still in backend folder:
npm run dev
```
You should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
✅ PostgreSQL Connection Verified
🚀 CipherSQLStudio Backend running on http://localhost:5000
```

**Step 6: Install frontend dependencies**

Open a **new terminal window**, then:
```bash
cd CipherSQLStudio/frontend
npm install
```

**Step 7: Configure frontend environment**
```bash
cp .env.example .env
```
Open `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

**Step 8: Start the frontend**
```bash
npm run dev
```
You should see:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:3000/
```

**Step 9: Open the app!**
- Open your browser and go to: **http://localhost:3000**
- You should see CipherSQLStudio's home page!

---

## 🧪 Testing the App

1. Click **"Start Practicing"**
2. You'll see 6 assignments listed
3. Click on **"Select All Employees"** (Easy)
4. You'll see the question and sample data on the left
5. In the editor, type: `SELECT * FROM employees`
6. Click **"Run Query"** or press **Ctrl+Enter**
7. You should see a table with 5 rows returned!
8. Try clicking **"Get Hint"** to see the AI hint in action

---

## 🔧 Troubleshooting

**"Cannot connect to MongoDB"**
- Check your MONGODB_URI in `.env` — username/password/cluster name must be correct
- Make sure your IP is whitelisted in MongoDB Atlas (Atlas → Network Access → Add IP Address → Allow from anywhere for development)

**"PostgreSQL connection failed"**
- Make sure PostgreSQL is running. On Windows: check Services. On Mac/Linux: `pg_ctl status`
- Make sure PG_PASSWORD in `.env` matches what you set during installation
- Make sure the database exists: `psql -U postgres -c "\l"` should show `ciphersqlstudio_sandbox`

**"Hint failed - check your API key"**
- Verify your GEMINI_API_KEY or OPENAI_API_KEY is correct in `.env`
- Restart the backend after changing `.env`

**Port already in use**
- Backend port 5000 or frontend port 3000 is taken
- Change PORT in backend `.env` or change port in `vite.config.js`

---

## 🛠️ Tech Choices Explained

| Technology | Why |
|---|---|
| **React** | Component-based UI, fast re-renders, huge ecosystem |
| **Vite** | Much faster than Create React App for development |
| **Vanilla SCSS** | Assignment requires no CSS framework — SCSS adds variables, mixins, nesting |
| **Monaco Editor** | Same editor as VS Code — great SQL syntax highlighting |
| **Express.js** | Minimal, flexible Node.js server framework |
| **PostgreSQL** | Real SQL database — users get actual SQL execution experience |
| **MongoDB** | Flexible document storage for assignments (schema can vary by assignment) |
| **Gemini API** | Free tier available, fast responses for hints |

---

## 🔒 Security Features

- **Query sandboxing**: Each user gets an isolated PostgreSQL schema, cleaned up after every query
- **Query validation**: Dangerous operations (DROP DATABASE, ALTER SYSTEM, etc.) are blocked
- **Rate limiting**: Max 30 queries/minute, 10 hints/minute per IP
- **Timeout**: Queries are killed after 5 seconds to prevent server overload
- **Helmet**: Security headers on all API responses
- **Body size limit**: 10KB max request body

---

## 📝 Notes for Evaluators

- **Data Flow Diagram**: See the ASCII diagram at the top of this README
- **SCSS**: All styles are in `frontend/src/styles/` using variables, mixins, nesting, and partials
- **Mobile-first**: Breakpoints at 320px, 641px, 1024px, 1281px using `@include tablet/desktop/wide`
- **LLM Prompt Engineering**: See `backend/utils/llmHint.js` — system prompt explicitly prevents solutions
- **Sandbox isolation**: See `backend/utils/sandbox.js` — each session gets its own PostgreSQL schema
