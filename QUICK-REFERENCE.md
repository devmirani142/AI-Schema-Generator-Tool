# Advanced Schema Generator - Quick Reference Guide

---

## 🚀 Quick Start (5 Minutes)

### 1. Install & Start
```bash
# Frontend
npm install && npm start

# Backend (in separate terminal)
npm install && npm run dev
```

### 2. Open Browser
```
http://localhost:3000
```

### 3. First Test
1. Enter website URL: `https://example.com`
2. Click "Crawl"
3. Select a page
4. Choose schema type
5. Extract content via clicking
6. Preview & copy JSON-LD

---

## 📡 API Endpoints Reference

### Crawling Endpoints

#### GET /api/crawl
Crawl website and discover all URLs

```bash
curl "http://localhost:5000/api/crawl?url=https://example.com&depth=2&maxPages=100"
```

**Response:**
```json
{
  "success": true,
  "totalUrls": 45,
  "urls": ["https://example.com/", "https://example.com/about", ...],
  "timestamp": "2024-04-07T10:30:00Z"
}
```

#### POST /api/crawl/advanced
Crawl with JavaScript rendering

```bash
curl -X POST http://localhost:5000/api/crawl/advanced \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "depth": 2, "timeout": 30000}'
```

---

### Extraction Endpoints

#### POST /api/extract/xpath
Extract content using XPath

```bash
curl -X POST http://localhost:5000/api/extract/xpath \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/page",
    "xpath": "//h1[@class=\"title\"]"
  }'
```

**Response:**
```json
{
  "success": true,
  "xpath": "//h1[@class=\"title\"]",
  "resultCount": 1,
  "results": [
    {
      "text": "Page Title",
      "html": "<h1 class=\"title\">Page Title</h1>",
      "nodeName": "h1"
    }
  ]
}
```

#### POST /api/extract/css-selector
Extract content using CSS selectors

```bash
curl -X POST http://localhost:5000/api/extract/css-selector \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "selector": ".product-title"
  }'
```

#### POST /api/extract/batch
Extract multiple properties from single URL

```bash
curl -X POST http://localhost:5000/api/extract/batch \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/product",
    "extractions": [
      {"property": "name", "xpath": "//h1[@class=\"title\"]"},
      {"property": "price", "xpath": "//span[@class=\"price\"]"},
      {"property": "description", "xpath": "//p[@class=\"desc\"]"}
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "url": "https://example.com/product",
  "extractedData": {
    "name": "Product Name",
    "price": "$99.99",
    "description": "Product description..."
  },
  "errors": []
}
```

---

### Schema Generation Endpoints

#### POST /api/schema/generate
Generate JSON-LD schema

```bash
curl -X POST http://localhost:5000/api/schema/generate \
  -H "Content-Type: application/json" \
  -d '{
    "schemaType": "Product",
    "data": {
      "name": "Product Name",
      "price": "99.99",
      "description": "Description"
    },
    "nested": [
      {
        "parentProperty": "author",
        "type": "Person",
        "data": {"name": "John Doe"}
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "jsonLd": {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Product Name",
    "price": "99.99"
  },
  "html": "<script type=\"application/ld+json\">...</script>"
}
```

#### POST /api/schema/validate
Validate JSON-LD structure

```bash
curl -X POST http://localhost:5000/api/schema/validate \
  -H "Content-Type: application/json" \
  -d '{
    "jsonLd": {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Test"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "errors": [],
  "warnings": []
}
```

---

### Batch Processing Endpoints

#### POST /api/batch/extract-to-schema
Process multiple URLs and generate schemas

```bash
curl -X POST http://localhost:5000/api/batch/extract-to-schema \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://example.com/product1",
      "https://example.com/product2"
    ],
    "schemaConfig": {
      "type": "Product",
      "extractions": [
        {"property": "name", "xpath": "//h1"},
        {"property": "price", "xpath": "//span[@class=\"price\"]"}
      ]
    }
  }'
```

