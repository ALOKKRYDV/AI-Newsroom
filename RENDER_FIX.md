# 🔧 Render Deployment Fix

## The Problem:
Render is running `npm install` in the root directory instead of the `backend` directory, so it's not installing your dependencies.

## ✅ Solution:

### Update Build Command in Render:

Change the **Build Command** from:
```
npm install && npx prisma generate
```

To:
```
cd backend && npm install && npx prisma generate
```

OR (more reliable):
```
npm install --prefix backend && npx prisma generate --schema=backend/prisma/schema.prisma
```

### Update Start Command:

Change the **Start Command** from:
```
npm start
```

To:
```
cd backend && npm start
```

OR:
```
npm start --prefix backend
```

---

## 📋 Step-by-Step Fix:

1. Go to your Render dashboard
2. Click on **"ai-newsroom-j2wv"** service
3. Click **"Settings"** (left sidebar)
4. Scroll to **"Build & Deploy"** section
5. Click **"Edit"** next to Build Command
6. Change to: `cd backend && npm install && npx prisma generate`
7. Click **"Save Changes"**
8. Click **"Edit"** next to Start Command
9. Change to: `cd backend && npm start`
10. Click **"Save Changes"**
11. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## Alternative: Remove Root Directory Setting

If the above doesn't work:

1. Go to **Settings**
2. Find **"Root Directory"**
3. Make sure it says: `backend`
4. If it doesn't, change it to `backend`
5. Then use the ORIGINAL commands:
   - Build: `npm install && npx prisma generate`
   - Start: `npm start`
6. Save and redeploy
