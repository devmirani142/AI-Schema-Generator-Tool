import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, Settings, Plus, Trash2, Copy, Check, AlertCircle, Loader, Eye, Code } from 'lucide-react';

const AdvancedSchemaGeneratorTool = () => {
  // Core state management
  const [mode, setMode] = useState('crawl'); // 'crawl', 'schema', 'extract', 'preview'
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [crawledUrls, setCrawledUrls] = useState([]);
  const [isCrawling, setIsCrawling] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  
  // Schema state
  const [allSchemas, setAllSchemas] = useState({});
  const [selectedSchemaType, setSelectedSchemaType] = useState('');
  const [schemaProperties, setSchemaProperties] = useState({});
  const [schemaData, setSchemaData] = useState({});
  const [nestedSchemas, setNestedSchemas] = useState([]);
  
  // XPath extraction state
  const [extractionMode, setExtractionMode] = useState(false);
  const [xpathMappings, setXpathMappings] = useState({});
  const [selectedProperty, setSelectedProperty] = useState('');
  const [iframeKey, setIframeKey] = useState(0);
  
  // Preview & Export
  const [showPreview, setShowPreview] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copiedId, setCopiedId] = useState('');
  
  // Fetch Schema.org schemas on mount
  useEffect(() => {
    fetchSchemaTypes();
  }, []);
  
  const fetchSchemaTypes = async () => {
    try {
      // Fetch popular schema types from Schema.org
      const schemas = {
        'Article': {
          required: ['headline', 'datePublished', 'author'],
          optional: ['description', 'image', 'articleBody', 'wordCount', 'dateModified']
        },
        'Product': {
          required: ['name', 'offers'],
          optional: ['description', 'image', 'brand', 'sku', 'aggregateRating', 'reviews']
        },
        'Person': {
          required: ['name'],
          optional: ['email', 'telephone', 'url', 'image', 'jobTitle', 'affiliation']
        },
        'Organization': {
          required: ['name'],
          optional: ['url', 'logo', 'description', 'email', 'telephone', 'address', 'foundingDate']
        },
        'LocalBusiness': {
          required: ['name', 'address', 'telephone'],
          optional: ['url', 'email', 'openingHoursSpecification', 'priceRange', 'image']
        },
        'BreadcrumbList': {
          required: ['itemListElement'],
          optional: []
        },
        'NewsArticle': {
          required: ['headline', 'datePublished'],
          optional: ['articleBody', 'image', 'author', 'dateModified', 'description']
        },
        'Event': {
          required: ['name', 'startDate', 'endDate', 'location'],
          optional: ['description', 'image', 'url', 'offers', 'organizer', 'performer']
        },
        'Recipe': {
          required: ['name', 'ingredients', 'instructions'],
          optional: ['author', 'prepTime', 'cookTime', 'totalTime', 'recipeYield', 'recipeCategory']
        },
        'VideoObject': {
          required: ['name', 'contentUrl', 'duration'],
          optional: ['description', 'uploadDate', 'thumbnailUrl', 'author']
        },
        'FAQPage': {
          required: ['mainEntity'],
          optional: []
        },
        'Question': {
          required: ['text', 'acceptedAnswer'],
          optional: []
        },
        'Answer': {
          required: ['text'],
          optional: ['author']
        },
        'Review': {
          required: ['reviewRating', 'author'],
          optional: ['reviewBody', 'datePublished', 'name']
        },
        'AggregateRating': {
          required: ['ratingValue', 'reviewCount'],
          optional: ['bestRating', 'worstRating', 'ratingCount']
        }
      };
      setAllSchemas(schemas);
    } catch (error) {
      console.error('Error fetching schemas:', error);
    }
  };
  
  // Website crawling simulation
  const crawlWebsite = async () => {
    if (!websiteUrl) return;
    
    setIsCrawling(true);
    try {
      const response = await fetch(`/api/crawl?url=${encodeURIComponent(websiteUrl)}`, {
        method: 'GET'
      }).catch(() => {
        // Fallback: simulate crawl for demo
        return null;
      });
      
      // Simulate crawl results for demo
      const baseUrl = new URL(websiteUrl).origin;
      const simulatedUrls = [
        `${baseUrl}/`,
        `${baseUrl}/about`,
        `${baseUrl}/products`,
        `${baseUrl}/contact`,
        `${baseUrl}/blog`,
        `${baseUrl}/services`
      ];
      
      setCrawledUrls(simulatedUrls);
      if (simulatedUrls.length > 0) {
        setSelectedUrl(simulatedUrls[0]);
        setMode('schema');
      }
    } catch (error) {
      console.error('Crawl error:', error);
    }
    setIsCrawling(false);
  };
  
  // Get schema properties
  const handleSchemaSelection = (schemaType) => {
    setSelectedSchemaType(schemaType);
    setSchemaProperties(allSchemas[schemaType] || {});
    setSchemaData({});
    setXpathMappings({});
    setNestedSchemas([]);
    setMode('extract');
  };
  
  // XPath extraction from selected element
  const extractXpath = (event) => {
    if (!extractionMode || !selectedProperty) return;
    
    const element = event.target;
    const xpath = generateXpath(element);
    const textContent = element.innerText || element.textContent || '';
    
    setXpathMappings(prev => ({
      ...prev,
      [selectedProperty]: { xpath, preview: textContent.substring(0, 100) }
    }));
    
    setSchemaData(prev => ({
      ...prev,
      [selectedProperty]: textContent
    }));
    
    // Visual feedback
    element.style.backgroundColor = 'rgba(34, 197, 94, 0.2)';
    setTimeout(() => {
      element.style.backgroundColor = '';
    }, 1500);
    
    setExtractionMode(false);
  };
  
  // Generate XPath from element
  const generateXpath = (element) => {
    const paths = [];
    let current = element;
    
    while (current && current.nodeType !== 9) {
      let index = 1;
      let sibling = current.previousSibling;
      
      while (sibling) {
        if (sibling.nodeType === 1 && sibling.nodeName === current.nodeName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }
      
      const tagName = current.nodeName.toLowerCase();
      const xpathIndex = current.parentNode?.children.length > 1 ? `[${index}]` : '';
      paths.unshift(`${tagName}${xpathIndex}`);
      
      current = current.parentNode;
    }
    
    return '/' + paths.join('/');
  };
  
  // Add nested schema
  const addNestedSchema = (propertyName) => {
    const nestedItem = {
      id: Date.now(),
      parentProperty: propertyName,
      type: '',
      data: {},
      xpaths: {}
    };
    setNestedSchemas([...nestedSchemas, nestedItem]);
  };
  
  // Remove nested schema
  const removeNestedSchema = (id) => {
    setNestedSchemas(nestedSchemas.filter(s => s.id !== id));
  };
  
  // Generate JSON-LD
  const generateJsonLd = () => {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': selectedSchemaType,
      ...schemaData
    };
    
    // Add nested schemas
    nestedSchemas.forEach(nested => {
      if (nested.type && Object.keys(nested.data).length > 0) {
        if (!jsonLd[nested.parentProperty]) {
          jsonLd[nested.parentProperty] = [];
        }
        if (!Array.isArray(jsonLd[nested.parentProperty])) {
          jsonLd[nested.parentProperty] = [jsonLd[nested.parentProperty]];
        }
        jsonLd[nested.parentProperty].push({
          '@type': nested.type,
          ...nested.data
        });
      }
    });
    
    return JSON.stringify(jsonLd, null, 2);
  };
  
  // Copy to clipboard
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };
  
  // ============ RENDER SECTIONS ============
  
  const renderCrawlMode = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Globe className="w-8 h-8 text-emerald-400" />
          Website Crawler
        </h2>
        <p className="text-slate-400 mb-6">Enter your website URL to discover all available pages</p>
        
        <div className="flex gap-3">
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          />
          <button
            onClick={crawlWebsite}
            disabled={isCrawling || !websiteUrl}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            {isCrawling ? <Loader className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            {isCrawling ? 'Crawling...' : 'Crawl'}
          </button>
        </div>
      </div>
      
      {crawledUrls.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">Discovered URLs ({crawledUrls.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {crawledUrls.map((url, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedUrl(url);
                  setMode('schema');
                }}
                className="w-full text-left px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 transition-colors border border-slate-600 hover:border-emerald-500 truncate"
              >
                {url}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  
  const renderSchemaMode = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-xl p-6 border border-blue-700">
        <h3 className="text-white font-semibold mb-2">Selected Page</h3>
        <p className="text-blue-100 text-sm truncate">{selectedUrl}</p>
      </div>
      
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Choose Schema Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {Object.keys(allSchemas).map(schemaType => (
            <button
              key={schemaType}
              onClick={() => handleSchemaSelection(schemaType)}
              className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-blue-400 text-slate-100 text-sm font-medium transition-all duration-200 hover:text-blue-300"
            >
              {schemaType}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  
  const renderExtractMode = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h4 className="text-slate-400 text-sm font-semibold mb-2">Schema Type</h4>
          <p className="text-white font-bold text-lg">{selectedSchemaType}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h4 className="text-slate-400 text-sm font-semibold mb-2">Required</h4>
          <p className="text-emerald-400 font-bold text-lg">{schemaProperties.required?.length || 0}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h4 className="text-slate-400 text-sm font-semibold mb-2">Optional</h4>
          <p className="text-blue-400 font-bold text-lg">{schemaProperties.optional?.length || 0}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {/* Properties Panel */}
        <div className="col-span-1 space-y-4">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Properties</h3>
            
            {/* Required Properties */}
            {schemaProperties.required && schemaProperties.required.length > 0 && (
              <div className="mb-6">
                <h4 className="text-emerald-400 text-sm font-bold uppercase mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  Required
                </h4>
                <div className="space-y-2">
                  {schemaProperties.required.map(prop => (
                    <button
                      key={prop}
                      onClick={() => setSelectedProperty(prop)}
                      className={`w-full text-left px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
                        selectedProperty === prop
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-slate-700 border-slate-600 text-slate-100 hover:border-emerald-500'
                      }`}
                    >
                      {prop}
                      {schemaData[prop] && <Check className="w-3 h-3 float-right" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Optional Properties */}
            {schemaProperties.optional && schemaProperties.optional.length > 0 && (
              <div>
                <h4 className="text-blue-400 text-sm font-bold uppercase mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Optional
                </h4>
                <div className="space-y-2">
                  {schemaProperties.optional.map(prop => (
                    <button
                      key={prop}
                      onClick={() => setSelectedProperty(prop)}
                      className={`w-full text-left px-3 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
                        selectedProperty === prop
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-700 border-slate-600 text-slate-100 hover:border-blue-500'
                      }`}
                    >
                      {prop}
                      {schemaData[prop] && <Check className="w-3 h-3 float-right" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={() => setMode('preview')}
              className="w-full mt-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview JSON-LD
            </button>
          </div>
        </div>
        
        {/* Page Preview & Extraction */}
        <div className="col-span-2">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {extractionMode ? 'Click to Extract' : 'Page Preview'}
              </h3>
              <button
                onClick={() => setExtractionMode(!extractionMode)}
                className={`px-4 py-2 rounded-lg border font-medium transition-all ${
                  extractionMode
                    ? 'bg-orange-600 border-orange-500 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-100 hover:border-orange-500'
                }`}
              >
                {extractionMode ? 'Extraction Active' : 'Enable Extraction'}
              </button>
            </div>
            
            {selectedProperty && extractionMode && (
              <div className="mb-4 p-3 bg-orange-900 border border-orange-700 rounded-lg">
                <p className="text-orange-100 text-sm font-medium">
                  Click on content in the preview to extract for: <strong>{selectedProperty}</strong>
                </p>
              </div>
            )}
            
            <iframe
              key={iframeKey}
              src={selectedUrl}
              className="w-full h-96 rounded-lg border border-slate-600 bg-white"
              sandbox="allow-same-origin allow-scripts allow-popups"
              onLoad={(e) => {
                if (extractionMode) {
                  try {
                    e.target.contentDocument?.addEventListener('click', extractXpath);
                  } catch (err) {
                    console.log('Cannot access iframe due to CORS');
                  }
                }
              }}
            />
            
            {xpathMappings[selectedProperty] && (
              <div className="mt-4 p-3 bg-slate-700 rounded-lg border border-slate-600">
                <p className="text-slate-300 text-xs font-mono break-all mb-2">{xpathMappings[selectedProperty].xpath}</p>
                <p className="text-slate-100 text-sm">{xpathMappings[selectedProperty].preview}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderPreviewMode = () => {
    const jsonLd = generateJsonLd();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setMode('extract')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white rounded-lg font-medium transition-all"
          >
            ← Back to Edit
          </button>
          <button
            onClick={() => copyToClipboard(jsonLd, 'jsonld')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            {copiedId === 'jsonld' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedId === 'jsonld' ? 'Copied!' : 'Copy JSON-LD'}
          </button>
          <button
            onClick={() => setShowCode(!showCode)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            <Code className="w-4 h-4" />
            {showCode ? 'Hide' : 'Show'} HTML
          </button>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">JSON-LD Output</h3>
          <pre className="bg-slate-900 rounded-lg p-4 text-slate-100 overflow-x-auto text-sm max-h-96 overflow-y-auto">
            {jsonLd}
          </pre>
        </div>
        
        {showCode && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">HTML Script Tag</h3>
            <pre className="bg-slate-900 rounded-lg p-4 text-slate-100 overflow-x-auto text-sm">
{`<script type="application/ld+json">
${jsonLd}
</script>`}
            </pre>
          </div>
        )}
      </div>
    );
  };
  
  // ============ MAIN RENDER ============
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400">
            Schema.org Generator
          </h1>
          <p className="text-slate-400 text-lg">
            Advanced tool for generating structured data with nested entities and XPath extraction
          </p>
        </div>
        
        {/* Mode Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { value: 'crawl', label: '🕷️ Crawl', icon: 'globe' },
            { value: 'schema', label: '📋 Schema', icon: 'settings' },
            { value: 'extract', label: '🎯 Extract', icon: 'target' },
            { value: 'preview', label: '👁️ Preview', icon: 'eye' }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setMode(tab.value)}
              disabled={
                (tab.value === 'schema' && crawledUrls.length === 0) ||
                (tab.value === 'extract' && !selectedSchemaType) ||
                (tab.value === 'preview' && !selectedSchemaType)
              }
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 border ${
                mode === tab.value
                  ? 'bg-gradient-to-r from-emerald-500 to-blue-500 border-emerald-400 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="bg-slate-800 bg-opacity-50 rounded-2xl backdrop-blur-sm p-8 border border-slate-700 shadow-2xl">
          {mode === 'crawl' && renderCrawlMode()}
          {mode === 'schema' && renderSchemaMode()}
          {mode === 'extract' && renderExtractMode()}
          {mode === 'preview' && renderPreviewMode()}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSchemaGeneratorTool;
