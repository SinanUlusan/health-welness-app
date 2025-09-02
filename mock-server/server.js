import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const HOST = 'localhost';

// Middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  next();
});

// Load database
const dbPath = path.join(__dirname, 'db.json');
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Save database helper
const saveDb = () => {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
};

// Handle Stripe payment intent creation
app.post('/payments/create-intent', (req, res) => {

  // Simulate payment intent creation
  const clientSecret = `pi_test_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;

  res.status(200).json({
    success: true,
    clientSecret: clientSecret,
    message: 'Payment intent created successfully'
  });
});

// Handle Stripe payment processing
app.post('/payments/process', (req, res) => {

  const { clientSecret, paymentData } = req.body;

  // Check if this is a test card that should fail
  const cardNumber = paymentData?.cardNumber?.replace(/\s/g, '') || '';
  const isDeclineCard = cardNumber === '4000000000000002';

  const shouldSucceed = !isDeclineCard; // Fail only for decline test card

  if (shouldSucceed) {
    res.status(200).json({
      success: true,
      paymentIntent: {
        id: `pi_mock_${Date.now()}`,
        status: 'succeeded',
        amount: 1000,
        currency: 'usd',
        client_secret: clientSecret
      },
      message: 'Payment processed successfully'
    });
  } else {
    res.status(200).json({
      success: false,
      error: 'Payment declined. Please try again with a different card.',
      paymentIntent: null
    });
  }
});

// Generic REST API routes for all collections
Object.keys(db).forEach(collection => {
  // GET all items in collection
  app.get(`/${collection}`, (req, res) => {
    res.json(db[collection]);
  });

  // GET single item by id
  app.get(`/${collection}/:id`, (req, res) => {
    const item = db[collection].find(item => item.id === req.params.id);
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  });

  // POST new item
  app.post(`/${collection}`, (req, res) => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 4),
      ...req.body,
      timestamp: new Date().toISOString()
    };
    db[collection].push(newItem);
    saveDb();
    res.status(201).json(newItem);
  });

  // PUT update item
  app.put(`/${collection}/:id`, (req, res) => {
    const index = db[collection].findIndex(item => item.id === req.params.id);
    if (index !== -1) {
      db[collection][index] = { ...db[collection][index], ...req.body };
      saveDb();
      res.json(db[collection][index]);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  });

  // DELETE item
  app.delete(`/${collection}/:id`, (req, res) => {
    const index = db[collection].findIndex(item => item.id === req.params.id);
    if (index !== -1) {
      const deleted = db[collection].splice(index, 1)[0];
      saveDb();
      res.json(deleted);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Mock server running at http://${HOST}:${PORT}`);
  console.log('Available endpoints:');
  Object.keys(db).forEach(collection => {
    console.log(`  GET/POST /${collection}`);
    console.log(`  GET/PUT/DELETE /${collection}/:id`);
  });
  console.log('  POST /payments/create-intent');
  console.log('  POST /payments/process');
}); 