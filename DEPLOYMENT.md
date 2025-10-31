# AI Newsroom - Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel (Frontend) + Render (Backend) - **RECOMMENDED FOR BEGINNERS**

#### **A. Deploy Backend to Render**

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Create Render Account:**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

3. **Deploy Backend:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `ai-newsroom-backend`
     - **Region**: Choose closest to you
     - **Branch**: `main`
     - **Root Directory**: `backend`
     - **Runtime**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Free

4. **Add Environment Variables** in Render dashboard:
   ```
   DATABASE_URL=your-neon-db-url
   JWT_SECRET=your-secret-key-here
   OPENAI_API_KEY=your-openai-api-key-here
   GROQ_API_KEY=your-groq-api-key-here
   UNSPLASH_ACCESS_KEY=your-unsplash-key-here
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
   
   **Note:** Get your actual API keys from:
   - OpenAI: https://platform.openai.com/api-keys
   - Groq: https://console.groq.com/keys
   - Unsplash: https://unsplash.com/oauth/applications

5. **Deploy** - Render will automatically build and deploy
   - Copy your backend URL: `https://ai-newsroom-backend.onrender.com`

#### **B. Deploy Frontend to Vercel**

1. **Update API URL in frontend:**
   - Create `frontend/.env.production`:
     ```
     VITE_API_URL=https://ai-newsroom-backend.onrender.com/api
     ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Environment Variables** in Vercel:
   ```
   VITE_API_URL=https://ai-newsroom-backend.onrender.com/api
   ```

4. **Deploy** - Vercel will build and deploy automatically
   - Your site will be live at: `https://your-project.vercel.app`

5. **Update CORS in backend:**
   - Go back to Render and update `FRONTEND_URL` env var with your Vercel URL

---

### Option 2: Railway (Full Stack) - **EASIEST OPTION**

1. **Create Railway Account:**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend:**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects Node.js
   - Add environment variables (same as above)
   - Set root directory: `backend`

3. **Deploy Frontend:**
   - Add another service in same project
   - Connect same repository
   - Set root directory: `frontend`
   - Add `VITE_API_URL` environment variable

4. **Railway provides public URLs automatically**

---

### Option 3: Digital Ocean App Platform - **PRODUCTION READY**

