# 🚀 Easy Setup Guide (No Docker, No PostgreSQL Required)

Since Docker and PostgreSQL aren't installed, follow these steps:

## Option 1: Install PostgreSQL (Recommended)

### Download PostgreSQL
1. Go to https://www.postgresql.org/download/windows/
2. Download PostgreSQL 15+ installer
3. Run installer with default settings
4. Remember the password you set for 'postgres' user

### After Installing PostgreSQL

Open PowerShell in this directory and run:

```powershell
# Set the database connection
$env:DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ai_newsroom?schema=public"

# Navigate to backend
cd backend

# Install dependencies (if not done)
npm install

# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name init

# Start backend
npm run dev
```

In a NEW PowerShell window:
```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

## Option 2: Use Online PostgreSQL (Easiest)

### Get Free PostgreSQL Database

1. **Go to Neon.tech (Free PostgreSQL)**
   - Visit: https://neon.tech
   - Sign up for free account
   - Create a new project
   - Copy the connection string (looks like: postgresql://user:pass@host/db)

2. **Update Backend .env**
   ```
   DATABASE_URL="your-connection-string-here"
   OPENAI_API_KEY="your-openai-key-here"
   ```

3. **Setup and Run**
   ```powershell
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npm run dev
   ```

4. **In a NEW terminal, start frontend:**
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

## Option 3: Install Docker Desktop (For Full Setup)

1. Download Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Install and restart computer
3. Open Docker Desktop
4. Run in PowerShell:
   ```powershell
   docker-compose up -d
   ```

## 📝 Important: OpenAI API Key

No matter which option you choose, you MUST have an OpenAI API key:

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add it to `backend\.env`:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

## ✅ Verify It's Working

After starting both backend and frontend:
- Backend: http://localhost:5000/health (should show {"status":"ok"})
- Frontend: http://localhost:3000 (should show login page)

## 🆘 Quick Troubleshooting

**"Port already in use"**
```powershell
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**"Cannot connect to database"**
- Make sure PostgreSQL is running
- Check DATABASE_URL in backend\.env
- Verify password is correct

**"OpenAI API error"**
- Check your API key in backend\.env
- Verify you have credits: https://platform.openai.com/account/usage

## 🎯 Recommended: Use Option 2 (Online Database)

This is the fastest way to get started without installing anything!

1. Get free database from Neon.tech
2. Update DATABASE_URL in backend\.env
3. Add your OPENAI_API_KEY
4. Run the commands above
5. You're done! 🎉
