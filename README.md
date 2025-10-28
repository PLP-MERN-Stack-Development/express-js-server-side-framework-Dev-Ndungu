# Express.js RESTful API Assignment

This assignment focuses on building a RESTful API using Express.js, implementing proper routing, middleware, and error handling.

## Assignment Overview

You will:
1. Set up an Express.js server
2. Create RESTful API routes for a product resource
3. Implement custom middleware for logging, authentication, and validation
4. Add comprehensive error handling
5. Develop advanced features like filtering, pagination, and search

## Getting Started

1. Accept the GitHub Classroom assignment invitation
2. Clone your personal repository that was created by GitHub Classroom
3. Install dependencies:
   ```
   npm install
   ```
4. Run the server:
   ```
   npm start
   ```

## Files Included

- `Week2-Assignment.md`: Detailed assignment instructions
- `server.js`: Starter Express.js server file
- `.env.example`: Example environment variables file

## Requirements

- Node.js (v18 or higher)
- npm or yarn
- Postman, Insomnia, or curl for API testing

## API Endpoints

The API will have the following endpoints:

- `GET /api/products`: Get all products
- `GET /api/products/:id`: Get a specific product
- `POST /api/products`: Create a new product
- `PUT /api/products/:id`: Update a product
- `DELETE /api/products/:id`: Delete a product

Additional endpoints and query features:

- `GET /api/products?q=<term>`: Search products by name (case-insensitive substring)
- `GET /api/products?category=<category>`: Filter products by category
- `GET /api/products?page=<n>&limit=<m>`: Pagination (defaults: page=1, limit=10)
- `GET /api/products/stats`: Get product statistics (counts by category)

## Submission

Your work will be automatically submitted when you push to your GitHub Classroom repository. Make sure to:

1. Complete all the required API endpoints
2. Implement the middleware and error handling
3. Document your API in the README.md
4. Include examples of requests and responses

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [RESTful API Design Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) 

## How to run

1. Install dependencies (if not already):

```
npm install express body-parser uuid
```

2. Copy `.env.example` to `.env` and set `API_KEY` if you want to override the default.

3. Start the server:

```
node server.js
```

4. Use an HTTP client (Postman, curl) to test endpoints. For routes that require authentication (`POST`, `PUT`, `DELETE`), include the header `x-api-key: <API_KEY>`.

Example: create a product using curl (Windows PowerShell):

```
curl -Method POST -Uri http://localhost:3000/api/products -Headers @{"x-api-key"="dev-secret-key"} -Body (ConvertTo-Json @{name="Tea";description="Green tea";price=5;category="beverage";inStock=$true}) -ContentType 'application/json'
```
