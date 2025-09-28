const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

app.use(bodyParser.json());

// Simple selector database for nuitee.link
const selectors = {
  'search-input': 'input[type="text"], input[placeholder*="search"]',
  'search-button': 'button[type="submit"], button:has-text("Search")',
  'login-button': 'button:has-text("Login"), button:has-text("Sign In")',
  'navigation': 'nav, header, [role="navigation"]',
  'hotel-cards': '[data-testid*="hotel"], .hotel, [class*="hotel"]',
  'forms': 'form',
  'buttons': 'button',
  'inputs': 'input',
  'location-input': 'input[placeholder*="location"], input[placeholder*="where"]',
  'guests-input': 'input[placeholder*="guest"], select[name*="guest"]',
  'dates-input': 'input[type="date"], input[placeholder*="date"]',
  'search-submit': 'button[type="submit"]:has-text("Search"), button:has-text("Find")',
  'hotel-list': '[data-testid*="hotel"], .hotel-card, [class*="hotel-item"]',
  'room-card': '[data-testid*="room"], .room-card, [class*="room"]',
  'book-button': 'button:has-text("Book"), button:has-text("Select")',
  'booking-form': 'form[class*="booking"], form[class*="reservation"]'
};

// GET /selectors - List all selectors
app.get('/selectors', (req, res) => {
  res.json({
    success: true,
    selectors: selectors
  });
});

// GET /selectors/:element - Get specific selector
app.get('/selectors/:element', (req, res) => {
  const element = req.params.element;
  if (selectors[element]) {
    res.json({
      success: true,
      element: element,
      selector: selectors[element]
    });
  } else {
    res.status(404).json({
      success: false,
      error: `Element '${element}' not found`,
      available: Object.keys(selectors)
    });
  }
});

// POST /selectors - Add new selector
app.post('/selectors', (req, res) => {
  const { element, selector } = req.body;
  
  if (!element || !selector) {
    return res.status(400).json({
      success: false,
      error: 'Both element and selector are required'
    });
  }
  
  selectors[element] = selector;
  res.json({
    success: true,
    message: `Added selector for ${element}`,
    element: element,
    selector: selector
  });
});

// PUT /selectors/:element - Update selector
app.put('/selectors/:element', (req, res) => {
  const element = req.params.element;
  const { selector } = req.body;
  
  if (!selector) {
    return res.status(400).json({
      success: false,
      error: 'Selector is required'
    });
  }
  
  if (!selectors[element]) {
    return res.status(404).json({
      success: false,
      error: `Element '${element}' not found`
    });
  }
  
  selectors[element] = selector;
  res.json({
    success: true,
    message: `Updated selector for ${element}`,
    element: element,
    selector: selector
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Nuitee Selector Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET /selectors - List all selectors');
  console.log('  GET /selectors/:element - Get specific selector');
  console.log('  POST /selectors - Add new selector');
  console.log('  PUT /selectors/:element - Update selector');
  console.log('  GET /health - Health check');
});