---

### Utility Endpoints

#### GET /api/health
Check API health

```bash
curl http://localhost:5000/api/health
```

#### GET /api/schemas
Get all supported schema types

```bash
curl http://localhost:5000/api/schemas
```

---

## 📝 XPath Cheat Sheet

### Basic Patterns

```xpath
# Select all elements with tag name
//div

# Select element with specific ID
//*[@id="main"]
//*[@id='main']

# Select element with specific class
//*[@class="product"]
//*[contains(@class, "product")]

# Select element with attribute
//img[@alt="Product"]
//a[@href*="example.com"]

# Select by position
//p[1]          # First <p>
//p[last()]     # Last <p>
//p[position()=2]  # Second <p>

# Select by text content
//*[text()="Click Me"]
//*[contains(text(), "Search")]

# Multiple conditions
//div[@id="main"][@class="container"]
//h1[@class="title" and @data-type="main"]

# Get attribute value
//img/@src
//a/@href

# Parent/child relationships
//div[@id="content"]/p
//article//h1
//div/..  # Parent of div

# All descendants
//*[@class="container"]//*
```

### Common Examples

```xpath
# Product title
//h1[@class="product-title"]

# Product price
//span[@class="price" or @class="product-price"]

# Product image
//img[@class="product-image"]/@src

# Price from specific div
//div[@id="pricing"]//span[@class="amount"]

# All links in navigation
//nav//a

# All paragraphs in article
//article//p

# Element containing specific text
//button[contains(text(), "Add to Cart")]

# Date published (meta tag)
//meta[@property="article:published_time"]/@content

# Rating value
//span[@itemprop="ratingValue"]

# Author name (various selectors)
//span[@class="author-name"]
//div[@itemprop="author"]//span[@class="name"]
```

---

## 🔧 React Component Usage

### Basic Implementation

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

### Configuration

```javascript
// Set API endpoint
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// In .env.local
REACT_APP_API_URL=http://localhost:5000
```

### State Management

```javascript
// Crawled URLs
const [crawledUrls, setCrawledUrls] = useState([]);

// Selected page & schema
const [selectedUrl, setSelectedUrl] = useState('');
const [selectedSchemaType, setSelectedSchemaType] = useState('');

// Extracted data
const [schemaData, setSchemaData] = useState({});
const [xpathMappings, setXpathMappings] = useState({});

// Nested schemas
const [nestedSchemas, setNestedSchemas] = useState([]);
```

---

## 🎯 Common Tasks

### Extract Product Data

```javascript
const productXpaths = {
  name: "//h1[@class='product-name']",
  price: "//span[@class='price']",
  description: "//div[@class='description']",
  image: "//img[@class='product-image']/@src",
  sku: "//span[@class='sku']"
};

// Apply to product page
extractBatch('https://example.com/product-1', productXpaths);
```

### Generate Article Schema

```javascript
const articleData = {
  headline: "Article Title",
  datePublished: "2024-04-07T10:00:00Z",
  author: { name: "Author Name" },
  description: "Article description...",
  image: "https://example.com/image.jpg"
};

generateSchema('Article', articleData);
```

### Create Nested Schema

```javascript
const productWithReviews = {
  name: "Product",
  price: "99.99",
  reviews: [
    { "@type": "Review", "author": "John", "reviewRating": 5 },
    { "@type": "Review", "author": "Jane", "reviewRating": 4 }
  ]
};
```

### Batch Process URLs

```javascript
const urls = await crawlWebsite('https://example.com');

const results = await batchExtractToSchema(urls, {
  type: 'Product',
  extractions: productXpaths
});

console.log(`Processed ${results.length} pages`);
```

---

## 🛠️ Troubleshooting

### XPath Not Finding Elements

**Issue**: XPath returns empty results

