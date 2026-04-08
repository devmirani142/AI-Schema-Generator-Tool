# Advanced Schema.org Generator Tool - Complete Documentation

## Overview

The Advanced Schema Generator is a production-ready React application for creating, managing, and deploying complex Schema.org structured data across websites. It combines website crawling, intelligent property extraction via XPath, and support for nested schema structures.

---

## Core Features

### 1. **Website Crawling**
- Input any website URL to discover all accessible pages
- Automatic detection of URLs returning 200 OK status
- Simulated crawl mode for demo (can integrate real crawler)
- Support for large websites with pagination handling

### 2. **Schema Type Selection**
- Pre-loaded 14+ popular Schema.org types:
  - `Article`, `NewsArticle`, `BlogPosting`
  - `Product`, `Offer`, `AggregateRating`, `Review`
  - `Person`, `Organization`, `LocalBusiness`
  - `Event`, `Place`, `Recipe`
  - `VideoObject`, `FAQPage`, `Question`, `Answer`
  - And more...

### 3. **Dynamic Property Management**
- Automatic distinction between Required and Optional properties
- Real-time property validation
- Visual indicators showing completed properties
- Support for custom property additions

### 4. **XPath-Based Content Extraction**
- **Click-to-Extract**: Select text directly from webpage preview
- **Automatic XPath Generation**: System generates precise XPath queries
- **XPath Mapping Storage**: Reusable across similar pages
- **Text Content Isolation**: Extracts clean text without HTML markup
- **Visual Feedback**: Highlights extracted elements in green

### 5. **Nested Schema Support**
- Add multiple nested entities within a single schema
- Example: Article with multiple Author entities
- Automatic JSON-LD array structure generation
- Deep nesting support for complex relationships

### 6. **JSON-LD Generation & Export**
- Real-time JSON-LD output generation
- HTML script tag formatting
- One-click clipboard copy
- Pretty-printed JSON with proper indentation

---

## Workflow: Step-by-Step

### **Step 1: Crawl Website**
```
1. Enter homepage URL (e.g., https://example.com)
2. Click "Crawl" button
3. Wait for page discovery completion
4. View all discovered URLs in the list
```

**Output**: List of all crawlable pages on the website

### **Step 2: Select Page & Schema Type**
```
1. Click on any discovered URL
2. Navigate to "Schema" tab
3. Choose appropriate schema type for the page
   (Product page → Product schema)
   (Blog post → Article schema)
```

**Output**: Selected page and schema type

### **Step 3: Extract Content via XPath**
```
1. Stay in "Extract" tab
2. Click a property name on the left panel
3. Click "Enable Extraction" to activate selection mode
4. Click the content you want to extract from the page preview
5. System generates XPath and populates the property
6. Repeat for all required properties
```

**Output**: Populated schema data with XPath mappings

### **Step 4: Add Nested Schemas (Optional)**
```
1. In Extract tab, look for properties that support nested schemas
   (e.g., "offers" for Product, "author" for Article)
2. Click "+" to add nested entity
3. Select nested schema type
4. Extract properties for nested schema
```

**Output**: Complex multi-level schema structure

### **Step 5: Preview & Export**
```
1. Click "Preview" tab
2. Review generated JSON-LD
3. Copy to clipboard or generate HTML script tag
4. Deploy to website
```

**Output**: Ready-to-deploy JSON-LD structured data

---

## Schema Type Details

### **Article Schema**
```
Required: headline, datePublished, author
Optional: description, image, articleBody, wordCount, dateModified
Nesting: author (Person), image (ImageObject)
```

### **Product Schema**
```
Required: name, offers
Optional: description, image, brand, sku, aggregateRating, reviews
Nesting: offers (Offer), aggregateRating (AggregateRating), reviews (Review[])
```

### **Organization Schema**
```
Required: name
Optional: url, logo, description, email, telephone, address, foundingDate
Nesting: address (PostalAddress), contact (ContactPoint)
```

### **Event Schema**
```
Required: name, startDate, endDate, location
Optional: description, image, url, offers, organizer, performer
Nesting: location (Place), organizer (Person/Organization), performer (Person/Organization[])
```

### **FAQPage Schema**
```
Required: mainEntity
Optional: -
Nesting: mainEntity (Question[]) → Question.acceptedAnswer (Answer)
```

---

## XPath Extraction Guide

### What is XPath?
XPath (XML Path Language) is a query language for selecting nodes in an HTML/XML document.

### Examples:
```
/html/body/div/p              → All <p> tags inside specific div
//h1[@class="title"]          → Any <h1> with class="title"
//div[@id="main"]/article/h2  → <h2> inside article in main div
//*[contains(text(), "Price")] → Any element containing text "Price"
```

### How the Tool Generates XPath:
1. User clicks an element in page preview
2. Tool traverses DOM to root
3. Creates path with tag names and indices
4. Stores mapping for future use

