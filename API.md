# AI Newsroom API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "WRITER"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### OAuth Login
```http
GET /auth/google
GET /auth/github
```

---

## Article Endpoints

### Create Article
```http
POST /articles
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Article Title",
  "content": "<p>Article content...</p>",
  "tags": ["technology", "ai"]
}
```

### Get Articles
```http
GET /articles?page=1&limit=10&status=PUBLISHED&search=AI
Authorization: Bearer <token>
```

### Get Single Article
```http
GET /articles/:id
Authorization: Bearer <token>
```

### Update Article
```http
PATCH /articles/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "<p>Updated content...</p>",
  "status": "IN_REVIEW"
}
```

### Delete Article
```http
DELETE /articles/:id
Authorization: Bearer <token>
```

### Publish Article
```http
POST /articles/:id/publish
Authorization: Bearer <token>
```
*Requires EDITOR or ADMIN role*

### Subscribe to Article Updates (SSE)
```http
GET /articles/stream/:id
Authorization: Bearer <token>
```

**Event Types:**
- `connected` - Initial connection
- `article-updated` - Article was updated
- `article-published` - Article was published

---

## AI Endpoints

### Research Agent
```http
POST /ai/research
Authorization: Bearer <token>
Content-Type: application/json

{
  "topic": "Climate change impacts",
  "keywords": ["global warming", "carbon emissions"],
  "articleId": "optional-article-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": "{\"keyFacts\": [...], \"perspectives\": [...], \"sources\": [...]}"
}
```

### Generate Article
```http
POST /ai/generate-article
Authorization: Bearer <token>
Content-Type: application/json

{
  "brief": "Write about renewable energy trends",
  "style": "professional",
  "sources": [
    {
      "title": "Source Title",
      "summary": "Source summary"
    }
  ],
  "articleId": "optional-article-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": "{\"title\": \"...\", \"content\": \"...\", \"suggestedTags\": [...]}"
}
```

### Fact Check
```http
POST /ai/fact-check
Authorization: Bearer <token>
Content-Type: application/json

{
  "claim": "The Earth is round",
  "context": "Optional context",
  "articleId": "optional-article-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": "{\"verdict\": \"true\", \"explanation\": \"...\", \"confidence\": 0.95, \"sources\": [...]}"
}
```

### Editorial Review
```http
POST /ai/editorial-review
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "<p>Article content to review...</p>",
  "guidelines": {
    "tone": "professional",
    "targetAudience": "general",
    "maxLength": 1000
  },
  "articleId": "optional-article-uuid"
}
```

### Generate Image
```http
POST /ai/generate-image
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "A futuristic newsroom with AI assistants",
  "style": "photorealistic"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://...",
  "revisedPrompt": "..."
}
```

### Generate Caption
```http
POST /ai/generate-caption
Authorization: Bearer <token>
Content-Type: application/json

{
  "imageDescription": "Photo of a newsroom",
  "articleContext": "Article about journalism"
}
```

### Assess Source Credibility
```http
POST /ai/assess-source
Authorization: Bearer <token>
Content-Type: application/json

{
  "sourceUrl": "https://example.com/article",
  "sourceContent": "Sample content from the source..."
}
```

---

## Source & Citation Endpoints

### Add Source
```http
POST /sources
Authorization: Bearer <token>
Content-Type: application/json

{
  "articleId": "article-uuid",
  "url": "https://source.com/article",
  "title": "Source Title",
  "publisher": "Publisher Name",
  "publishedAt": "2024-01-01T00:00:00Z",
  "summary": "Brief summary"
}
```

### Get Article Sources
```http
GET /sources/article/:articleId
Authorization: Bearer <token>
```

### Add Citation
```http
POST /sources/citations
Authorization: Bearer <token>
Content-Type: application/json

{
  "articleId": "article-uuid",
  "sourceId": "source-uuid",
  "quote": "Quoted text from source",
  "context": "Context around the quote",
  "position": 150
}
```

---

## Comment Endpoints

### Add Comment
```http
POST /comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "articleId": "article-uuid",
  "content": "This is a great article!",
  "parentId": "optional-parent-comment-uuid"
}
```

### Get Article Comments
```http
GET /comments/article/:articleId
Authorization: Bearer <token>
```

### Update Comment
```http
PATCH /comments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated comment",
  "resolved": true
}
```

---

## User Endpoints

### Get Current User
```http
GET /users/me
Authorization: Bearer <token>
```

### Update Profile
```http
PATCH /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Name",
  "avatar": "https://avatar-url.com/image.jpg"
}
```

### Get User Stats
```http
GET /users/me/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "articlesCount": 15,
  "publishedCount": 10,
  "commentsCount": 42
}
```

---

## Notification Endpoints

### Get Notifications
```http
GET /notifications?unreadOnly=true&limit=20
Authorization: Bearer <token>
```

### Mark as Read
```http
PATCH /notifications/:id/read
Authorization: Bearer <token>
```

### Mark All as Read
```http
POST /notifications/read-all
Authorization: Bearer <token>
```

---

## Error Responses

All endpoints may return these error responses:

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "stack": "..." // Only in development
}
```

---

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Authenticated: 1000 requests per 15 minutes per user

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response Format:**
```json
{
  "articles": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

---

## WebSocket/SSE Events

### Article Stream
Connect to `/articles/stream/:id` for real-time updates:

**Events:**
```javascript
// Connection established
{
  "type": "connected",
  "clientId": "client-uuid"
}

// Article updated
{
  "type": "article-updated",
  "article": { /* article data */ },
  "updatedBy": "user-uuid"
}

// Article published
{
  "type": "article-published",
  "article": { /* article data */ }
}
```

---

## Example Usage

### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:5000/api/articles', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'My Article',
    content: '<p>Content here</p>'
  })
});

const data = await response.json();
```

### Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data } = await api.post('/articles', {
  title: 'My Article',
  content: '<p>Content here</p>'
});
```

### SSE (Server-Sent Events)
```javascript
const eventSource = new EventSource(
  'http://localhost:5000/api/articles/stream/article-uuid'
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```