**Solutions**:
```javascript
// 1. Test in browser DevTools
$x('//your/xpath/here')

// 2. Try alternative selectors
$x("//h1[@class='title']")
$x("//h1[contains(@class, 'title')]")
$x("//h1[text()='Title']")

// 3. Check if content is dynamic (JavaScript-rendered)
// Use /api/crawl/advanced instead

// 4. Verify HTML structure with inspect element
```

### API Connection Errors

**Issue**: `fetch failed`, `CORS error`

**Solutions**:
```javascript
// Check backend is running
curl http://localhost:5000/api/health

// Verify API URL in .env
REACT_APP_API_URL=http://localhost:5000

// Check CORS settings in backend
app.use(cors({
  origin: 'http://localhost:3000'
}));
```

### Schema Validation Fails

**Issue**: Generated schema is invalid

**Check**:
```bash
# 1. Validate schema
curl -X POST http://localhost:5000/api/schema/validate \
  -d '{"jsonLd": {...}}'

# 2. Verify against schema.org
# https://schema.org/validator/

# 3. Check required properties are present
# Product: name, offers
# Article: headline, datePublished, author
```

### Puppeteer Installation Issues

**Issue**: Puppeteer fails to install

**Solution**:
```bash
npm install --save-optional puppeteer

# Or specify specific version
npm install puppeteer@21.0.0

# Install system dependencies (Linux)
apt-get install -y libgconf-2-4 libxss1 libappindicator1 libindicator7
```

---

## 📊 Performance Tips

### Optimize Crawling
- Set reasonable `maxPages` limit (default: 100)
- Use pagination offsets for large sites
- Cache crawl results for reuse

### Optimize Extraction
- Use specific XPath (not `//div`)
- Extract only needed properties
- Batch multiple extractions per URL

### Optimize Processing
- Process URLs in parallel (batches of 10)
- Cache HTTP responses
- Reuse compiled XPath queries

### Memory Management
```javascript
// Clear unused data
setNestedSchemas([]);
setXpathMappings({});

// Unload old iframe
setIframeKey(prev => prev + 1);
```

---

## 🔐 Security Checklist

- [ ] Validate all URLs (no javascript:, data:)
- [ ] Sanitize extracted text content
- [ ] Validate XPath syntax
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Add request timeout
- [ ] Validate JSON-LD @context
- [ ] Never expose sensitive data in schema

---

## 📚 Schema Type Quick Reference

### Required Properties

| Schema | Required |
|--------|----------|
| Article | headline, datePublished, author |
| Product | name, offers |
| Organization | name |
| Person | name |
| Event | name, startDate, endDate, location |
| Recipe | name, ingredients, instructions |
| LocalBusiness | name, address, telephone |
| FAQPage | mainEntity |
| NewsArticle | headline, datePublished |
| Review | reviewRating, author |

### Generate Sample Data

```javascript
// Generate schema with sample data
const sampleData = {
  Article: {
    headline: "Sample Article",
    datePublished: new Date().toISOString(),
    author: { name: "Author" }
  },
  Product: {
    name: "Sample Product",
    offers: { price: "99.99", priceCurrency: "USD" }
  }
};
```

---

## 🎓 Learning Path

1. **Beginner**: Simple XPath extraction from product pages
2. **Intermediate**: Batch processing with pattern reuse
3. **Advanced**: Nested schemas with complex relationships
4. **Expert**: Custom schema types and extensions

---

## 📞 Support Resources

- **Schema.org**: https://schema.org/
- **XPath Documentation**: https://developer.mozilla.org/en-US/docs/Web/XPath
- **Google Search Central**: https://developers.google.com/search
- **JSON-LD Spec**: https://json-ld.org/
- **Rich Results Test**: https://search.google.com/test/rich-results

---

## 🎯 Next Steps

1. ✅ Start with simple product page
2. ✅ Master XPath for your use case
3. ✅ Batch process similar pages
4. ✅ Add nested schemas as needed
5. ✅ Deploy to production
6. ✅ Monitor in Search Console

---

**Last Updated**: April 2024 | **Version**: 1.0.0