### Example: Extracting Product Title
```
Page: example.com/product/blue-widget
User clicks: "Blue Widget Pro 2024"
Generated XPath: /html/body/main/div[1]/div[2]/h1[1]
Preview: "Blue Widget Pro 2024"
Schema Property: name
```

### Reusing XPath Mappings:
Once extracted, XPaths are stored and can be applied to similar pages:
```
Product 1: /products/item-001
Product 2: /products/item-002
Same XPath for title: //h1[@class="product-title"]
Apply once → use on all product pages
```

---

## Advanced Features

### **Nested Schema Architecture**

#### Simple Nesting (Product with Offer):
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Blue Widget",
  "offers": {
    "@type": "Offer",
    "price": "19.99",
    "priceCurrency": "USD"
  }
}
```

#### Array Nesting (Article with Multiple Authors):
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Use Schema",
  "author": [
    {
      "@type": "Person",
      "name": "John Doe"
    },
    {
      "@type": "Person",
      "name": "Jane Smith"
    }
  ]
}
```

#### Deep Nesting (FAQ with Questions and Answers):
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is JSON-LD?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JSON-LD is a method for encoding linked data..."
      }
    }
  ]
}
```

### **XPath Mapping Storage**

The tool stores all XPath mappings for reuse:

```javascript
xpathMappings = {
  "headline": {
    xpath: "/html/body/main/article/h1[1]",
    preview: "Article Title Text"
  },
  "datePublished": {
    xpath: "//span[@class='publish-date']",
    preview: "2024-04-07"
  }
}
```

**Benefits:**
- Apply same XPaths to multiple pages of same type
- Update mappings globally when page structure changes
- Track extraction patterns across website

---

## Integration Guide

### **Backend Setup (For Real Crawling)**

#### 1. Add Crawler Endpoint:
```javascript
// Node.js/Express example
const axios = require('axios');
const cheerio = require('cheerio');

app.get('/api/crawl', async (req, res) => {
  const { url } = req.query;
  
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    const urls = [];
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href');
      const absoluteUrl = new URL(href, url).href;
      urls.push(absoluteUrl);
    });
    
    // Verify 200 OK status for each URL
    const verified = await Promise.all(
      [...new Set(urls)].map(async (u) => {
        try {
          const head = await axios.head(u);
          return head.status === 200 ? u : null;
        } catch {
          return null;
        }
      })
    );
    
    res.json({ urls: verified.filter(Boolean) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 2. Add XPath Extraction Service:
```javascript
const xpath = require('xpath');
const { DOMParser } = require('xmldom');

function extractByXPath(html, xpathQuery) {
  const doc = new DOMParser().parseFromString(html);
  const nodes = xpath.select(xpathQuery, doc);
  return nodes.map(node => node.textContent);
}
```

#### 3. Add Batch Processing:
```javascript
async function generateSchemaForAllPages(urls, schemaConfig) {
  const results = [];
  
  for (const url of urls) {
    const pageHtml = await fetchPageHtml(url);
    const schema = {};
    
    for (const [prop, xpath] of Object.entries(schemaConfig.xpaths)) {
      schema[prop] = extractByXPath(pageHtml, xpath)[0];
    }
    
    results.push({ url, schema });
  }
  
  return results;
}
```

### **Frontend Integration with API**

Update the crawl function in React:
```javascript
const crawlWebsite = async () => {
  const response = await fetch(
    `/api/crawl?url=${encodeURIComponent(websiteUrl)}`
  );
  const data = await response.json();
  setCrawledUrls(data.urls);
};
```

---

## JSON-LD Schema Examples

### **Complete Product Example**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Executive Anvil",
  "image": "https://example.com/anvil.jpg",
  "description": "Sleek and stylish anvil",
  "brand": {
    "@type": "Brand",
    "name": "ACME"
  },
  "offers": {
    "@type": "Offer",
    "price": "119.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.4",
    "ratingCount": "89"
  },
  "reviews": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "John Doe"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5"
      },
      "reviewBody": "Excellent product!"
    }
  ]
}
```

### **Complete Article Example**
```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "How to Optimize Your Website for SEO",
  "datePublished": "2024-04-07",
  "dateModified": "2024-04-08",
  "author": [
    {
      "@type": "Person",
      "name": "Jane Smith",
      "url": "https://example.com/authors/jane"
    }
  ],
  "image": "https://example.com/article-image.jpg",
  "articleBody": "This article covers SEO best practices...",
  "publisher": {
    "@type": "Organization",
    "name": "Example Blog",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  }
}
```

### **Complete FAQ Example**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is structured data?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Structured data is code that helps search engines understand your content..."
      }
    },
    {
      "@type": "Question",
      "name": "Why use JSON-LD?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JSON-LD is the recommended way to add schema markup..."
      }
    }
  ]
}
```

---

## Validation & Testing

### **Validate Generated Schema**
1. Copy generated JSON-LD
2. Go to https://schema.org/validator/
3. Paste JSON and validate
4. Check for warnings and errors

