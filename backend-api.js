/**
 * Advanced Schema Generator - Backend API Implementation
 * Node.js/Express Backend with Crawling, XPath Extraction, and Batch Processing
 * 
 * Installation:
 * npm install express axios cheerio xmldom xpath puppeteer cors dotenv
 */

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const xpath = require('xpath');
const { DOMParser } = require('xmldom');
const puppeteer = require('puppeteer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

/**
 * ============================================
 * 1. WEBSITE CRAWLING ENDPOINTS
 * ============================================
 */

/**
 * GET /api/crawl
 * Crawl website and return all URLs returning 200 OK status
 * Query params: url (required)
 */
app.get('/api/crawl', async (req, res) => {
  try {
    const { url, depth = 1, maxPages = 100 } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const baseUrl = new URL(url).origin;
    const visited = new Set();
    const validUrls = [];
    
    // Validate URL
    const isValidUrl = (urlString) => {
      try {
        const parsed = new URL(urlString);
        return parsed.hostname === new URL(baseUrl).hostname;
      } catch {
        return false;
      }
    };
    
    // BFS crawling
    const queue = [url];
    let processed = 0;
    
    while (queue.length > 0 && processed < maxPages) {
      const currentUrl = queue.shift();
      
      if (visited.has(currentUrl)) continue;
      visited.add(currentUrl);
      processed++;
      
      try {
        const response = await axios.get(currentUrl, {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.status === 200) {
          validUrls.push(currentUrl);
          
          // Extract links for further crawling
          if (processed < maxPages) {
            const $ = cheerio.load(response.data);
            $('a[href]').each((i, el) => {
              try {
                const href = $(el).attr('href');
                const absoluteUrl = new URL(href, currentUrl).href;
                
                if (isValidUrl(absoluteUrl) && !visited.has(absoluteUrl)) {
                  queue.push(absoluteUrl);
                }
              } catch (e) {
                // Skip invalid URLs
              }
            });
          }
        }
      } catch (error) {
        console.error(`Error crawling ${currentUrl}:`, error.message);
      }
    }
    
    res.json({
      success: true,
      totalUrls: validUrls.length,
      urls: validUrls,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/crawl/advanced
 * Advanced crawl with JavaScript rendering (for dynamic content)
 * Body: { url, depth, timeout, headless }
 */
app.post('/api/crawl/advanced', async (req, res) => {
  let browser;
  
  try {
    const { url, depth = 2, timeout = 30000 } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout });
    
    // Extract all links
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href]'))
        .map(el => el.href)
        .filter(href => href && !href.startsWith('javascript:'));
    });
    
    // Get base URL
    const baseUrl = new URL(url).origin;
    const validLinks = [...new Set(links)].filter(link => {
      try {
        return new URL(link).hostname === new URL(baseUrl).hostname;
      } catch {
        return false;
      }
    });
    
    await page.close();
    await browser.close();
    
    res.json({
      success: true,
      totalUrls: validLinks.length,
      urls: validLinks,
      renderingEngine: 'Puppeteer',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (browser) await browser.close();
    res.status(500).json({ error: error.message });
  }
});

/**
 * ============================================
 * 2. XPATH EXTRACTION ENDPOINTS
 * ============================================
 */

/**
 * POST /api/extract/xpath
 * Extract content from URL using XPath query
 * Body: { url, xpath }
 */
app.post('/api/extract/xpath', async (req, res) => {
  try {
    const { url, xpath: xpathQuery } = req.body;
    
    if (!url || !xpathQuery) {
      return res.status(400).json({
        error: 'URL and XPath query are required'
      });
    }
    
    // Fetch page HTML
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    // Parse DOM
    const doc = new DOMParser({
      errorHandler: {
        warning: () => {},
        error: () => {},
        fatalError: () => {}
      }
    }).parseFromString(response.data);
    
    // Execute XPath
    const nodes = xpath.select(xpathQuery, doc);
    
    // Extract text content
    const results = nodes.map(node => ({
      text: node.textContent?.trim() || '',
      html: node.toString(),
      nodeName: node.nodeName
    }));
    
    res.json({
      success: true,
      xpath: xpathQuery,
      resultCount: results.length,
      results: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      details: 'XPath extraction failed'
    });
  }
});

/**
 * POST /api/extract/css-selector
 * Extract content using CSS selectors (alternative to XPath)
 * Body: { url, selector }
 */
app.post('/api/extract/css-selector', async (req, res) => {
  try {
    const { url, selector } = req.body;
    
    if (!url || !selector) {
      return res.status(400).json({
        error: 'URL and CSS selector are required'
      });
    }
    
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    const results = [];
    $(selector).each((i, el) => {
      results.push({
        text: $(el).text().trim(),
        html: $(el).html(),
        attributes: $(el).attr()
      });
    });
    
    res.json({
      success: true,
      selector: selector,
      resultCount: results.length,
      results: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/extract/batch
 * Extract multiple properties from single URL
 * Body: { url, extractions: [{ property, xpath }, ...] }
 */
app.post('/api/extract/batch', async (req, res) => {
  try {
    const { url, extractions } = req.body;
    
    if (!url || !Array.isArray(extractions)) {
      return res.status(400).json({
        error: 'URL and extractions array are required'
      });
    }
    
    // Fetch page once
    const response = await axios.get(url);
    const doc = new DOMParser({
      errorHandler: {
        warning: () => {},
        error: () => {},
        fatalError: () => {}
      }
    }).parseFromString(response.data);
    
    // Process all extractions
    const results = {};
    const errors = [];
    
    for (const { property, xpath: xpathQuery } of extractions) {
      try {
        const nodes = xpath.select(xpathQuery, doc);
        results[property] = nodes.length > 0 
          ? nodes[0].textContent?.trim() || '' 
          : '';
      } catch (error) {
        errors.push({ property, error: error.message });
        results[property] = '';
      }
    }
    
    res.json({
      success: true,
      url: url,
      extractedData: results,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ============================================
 * 3. SCHEMA GENERATION ENDPOINTS
 * ============================================
 */

/**
 * POST /api/schema/generate
 * Generate JSON-LD from extracted data
 * Body: { schemaType, data, context }
 */
app.post('/api/schema/generate', (req, res) => {
  try {
    const { schemaType, data, nested = [] } = req.body;
    
    if (!schemaType || !data) {
      return res.status(400).json({
        error: 'schemaType and data are required'
      });
    }
    
    // Build base schema
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': schemaType,
      ...data
    };
    
    // Add nested schemas
    nested.forEach(({ parentProperty, type, data: nestedData }) => {
      if (parentProperty && type && nestedData) {
        if (!jsonLd[parentProperty]) {
          jsonLd[parentProperty] = [];
        }
        
        if (!Array.isArray(jsonLd[parentProperty])) {
          jsonLd[parentProperty] = [jsonLd[parentProperty]];
        }
        
        jsonLd[parentProperty].push({
          '@type': type,
          ...nestedData
        });
      }
    });
    
    res.json({
      success: true,
      jsonLd: jsonLd,
      html: `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/schema/validate
 * Validate JSON-LD schema structure
 * Body: { jsonLd }
 */
app.post('/api/schema/validate', (req, res) => {
  try {
    const { jsonLd } = req.body;
    
    if (!jsonLd || typeof jsonLd !== 'object') {
      return res.status(400).json({
        error: 'Valid JSON-LD object is required'
      });
    }
    
    const errors = [];
    const warnings = [];
    
    // Check required fields
    if (!jsonLd['@context']) {
      errors.push('Missing @context');
    }
    if (!jsonLd['@type']) {
      errors.push('Missing @type');
    }
    
    // Check @context value
    if (jsonLd['@context'] && 
        jsonLd['@context'] !== 'https://schema.org' && 
        jsonLd['@context'] !== 'http://schema.org') {
      warnings.push('Non-standard @context value');
    }
    
    // Check for common issues
    if (typeof jsonLd === 'string') {
      errors.push('JSON-LD must be an object, not a string');
    }
    
    res.json({
      success: errors.length === 0,
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      jsonLd: jsonLd,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ============================================
 * 4. BATCH PROCESSING ENDPOINTS
 * ============================================
 */

/**
 * POST /api/batch/extract-to-schema
 * Extract data from multiple URLs and generate schemas
 * Body: { urls, schemaConfig: { type, extractions: [{ property, xpath }] } }
 */
app.post('/api/batch/extract-to-schema', async (req, res) => {
  try {
    const { urls, schemaConfig } = req.body;
    
    if (!Array.isArray(urls) || !schemaConfig) {
      return res.status(400).json({
        error: 'URLs array and schemaConfig are required'
      });
    }
    
    const results = [];
    const errors = [];
    
    for (const url of urls) {
      try {
        // Extract data for this URL
        const response = await axios.post('http://localhost:5000/api/extract/batch', {
          url: url,
          extractions: schemaConfig.extractions
        });
        
        // Generate schema
        const schemaResponse = await axios.post('http://localhost:5000/api/schema/generate', {
          schemaType: schemaConfig.type,
          data: response.data.extractedData
        });
        
        results.push({
          url: url,
          data: response.data.extractedData,
          jsonLd: schemaResponse.data.jsonLd,
          success: true
        });
      } catch (error) {
        errors.push({ url: url, error: error.message });
      }
    }
    
    res.json({
      success: errors.length === 0,
      processedUrls: results.length,
      results: results,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/batch/deploy-schema
 * Deploy generated schemas to pages
 * Body: { deployments: [{ url, htmlContent, jsonLd }] }
 */
app.post('/api/batch/deploy-schema', async (req, res) => {
  try {
    const { deployments } = req.body;
    
    if (!Array.isArray(deployments)) {
      return res.status(400).json({
        error: 'Deployments array is required'
      });
    }
    
    const results = [];
    
    for (const { htmlContent, jsonLd } of deployments) {
      try {
        // Insert schema into HTML head
        const modifiedHtml = insertSchemaIntoHtml(htmlContent, jsonLd);
        
        results.push({
          success: true,
          modified: modifiedHtml,
          schemaInserted: true
        });
      } catch (error) {
        results.push({
          success: false,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      deployments: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ============================================
 * 5. XPATH MAPPING ENDPOINTS
 * ============================================
 */

/**
 * POST /api/xpath/test
 * Test XPath query against a URL
 * Body: { url, xpath }
 */
app.post('/api/xpath/test', async (req, res) => {
  try {
    const { url, xpath: xpathQuery } = req.body;
    
    const response = await axios.get(url);
    const doc = new DOMParser({
      errorHandler: {
        warning: () => {},
        error: () => {},
        fatalError: () => {}
      }
    }).parseFromString(response.data);
    
    const nodes = xpath.select(xpathQuery, doc);
    
    res.json({
      success: true,
      xpath: xpathQuery,
      matchCount: nodes.length,
      samples: nodes.slice(0, 5).map(n => n.textContent?.trim()),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/xpath/generate-from-element
 * Generate XPath from element description
 * Body: { selector, description }
 */
app.post('/api/xpath/generate-from-element', (req, res) => {
  try {
    const { selector, description } = req.body;
    
    // Convert CSS selector to XPath
    const xpathFromSelector = cssToXpath(selector);
    
    res.json({
      success: true,
      cssSelector: selector,
      xpath: xpathFromSelector,
      description: description,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ============================================
 * 6. UTILITY ENDPOINTS
 * ============================================
 */

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/schemas
 * Get all supported schema types
 */
app.get('/api/schemas', (req, res) => {
  const schemas = {
    'Article': {
      required: ['headline', 'datePublished', 'author'],
      optional: ['description', 'image', 'articleBody', 'wordCount']
    },
    'Product': {
      required: ['name', 'offers'],
      optional: ['description', 'image', 'brand', 'sku', 'aggregateRating']
    },
    'Organization': {
      required: ['name'],
      optional: ['url', 'logo', 'description', 'email', 'telephone']
    },
    'Event': {
      required: ['name', 'startDate', 'endDate', 'location'],
      optional: ['description', 'image', 'url', 'organizer']
    },
    'Recipe': {
      required: ['name', 'ingredients', 'instructions'],
      optional: ['author', 'prepTime', 'cookTime', 'recipeYield']
    },
    'FAQPage': {
      required: ['mainEntity'],
      optional: []
    },
    'LocalBusiness': {
      required: ['name', 'address', 'telephone'],
      optional: ['url', 'email', 'openingHoursSpecification']
    }
  };
  
  res.json({
    success: true,
    total: Object.keys(schemas).length,
    schemas: schemas,
    timestamp: new Date().toISOString()
  });
});

/**
 * ============================================
 * HELPER FUNCTIONS
 * ============================================
 */

/**
 * Insert schema into HTML document head
 */
function insertSchemaIntoHtml(html, jsonLd) {
  const schemaTag = `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
  
  if (html.includes('</head>')) {
    return html.replace('</head>', `${schemaTag}\n</head>`);
  } else if (html.includes('<body>')) {
    return html.replace('<body>', `${schemaTag}\n<body>`);
  } else {
    return schemaTag + '\n' + html;
  }
}

/**
 * Convert CSS selector to XPath
 * Simple implementation - can be enhanced
 */
function cssToXpath(selector) {
  // Handle ID selectors
  if (selector.startsWith('#')) {
    return `//*[@id="${selector.slice(1)}"]`;
  }
  
  // Handle class selectors
  if (selector.startsWith('.')) {
    return `//*[contains(@class, "${selector.slice(1)}")]`;
  }
  
  // Handle tag selectors
  if (/^[a-z]+$/i.test(selector)) {
    return `//${selector}`;
  }
  
  // Default: return as is
  return `//${selector}`;
}

/**
 * Generate filename for export
 */
function generateFilename(schemaType) {
  return `schema-${schemaType.toLowerCase()}-${Date.now()}.json`;
}

/**
 * ============================================
 * ERROR HANDLING & STARTUP
 * ============================================
 */

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Advanced Schema Generator API running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /api/health');
  console.log('  GET  /api/crawl?url=...');
  console.log('  POST /api/crawl/advanced');
  console.log('  POST /api/extract/xpath');
  console.log('  POST /api/extract/css-selector');
  console.log('  POST /api/extract/batch');
  console.log('  POST /api/schema/generate');
  console.log('  POST /api/schema/validate');
  console.log('  POST /api/batch/extract-to-schema');
  console.log('  POST /api/xpath/test');
});

module.exports = app;
