# AI Newsroom - Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Docker Desktop installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Steps

1. **Get your OpenAI API key**
   - Visit https://platform.openai.com/api-keys
   - Create a new API key
   - Copy it (you'll need it in step 3)

2. **Run the setup script**
   
   **Windows (PowerShell):**
   ```powershell
   .\start.ps1
   ```
   
   **Mac/Linux:**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

3. **Configure your environment**
   - When prompted, edit the `.env` file
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY=sk-your-key-here
     ```
   - Save and close

4. **Access the application**
   - Open http://localhost:3000
   - Create an account
   - Start creating AI-powered articles!

## 🎯 First Steps

### Create Your First Article

1. Click **"New Article"** button
2. Enter a topic (e.g., "The Future of AI in Journalism")
3. Click **"Generate Article"** in the AI panel
4. Watch as AI creates a complete article!

### Try AI Features

- **Research**: Click "Research Topic" to gather information
- **Fact Check**: Select text and click "Fact Check" to verify claims
- **Images**: Click "Generate Image" to create visuals
- **Edit**: Use the rich text editor to refine content

## 🔧 Manual Setup (without Docker)

If you prefer not to use Docker:

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Database
- Install PostgreSQL 15+
- Create database: `ai_newsroom`
- Update DATABASE_URL in backend/.env

## 📚 Learn More

- [Full Documentation](README.md)
- [API Reference](README.md#-api-endpoints)
- [Troubleshooting](README.md#-troubleshooting)

## ❓ Common Issues

**Docker not starting?**
- Make sure Docker Desktop is running
- Try: `docker-compose down && docker-compose up -d`

**AI features not working?**
- Check your OpenAI API key in `.env`
- Verify you have API credits
- Restart: `docker-compose restart backend`

**Can't access the site?**
- Wait 30 seconds for containers to start
- Check containers: `docker-compose ps`
- View logs: `docker-compose logs -f`

## 🆘 Need Help?

Open an issue on GitHub with:
- Error message
- Output of `docker-compose logs`
- Your operating system

---

Happy writing! 📝