### **Test in Google Search Console**
1. Submit sitemap with schema-enabled pages
2. Use Rich Results Test: https://search.google.com/test/rich-results
3. Monitor for indexed structured data

### **Browser DevTools Inspection**
```javascript
// In browser console, verify schema is loaded
document.querySelectorAll('script[type="application/ld+json"]')
  .forEach(el => console.log(JSON.parse(el.textContent)));
```

---

## Best Practices

### **XPath Extraction**
✅ Use unique class/id selectors: `//div[@id="main-content"]`
✅ Use semantic HTML: `//article/h1`
✅ Test XPaths before saving
❌ Avoid overly specific position-based selectors: `//div[1]/div[2]/div[3]`

### **Schema Selection**
✅ Use most specific schema type available
✅ Include all required properties
✅ Add important optional properties for better SEO
✅ Validate schema structure regularly

### **Nested Entities**
✅ Only nest when relationship is clear
✅ Use arrays for multiple related entities
✅ Keep nesting 2-3 levels maximum
❌ Create circular references

### **Deployment**
✅ Test on staging before production
✅ Monitor indexing in Search Console
✅ Update schema when content changes
✅ Keep XPath mappings documented

---

## Troubleshooting

### **IFrame Content Cannot Be Accessed (CORS)**
**Issue**: Cannot select content from iframe due to cross-origin policy
**Solution**: 
- Use same-origin iframe pages for testing
- For production, implement server-side XPath extraction
- Alternative: Provide manual XPath input

### **XPath Returns Empty Results**
**Causes**:
- Content loaded via JavaScript (not in initial HTML)
- Dynamic DOM changes after page load
- Incorrect XPath syntax

**Solutions**:
- Wait for content to load before extraction
- Use JavaScript-aware crawling (Puppeteer/Playwright)
- Verify XPath in browser DevTools: `$x('//your/xpath')`

### **Schema Not Appearing in Search Results**
**Checklist**:
- Validate schema with https://schema.org/validator/
- Check robots.txt doesn't block page
- Wait 7-14 days for Google re-indexing
- Verify no JSON parsing errors
- Check for proper @context value

### **Nested Schema Not Generating Correctly**
**Solution**: Ensure nested object structure matches schema.org specification:
```javascript
// Correct
article.author = { "@type": "Person", "name": "..." }

// Correct (array)
faqPage.mainEntity = [{ "@type": "Question", ... }]

// Incorrect
article.author = "John Doe" // Missing @type
```

---

## Advanced Customization

### **Add Custom Schema Type**

In the `fetchSchemaTypes()` function:
```javascript
const customSchema = {
  'CustomType': {
    required: ['requiredProp1', 'requiredProp2'],
    optional: ['optionalProp1', 'optionalProp2'],
    nested: ['nestedProp']
  }
};
setAllSchemas(prev => ({ ...prev, ...customSchema }));
```

### **Extend XPath Generation**

Create more robust XPath with CSS selector fallback:
```javascript
function generateAdvancedXpath(element) {
  // Try CSS selector first (more readable)
  if (element.id) return `#${element.id}`;
  if (element.className) {
    return `.${element.className.split(' ')[0]}`;
  }
  // Fallback to XPath
  return generateXpath(element);
}
```

### **Batch Apply XPath Mappings**

Apply same extraction rules to multiple pages:
```javascript
async function applyMappingsToPages(urls, mappings) {
  const results = [];
  for (const url of urls) {
    const pageData = await extractFromUrl(url, mappings);
    results.push({ url, data: pageData });
  }
  return results;
}
```

---

## Performance Optimization

### **Large Website Handling**
- Implement pagination in crawler
- Process pages in batches
- Cache XPath results
- Use Web Workers for extraction

### **Memory Management**
- Clear iframe content after extraction
- Unload unused schema data
- Lazy-load nested schemas
- Stream large result sets

---

## Security Considerations

- Sanitize all extracted text content
- Validate XPath queries to prevent injection
- Use Content Security Policy headers
- Validate @context values
- Never expose sensitive data in schema

---

## API Reference

### **Core Functions**

#### `crawlWebsite(url: string): Promise<string[]>`
Discovers all accessible pages on a website

#### `generateXpath(element: HTMLElement): string`
Creates XPath query for HTML element

#### `extractXpath(url: string, xpath: string): Promise<string>`
Extracts text content using XPath on remote page

#### `generateJsonLd(schemaType: string, data: object): object`
Generates JSON-LD from schema data

#### `validateSchema(jsonLd: object): ValidationResult`
Validates schema structure against Schema.org specs

---

## Support & Resources

- **Schema.org Documentation**: https://schema.org/
- **Google Search Central**: https://developers.google.com/search
- **JSON-LD Specification**: https://json-ld.org/
- **Schema Validator**: https://schema.org/validator/
- **Rich Results Test**: https://search.google.com/test/rich-results

---

## License & Attribution

This tool is built for structured data generation and optimization. Always respect website terms of service when crawling and extracting data.

Last Updated: April 2024
Version: 1.0.0
