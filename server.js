// server.js - Implemented Express server for Week 2 assignment

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(bodyParser.json());

// --- In-memory products "DB" ---
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// --- Custom Error Classes ---
class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation Error') {
    super(message, 400);
  }
}

class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

// --- Utility: async handler ---
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// --- Logger middleware ---
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// --- Authentication middleware ---
const API_KEY = process.env.API_KEY || 'dev-secret-key';
function authMiddleware(req, res, next) {
  const key = req.header('x-api-key') || req.header('api-key');
  if (!key || key !== API_KEY) {
    return next(new AuthError('Missing or invalid API key'));
  }
  next();
}

// --- Validation middleware ---
function validateProduct(req, res, next) {
  const { name, description, price, category, inStock } = req.body;
  if (typeof name !== 'string' || name.trim() === '') return next(new ValidationError('name is required and must be a string'));
  if (typeof description !== 'string') return next(new ValidationError('description must be a string'));
  if (typeof price !== 'number') return next(new ValidationError('price must be a number'));
  if (typeof category !== 'string') return next(new ValidationError('category must be a string'));
  if (typeof inStock !== 'boolean') return next(new ValidationError('inStock must be a boolean'));
  next();
}

function validateProductUpdate(req, res, next) {
  const { name, description, price, category, inStock } = req.body;
  if (name !== undefined && typeof name !== 'string') return next(new ValidationError('name must be a string'));
  if (description !== undefined && typeof description !== 'string') return next(new ValidationError('description must be a string'));
  if (price !== undefined && typeof price !== 'number') return next(new ValidationError('price must be a number'));
  if (category !== undefined && typeof category !== 'string') return next(new ValidationError('category must be a string'));
  if (inStock !== undefined && typeof inStock !== 'boolean') return next(new ValidationError('inStock must be a boolean'));
  next();
}

// --- Routes ---
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Use /api/products to interact with resources.');
});

// GET /api/products - list products with optional filtering, search and pagination
app.get('/api/products', asyncHandler((req, res) => {
  let result = [...products];

  // Filtering by category
  if (req.query.category) {
    result = result.filter(p => p.category === req.query.category);
  }

  // Search by name (q query param)
  if (req.query.q) {
    const q = req.query.q.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(q));
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const start = (page - 1) * limit;
  const end = start + limit;

  const paginated = result.slice(start, end);

  res.json({
    meta: {
      total: result.length,
      page,
      limit
    },
    data: paginated
  });
}));

// GET /api/products/:id - get specific product
app.get('/api/products/:id', asyncHandler((req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return next(new NotFoundError('Product not found'));
  res.json(product);
}));

// POST /api/products - create product (auth + validation)
app.post('/api/products', authMiddleware, validateProduct, asyncHandler((req, res) => {
  const { name, description, price, category, inStock } = req.body;
  const newProduct = { id: uuidv4(), name, description, price, category, inStock };
  products.push(newProduct);
  res.status(201).json(newProduct);
}));

// PUT /api/products/:id - update product (auth + validation for fields)
app.put('/api/products/:id', authMiddleware, validateProductUpdate, asyncHandler((req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return next(new NotFoundError('Product not found'));
  const { name, description, price, category, inStock } = req.body;
  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (category !== undefined) product.category = category;
  if (inStock !== undefined) product.inStock = inStock;
  res.json(product);
}));

// DELETE /api/products/:id - delete product (auth)
app.delete('/api/products/:id', authMiddleware, asyncHandler((req, res, next) => {
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return next(new NotFoundError('Product not found'));
  const removed = products.splice(idx, 1)[0];
  res.json({ deleted: removed });
}));

// GET /api/products/stats - product statistics (e.g., count by category)
app.get('/api/products/stats', asyncHandler((req, res) => {
  const counts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  res.json({ total: products.length, byCategory: counts });
}));

// --- Global error handler ---
app.use((err, req, res, next) => {
  if (!(err instanceof AppError)) {
    console.error(err);
    err = new AppError(err.message || 'Internal Server Error', 500);
  }
  res.status(err.status || 500).json({ error: err.message });
});

// Start the server only when run directly (so it can be imported for tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Export the app for testing purposes
module.exports = app;