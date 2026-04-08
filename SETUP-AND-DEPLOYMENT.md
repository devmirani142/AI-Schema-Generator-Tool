# Advanced Schema Generator - Complete Setup Guide

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- React 18+
- Modern web browser (Chrome, Firefox, Safari)

---

## 📦 Package Configuration

### Frontend: `package.json`

```json
{
  "name": "advanced-schema-generator",
  "version": "1.0.0",
  "description": "Advanced Schema.org Generator with XPath extraction and nested schema support",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "lucide-react": "^0.263.1",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.24",
    "autoprefixer": "^10.4.14"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

### Backend: `package.json`

```json
{
  "name": "advanced-schema-generator-api",
  "version": "1.0.0",
  "description": "Backend API for Advanced Schema Generator",
  "main": "backend-api.js",
  "type": "commonjs",
  "scripts": {
    "start": "node backend-api.js",
    "dev": "nodemon backend-api.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.0",
    "cheerio": "^1.0.0-rc.12",
    "xmldom": "^0.6.0",
    "xpath": "^0.0.34",
    "puppeteer": "^21.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}
```

---

## 🚀 Quick Start

### Step 1: Frontend Setup

```bash
# Create React app (if not using existing project)
npx create-react-app schema-generator
cd schema-generator

# Install dependencies
npm install lucide-react axios

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 2: Configure Tailwind

**`tailwind.config.js`**:
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**`src/index.css`**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Step 3: Add React Component

**`src/App.jsx`**:
```javascript
import AdvancedSchemaGeneratorTool from './AdvancedSchemaGeneratorTool';

function App() {
  return (
    <div>
      <AdvancedSchemaGeneratorTool />
    </div>
  );
}

export default App;
```

### Step 4: Start Frontend

```bash
npm start
```

Frontend will be available at `http://localhost:3000`

---

## 🔧 Backend Setup

### Step 1: Create Backend Directory

```bash
mkdir schema-generator-api
cd schema-generator-api
npm init -y
```

### Step 2: Install Backend Dependencies

```bash
npm install express axios cheerio xmldom xpath puppeteer cors dotenv
npm install -D nodemon jest
```

### Step 3: Create Environment File

**`.env`**:
```
PORT=5000
NODE_ENV=development
LOG_LEVEL=info
PUPPETEER_SKIP_DOWNLOAD=false
```

### Step 4: Copy Backend API

Copy the `backend-api.js` file to the project root:
```bash
# Place backend-api.js in schema-generator-api/
cp ../backend-api.js .
```

### Step 5: Start Backend

```bash
# Development with auto-reload
npm run dev

# OR production
npm start
```

Backend API will be available at `http://localhost:5000`

---

## 🌐 Frontend Configuration

### Connect to Backend API

Update the React component to use your backend:

```javascript
// In AdvancedSchemaGeneratorTool.jsx
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const crawlWebsite = async () => {
  if (!websiteUrl) return;
  
  setIsCrawling(true);
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/crawl?url=${encodeURIComponent(websiteUrl)}`
    );
    const data = await response.json();
    
    if (data.success) {
      setCrawledUrls(data.urls);
      setSelectedUrl(data.urls[0]);
      setMode('schema');
    }
  } catch (error) {
    console.error('Crawl error:', error);
  }
  setIsCrawling(false);
};
```

Create `.env.local` in frontend root:
```
REACT_APP_API_URL=http://localhost:5000
```

---

## 📋 Full Integration Example

### Frontend + Backend Communication Flow

```
User Input
    ↓
[React Component]
    ↓
POST /api/crawl
    ↓
[Node.js Backend]
    ↓
Parse HTML, Extract Links
    ↓
Verify 200 OK Status
    ↓
Return URL List
    ↓
Display in React UI
```

### Example API Call Flow

```javascript
// 1. User enters URL and clicks Crawl
const crawlResponse = await fetch('http://localhost:5000/api/crawl?url=example.com');

// 2. Backend returns list of URLs
const { urls } = await crawlResponse.json();

// 3. User selects URL and schema type
// 4. User clicks property and enables extraction

// 5. Frontend sends XPath extraction request
const extractResponse = await fetch('http://localhost:5000/api/extract/xpath', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com/page',
    xpath: '//h1[@class="title"]'
  })
});

// 6. Backend extracts content and returns
const { results } = await extractResponse.json();

// 7. Frontend generates JSON-LD
const schema = generateJsonLd(schemaType, extractedData);

// 8. User copies or deploys schema
```

---

## 🔐 Security Configuration

### CORS Setup

**In backend (`backend-api.js`)**:
```javascript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