1. **Create Digital Ocean Account:**
   - Go to [digitalocean.com](https://digitalocean.com)
   - Get $200 free credit for 60 days

2. **Create App:**
   - Go to Apps → "Create App"
   - Connect GitHub repository

3. **Configure Backend:**
   - **Type**: Web Service
   - **Source Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Run Command**: `npm start`
   - **HTTP Port**: 5000
   - **Plan**: Basic ($5/month)

4. **Configure Frontend:**
   - **Type**: Static Site
   - **Source Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`

5. **Add Environment Variables** for both services

6. **Deploy** - Digital Ocean handles everything

---

### Option 4: AWS (Advanced) - **SCALABLE FOR PRODUCTION**

#### **Backend on AWS Elastic Beanstalk:**

1. **Install AWS CLI and EB CLI:**
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB in backend folder:**
   ```bash
   cd backend
   eb init -p node.js ai-newsroom-backend --region us-east-1
   ```

3. **Create environment:**
   ```bash
   eb create ai-newsroom-env
   ```

4. **Set environment variables:**
   ```bash
   eb setenv DATABASE_URL="your-db-url" JWT_SECRET="your-secret" ...
   ```

5. **Deploy:**
   ```bash
   eb deploy
   ```

#### **Frontend on AWS S3 + CloudFront:**

1. **Build frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Create S3 bucket:**
   ```bash
   aws s3 mb s3://ai-newsroom-frontend
   ```

3. **Upload build:**
   ```bash
   aws s3 sync dist/ s3://ai-newsroom-frontend --acl public-read
   ```

4. **Enable static website hosting in S3 console**

5. **Create CloudFront distribution** for CDN

---

### Option 5: Docker + VPS (Custom Server)

#### **Prerequisites:**
- VPS (DigitalOcean Droplet, Linode, AWS EC2, etc.)
- Domain name (optional)

#### **Steps:**

1. **Create Dockerfiles** (already in project)

2. **Build and push to Docker Hub:**
   ```bash
   docker build -t your-username/ai-newsroom-backend ./backend
   docker build -t your-username/ai-newsroom-frontend ./frontend
   docker push your-username/ai-newsroom-backend
   docker push your-username/ai-newsroom-frontend
   ```

3. **SSH into your VPS:**
   ```bash
   ssh root@your-server-ip
   ```

4. **Install Docker and Docker Compose:**
   ```bash
   apt update
   apt install docker.io docker-compose -y
   ```

5. **Create docker-compose.yml on server:**
   ```yaml
   version: '3.8'
   services:
     backend:
       image: your-username/ai-newsroom-backend
       ports:
         - "5000:5000"
       environment:
         - DATABASE_URL=your-neon-db-url
         - JWT_SECRET=your-secret
         - OPENAI_API_KEY=your-key
         - GROQ_API_KEY=your-key
         - UNSPLASH_ACCESS_KEY=your-key
         - NODE_ENV=production
       restart: always

     frontend:
       image: your-username/ai-newsroom-frontend
       ports:
         - "80:80"
       environment:
         - VITE_API_URL=http://your-server-ip:5000/api
       restart: always
   ```

6. **Start services:**
   ```bash
   docker-compose up -d
   ```

7. **Set up Nginx reverse proxy** (optional but recommended):
   ```bash
   apt install nginx -y
   ```

   Create `/etc/nginx/sites-available/ai-newsroom`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   ln -s /etc/nginx/sites-available/ai-newsroom /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

8. **Install SSL with Let's Encrypt:**
   ```bash
   apt install certbot python3-certbot-nginx -y
   certbot --nginx -d your-domain.com
   ```

---

## 🔧 Pre-Deployment Checklist

### **1. Update Frontend API URL**

Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.com/api
```

Or update `frontend/src/lib/api.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.com/api';
```

### **2. Update CORS in Backend**

Edit `backend/src/index.js`:
```javascript
app.use(cors({
  origin: [
    'https://your-frontend-url.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

### **3. Database Migrations**

Ensure Prisma migrations are applied:
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### **4. Security Checklist:**

- ✅ Change `JWT_SECRET` to a strong random string
- ✅ Never commit `.env` files
- ✅ Use HTTPS only in production
- ✅ Enable rate limiting (already configured)
- ✅ Update CORS origins
- ✅ Keep API keys secure

### **5. Environment Variables Needed:**

**Backend:**
```env
DATABASE_URL=postgresql://your-database-url
JWT_SECRET=your-random-secret-key
OPENAI_API_KEY=your-openai-key
GROQ_API_KEY=your-groq-key
UNSPLASH_ACCESS_KEY=your-unsplash-key
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-url.com
```

**Frontend:**
```env
VITE_API_URL=https://your-backend-url.com/api
```

---

## 🎯 **Recommended Path for Beginners:**

1. **Start with Vercel + Render** (Free tier available)
2. Use your existing Neon.tech PostgreSQL database
3. Takes ~15 minutes to deploy
4. Zero server management
5. Auto-scaling included

---

## 📊 **Cost Comparison:**

| Platform | Backend | Frontend | Database | Total/Month |
|----------|---------|----------|----------|-------------|
| **Vercel + Render** | Free | Free | $0 (Neon free) | **$0** |
| **Railway** | $5 | $5 | $0 (Neon free) | **$10** |
| **Digital Ocean** | $5 | Free | $0 (Neon free) | **$5** |
| **AWS** | ~$10 | ~$1 | $0 (Neon free) | **~$11** |
| **VPS** | $5-10 | Included | $0 (Neon free) | **$5-10** |

---

## 🐛 Common Deployment Issues

### **Issue 1: CORS Errors**
**Solution:** Update `FRONTEND_URL` in backend env vars

### **Issue 2: Database Connection Failed**
**Solution:** Check `DATABASE_URL` format, ensure Neon database is accessible

### **Issue 3: API calls failing**
**Solution:** Update `VITE_API_URL` in frontend, rebuild frontend

### **Issue 4: Prisma errors**
**Solution:** Run `npx prisma generate` in build command

### **Issue 5: OAuth not working**
**Solution:** Update callback URLs in Google/GitHub OAuth settings

---

## 🔄 Continuous Deployment

Once deployed, any push to your GitHub `main` branch will automatically trigger a new deployment on:
- ✅ Vercel (auto-deploy)
- ✅ Render (auto-deploy)
- ✅ Railway (auto-deploy)
- ✅ Digital Ocean (auto-deploy)

---

## 📱 Post-Deployment

1. **Test all features:**
   - User registration/login
   - Article creation
   - AI generation
   - Image upload
   - Fact-checking
   - Research

2. **Monitor logs:**
   - Vercel: Dashboard → Logs
   - Render: Dashboard → Logs
   - Railway: Dashboard → Deployments → Logs

3. **Set up monitoring:**
   - [Sentry](https://sentry.io) for error tracking
   - [LogRocket](https://logrocket.com) for session replay
   - [Uptime Robot](https://uptimerobot.com) for uptime monitoring

---

## 🎉 You're Ready to Deploy!

**Need help?** Let me know which deployment option you'd like to use, and I'll guide you through it step-by-step.
