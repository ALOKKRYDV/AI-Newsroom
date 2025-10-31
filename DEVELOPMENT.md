# Development Guide

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Git
- Code editor (VS Code recommended)

### Local Development (Without Docker)

#### 1. Clone and Setup

```bash
git clone <repository-url>
cd ai-newsroom
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your settings

# Setup database
npx prisma migrate dev --name init
npx prisma generate

# Start development server
npm run dev
```

Backend will run on http://localhost:5000

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on http://localhost:3000

### Database Management

#### Create Migration
```bash
cd backend
npx prisma migrate dev --name migration_name
```

#### Reset Database
```bash
npx prisma migrate reset
```

#### Open Prisma Studio
```bash
npx prisma studio
```

Access at http://localhost:5555

#### Seed Database (Optional)

Create `backend/prisma/seed.js`:
```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      provider: 'local'
    }
  });
  
  console.log('✅ Database seeded');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

Run: `npx prisma db seed`

---

## 📁 Project Architecture

### Backend Architecture

```
backend/src/
├── config/           # Configuration files
│   ├── database.js   # Prisma client
│   └── passport.js   # Auth strategies
├── middleware/       # Express middleware
│   ├── auth.middleware.js
│   └── error.middleware.js
├── routes/           # API routes
│   ├── auth.routes.js
│   ├── article.routes.js
│   └── ai.routes.js
├── services/         # Business logic
│   └── ai.service.js
└── index.js          # App entry point
```

### Frontend Architecture

```
frontend/src/
├── components/       # Reusable components
├── pages/           # Route pages
├── store/           # Zustand stores
├── utils/           # Utilities
├── App.jsx          # Main app component
└── main.jsx         # Entry point
```

---

## 🎨 Adding New Features

### Add New API Endpoint

1. **Create Route Handler** (`backend/src/routes/myfeature.routes.js`)

```javascript
const express = require('express');
const { auth } = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/my-endpoint', auth, async (req, res) => {
  try {
    // Your logic here
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

2. **Register Route** (`backend/src/index.js`)

```javascript
const myFeatureRoutes = require('./routes/myfeature.routes');
app.use('/api/myfeature', myFeatureRoutes);
```

### Add New AI Agent

Update `backend/src/services/ai.service.js`:

```javascript
async myNewAgent(input) {
  try {
    const prompt = `Your prompt here: ${input}`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'System prompt' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    return {
      success: true,
      data: response.choices[0].message.content
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Add New Database Model

1. **Update Schema** (`backend/prisma/schema.prisma`)

```prisma
model MyNewModel {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

2. **Create Migration**

```bash
npx prisma migrate dev --name add_my_new_model
```

### Add New Frontend Page

1. **Create Page Component** (`frontend/src/pages/MyPage.jsx`)

```jsx
import React from 'react';

export default function MyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">My New Page</h1>
    </div>
  );
}
```

2. **Add Route** (`frontend/src/App.jsx`)

```jsx
import MyPage from './pages/MyPage';

<Route path="/my-page" element={
  <PrivateRoute>
    <MyPage />
  </PrivateRoute>
} />
```

---

## 🧪 Testing

### Backend Testing

Install testing dependencies:
```bash
cd backend
npm install --save-dev jest supertest
```

Create test file (`backend/src/routes/__tests__/article.test.js`):

```javascript
const request = require('supertest');
const app = require('../index');

describe('Article API', () => {
  it('should create article', async () => {
    const res = await request(app)
      .post('/api/articles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Article',
        content: 'Test content'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
});
```

### Frontend Testing

Install testing dependencies:
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

---

## 🐛 Debugging

### Backend Debugging

Add to `backend/package.json`:
```json
{
  "scripts": {
    "debug": "node --inspect src/index.js"
  }
}
```

In VS Code, create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "program": "${workspaceFolder}/backend/src/index.js",
      "envFile": "${workspaceFolder}/backend/.env"
    }
  ]
}
```

### Frontend Debugging

Use React DevTools browser extension

Enable source maps in `vite.config.js`:
```javascript
export default defineConfig({
  build: {
    sourcemap: true
  }
});
```

---

## 📊 Monitoring

### Add Logging

```bash
cd backend
npm install winston
```

Create `backend/src/config/logger.js`:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

Use in routes:
```javascript
const logger = require('../config/logger');

logger.info('Article created', { articleId: article.id });
logger.error('Failed to create article', { error: error.message });
```

---

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=your-production-db-url
JWT_SECRET=long-random-secret
OPENAI_API_KEY=your-api-key
FRONTEND_URL=https://your-domain.com
```

### Build Frontend for Production

```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

### Deploy to Heroku

```bash
# Login
heroku login

# Create app
heroku create ai-newsroom-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set OPENAI_API_KEY=your-key

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

### Deploy to Vercel (Frontend)

```bash
npm install -g vercel
cd frontend
vercel
```

### Deploy to Docker Registry

```bash
# Build
docker build -t your-registry/ai-newsroom-backend:latest ./backend
docker build -t your-registry/ai-newsroom-frontend:latest ./frontend

# Push
docker push your-registry/ai-newsroom-backend:latest
docker push your-registry/ai-newsroom-frontend:latest
```

---

## 🔧 Common Development Tasks

### Update Dependencies

```bash
npm outdated
npm update
```

### Check for Security Issues

```bash
npm audit
npm audit fix
```

### Format Code

Install Prettier:
```bash
npm install --save-dev prettier
```

Create `.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Lint Code

Install ESLint:
```bash
npm install --save-dev eslint
npx eslint --init
```

---

## 📚 Useful Commands

### Backend
```bash
npm run dev              # Start development server
npm start                # Start production server
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create migration
npx prisma generate      # Generate Prisma client
```

### Frontend
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
```

### Docker
```bash
docker-compose up -d     # Start all services
docker-compose down      # Stop all services
docker-compose logs -f   # View logs
docker-compose ps        # List containers
docker-compose restart   # Restart services
```

---

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
```

### Database Connection Issues

1. Check PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Run migrations: `npx prisma migrate dev`
4. Check firewall settings

### OpenAI API Errors

1. Verify API key is correct
2. Check API quota/billing
3. Review rate limits
4. Check error logs

---

## 📖 Resources

- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [OpenAI API Docs](https://platform.openai.com/docs/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Docker Docs](https://docs.docker.com/)

---

Happy coding! 🚀