**In `.env`**:
```
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Request Validation

```javascript
// Add rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

### Input Sanitization

```javascript
// Sanitize user inputs
const sanitizeUrl = (url) => {
  try {
    return new URL(url).href;
  } catch {
    throw new Error('Invalid URL');
  }
};

const validateXpath = (xpath) => {
  if (!xpath || typeof xpath !== 'string') {
    throw new Error('Invalid XPath');
  }
  // Add XPath validation logic
};
```

---

## 📊 Testing

### Frontend Tests

**`src/__tests__/SchemaGenerator.test.js`**:
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import AdvancedSchemaGeneratorTool from '../AdvancedSchemaGeneratorTool';

describe('Schema Generator', () => {
  test('renders crawl mode by default', () => {
    render(<AdvancedSchemaGeneratorTool />);
    expect(screen.getByText('Website Crawler')).toBeInTheDocument();
  });

  test('enables schema selection after crawl', async () => {
    render(<AdvancedSchemaGeneratorTool />);
    // Add crawl test logic
  });
});
```

### Backend Tests

**`backend-api.test.js`**:
```javascript
const request = require('supertest');
const app = require('./backend-api');

describe('API Endpoints', () => {
  test('GET /api/health returns 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('POST /api/schema/generate creates valid schema', async () => {
    const res = await request(app)
      .post('/api/schema/generate')
      .send({
        schemaType: 'Article',
        data: { headline: 'Test', datePublished: '2024-04-07' }
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.jsonLd['@type']).toBe('Article');
  });
});
```

Run tests:
```bash
npm test
```

---

## 🐳 Docker Deployment

### Dockerfile (Frontend)

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=build /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
```

### Dockerfile (Backend)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY backend-api.js .
EXPOSE 5000
CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://backend:5000
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      PORT: 5000
    volumes:
      - ./backend:/app

volumes:
  data:
```

Deploy with Docker:
```bash
docker-compose up -d
```

---

## 🚢 Production Deployment

### Environment Setup

**Production `.env`**:
```
NODE_ENV=production
PORT=5000
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
LOG_LEVEL=warn
PUPPETEER_SKIP_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Performance Optimization

```javascript
// Add caching
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 });

// Cache crawl results
app.get('/api/crawl', async (req, res) => {
  const { url } = req.query;
  const cached = cache.get(`crawl:${url}`);
  
  if (cached) {
    return res.json({ ...cached, cached: true });
  }
  
  // Perform crawl
  const results = await performCrawl(url);
  cache.set(`crawl:${url}`, results);
  res.json(results);
});
```

### Monitoring & Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});
```

### Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start backend-api.js --name "schema-generator-api"

# Monitor
pm2 monit

# Logs
pm2 logs schema-generator-api
```

---

## 🧪 Testing Endpoints

### Using cURL

```bash
# Test health
curl http://localhost:5000/api/health

# Test crawl
curl "http://localhost:5000/api/crawl?url=https://example.com"

# Test XPath extraction
curl -X POST http://localhost:5000/api/extract/xpath \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "xpath": "//h1"
  }'

# Test schema generation
curl -X POST http://localhost:5000/api/schema/generate \
  -H "Content-Type: application/json" \
  -d '{
    "schemaType": "Article",
    "data": {
      "headline": "Test Article",
      "datePublished": "2024-04-07"
    }
  }'
```

### Using Postman

1. Import endpoints from backend API
2. Create environment variables:
   ```
   base_url: http://localhost:5000
   test_url: https://example.com
   ```
3. Test each endpoint with provided examples

---

## 📚 Additional Resources

- [Schema.org Documentation](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)
- [JSON-LD Specification](https://json-ld.org/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Puppeteer Documentation](https://pptr.dev/)

---

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# OR use different port
PORT=5001 npm start
```

### Puppeteer Installation Issues

```bash
# Install required dependencies
npm install --save-optional puppeteer

# Or use specific version
npm install puppeteer@21.0.0
```

### CORS Errors

Ensure backend is running and environment variable is set:
```javascript
REACT_APP_API_URL=http://localhost:5000
```

### XPath Not Working

1. Verify XPath in browser DevTools:
   ```javascript
   $x('//your/xpath/here')
   ```

2. Check HTML structure matches XPath
3. Test with CSS selector alternative

---

## 📝 License

This project is open source and available for commercial and personal use.

---

## Support

For issues, questions, or contributions, please refer to the documentation or contact support.

Last Updated: April 2024
