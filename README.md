# AI Newsroom Collaboration Tool

A full-stack collaborative AI content generation platform for journalists, featuring multi-agent workflows for research, writing, editing, and fact-checking.

## 🚀 Features

### Core Features
- **AI-Powered Article Generation**: Generate articles using GPT-4/Claude 3.5
- **Multi-Agent Workflows**:
  - Research Agent: Gather sources and information
  - Writing Agent: Draft articles with proper structure
  - Fact-Checking Agent: Verify claims and sources
  - Editorial Agent: Review for style and tone consistency
- **Rich Text Editor**: Full-featured editor with citation management (Quill)
- **Image Generation**: AI-powered image creation with DALL-E
- **Real-Time Collaboration**: Live updates via Server-Sent Events (SSE)
- **Version Control**: Track article changes and revisions
- **Comments & Collaboration**: Real-time commenting system
- **Source Management**: Track and assess source credibility

### Authentication
- JWT-based authentication
- OAuth integration (Google & GitHub)
- Role-based access control (Writer, Editor, Admin)

### Tech Stack
- **Frontend**: React 18, TailwindCSS, React Quill, Zustand, React Router
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL
- **AI**: OpenAI GPT-4, DALL-E 3, Claude 3.5 (optional)
- **Real-Time**: Server-Sent Events (SSE)
- **Deployment**: Docker, Docker Compose

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+ (or use Docker)
- OpenAI API key
- (Optional) Anthropic API key for Claude
- (Optional) Google OAuth credentials
- (Optional) GitHub OAuth credentials

## 🛠️ Installation

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-newsroom
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   JWT_SECRET=your-jwt-secret
   OPENAI_API_KEY=your-openai-api-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

### Option 2: Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your credentials

4. **Setup database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start backend server**
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## 🎯 Usage

### Creating Your First Article

1. **Register an account** at http://localhost:3000/register
2. **Login** with your credentials
3. **Click "New Article"** in the navbar
4. **Use AI assistance**:
   - Enter a topic or brief
   - Click "Generate Article" to create a draft
   - Use "Research Topic" to gather information
   - Select text and click "Fact Check" to verify claims
   - Click "Generate Image" to create visuals

### Multi-Agent Workflow

The platform includes specialized AI agents:

#### Research Agent
```javascript
// Automatically gathers relevant information
- Key facts and statistics
- Multiple perspectives
- Credible sources
- Context and background
```

#### Writing Agent
```javascript
// Drafts professional articles
- Compelling headlines
- Strong lead paragraphs
- Well-structured content
- Proper citations
```

#### Fact-Checking Agent
```javascript
// Verifies claims
- Checks factual accuracy
- Provides confidence scores
- Cites verification sources
- Identifies nuances
```

#### Editorial Agent
```javascript
// Reviews and improves content
- Style consistency
- Tone alignment
- Readability optimization
- SEO suggestions
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/github` - GitHub OAuth

#### Articles
- `GET /api/articles` - List articles
- `GET /api/articles/:id` - Get article
- `POST /api/articles` - Create article
- `PATCH /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `GET /api/articles/stream/:id` - SSE subscription

#### AI Services
- `POST /api/ai/research` - Research agent
- `POST /api/ai/generate-article` - Writing agent
- `POST /api/ai/fact-check` - Fact-checking agent
- `POST /api/ai/editorial-review` - Editorial agent
- `POST /api/ai/generate-image` - Image generation
- `POST /api/ai/generate-caption` - Caption generation

## 🔧 Configuration

### OAuth Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Secret to `.env`

#### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Set callback URL: `http://localhost:5000/api/auth/github/callback`
4. Copy Client ID and Secret to `.env`

### Database Schema

The application uses Prisma ORM with PostgreSQL. Key models:

- **User**: User accounts with roles
- **Article**: News articles with version control
- **Source**: Article sources and references
- **Citation**: Inline citations
- **Comment**: Collaborative comments
- **FactCheck**: AI fact-checking results
- **AgentLog**: AI agent interaction logs

## 🚢 Deployment

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

### Production Deployment

For production deployment on platforms like Heroku, Vercel, or AWS:

1. **Backend (Node.js)**:
   - Set environment variables
   - Configure PostgreSQL database
   - Run migrations: `npx prisma migrate deploy`

2. **Frontend (React)**:
   - Build: `npm run build`
   - Deploy to static hosting (Netlify, Vercel)
   - Update API URL in production

## 📊 Success Metrics (Future Implementation)

- Article quality scores
- Fact-checking accuracy rates
- Time to publication improvement
- Collaboration metrics
- AI agent performance tracking

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenAI for GPT-4 and DALL-E APIs
- Anthropic for Claude AI
- React Quill for rich text editing
- Prisma for database ORM
- TailwindCSS for styling

## 🐛 Troubleshooting

### Common Issues

**Database connection failed**
```bash
# Check PostgreSQL is running
docker-compose ps

# Reset database
docker-compose down -v
docker-compose up -d
```

**Frontend can't connect to backend**
- Ensure backend is running on port 5000
- Check CORS settings in backend
- Verify proxy configuration in vite.config.js

**AI features not working**
- Verify OpenAI API key in .env
- Check API quota and billing
- Review backend logs for errors

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for journalists and content creators
