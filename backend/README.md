# BrightPath Backend

A simple Node.js backend server that handles AI API calls for the BrightPath learning platform.

## Features

- 🤖 AI-powered tutoring chat
- 📝 Whiteboard content analysis
- 💡 Concept explanations
- ⚡ Rate limiting for API protection
- 🔒 CORS and security middleware
- 📊 Health monitoring

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
AI_API_KEY=your-actual-api-key-here
AI_API_BASE_URL=https://api.aimlapi.com/v1
FRONTEND_URL=http://localhost:5173/
```

### 3. Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- **GET** `/health` - Server health status

### AI Services
- **GET** `/api/ai/status` - AI service status and rate limits
- **POST** `/api/ai/chat` - Chat with AI tutor
- **POST** `/api/ai/analyze` - Analyze whiteboard content
- **POST** `/api/ai/explain` - Get concept explanations

### Example API Calls

#### Chat with Tutor
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "history": [
      {"role": "user", "content": "I need help with algebra"}
    ],
    "subject": "math"
  }'
```

#### Analyze Board
```bash
curl -X POST http://localhost:5000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "strokes": [],
    "subject": "math",
    "sessionTitle": "Algebra Practice"
  }'
```

## Rate Limiting

- **Global**: 100 requests per 15 minutes per IP
- **AI Endpoints**: 20 requests per minute per IP
- **AI Service**: 10 calls per minute (internal)

## Security Features

- CORS protection
- Helmet security headers
- Request validation
- Rate limiting
- Input sanitization

## Development

The server uses:
- **Express.js** for the web framework
- **TypeScript** for type safety
- **OpenAI** for AI integrations
- **Nodemon** for development auto-reload

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `AI_API_KEY` | OpenAI API key | Required |
| `AI_API_BASE_URL` | AI API base URL | `https://api.aimlapi.com/v1` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173/` |
