# Gupio Product Management System

> **Campus Placement Development Assignment — Full Stack Developer (Option 2)**  
> A production-quality, modular, and fully persistent Full Stack Product Management System built with **Angular 18**, **Node.js / Express**, **TypeScript**, and **MongoDB Atlas**.

---

## 🌟 Executive Overview

The **Gupio Product Management System** is a full-stack web application designed for managing product inventories through a modern, responsive user interface. Every create, update, search, filter, sort, and delete action interacts directly with a RESTful Express backend and persists in a MongoDB database.

### Core Value & Architectural Highlights
- **End-to-End Data Persistence**: Zero reliance on temporary mock data or `localStorage`. All changes persist across page refreshes.
- **Derived Stock Status Logic**: Stock status (`In Stock`, `Low Stock`, `Out of Stock`) is calculated dynamically from `stockQuantity` to ensure data consistency.
- **Dual Validation Pipeline**: Frontend reactive form validation combined with strict backend validation to reject malformed requests.
- **Modular TypeScript Architecture**: Structured into clean layers (Models, Services, Controllers, Routes, Middleware, Components).
- **Mobile-First Responsive UI**: The dashboard and inventory workflow are optimized for phone screens and smaller tablets without breaking desktop usability.

### Local Access
- **Frontend**: `http://localhost:4200`
- The workspace opens directly to the dashboard; no admin sign-in is required.
- Product API endpoints are not authenticated. Restrict network access to the backend before deploying it publicly.

---

## 🏗️ Technical Architecture & Data Flow

```
+-----------------------------------------------------------------------+
|                            USER INTERFACE                              |
|                       (Angular 18 + Tailwind CSS)                     |
+-----------------------------------------------------------------------+
                                   │
                           HTTP REST API Calls
                                   │
                                   ▼
+-----------------------------------------------------------------------+
|                          EXPRESS REST BACKEND                         |
|  [ Routes ] ──► [ Validators ] ──► [ Controllers ] ──► [ Services ]   |
+-----------------------------------------------------------------------+
                                   │
                                Mongoose
                                   │
                                   ▼
+-----------------------------------------------------------------------+
|                         DATABASE PERSISTENCE                          |
|                             MongoDB Atlas                             |
+-----------------------------------------------------------------------+
```

### Complete Request / Response Lifecycle

1. **CREATE**: User fills Angular Reactive Form ➔ Client validation ➔ `POST /api/products` ➔ Express validator checks input ➔ Mongoose saves document ➔ MongoDB stores record ➔ API returns `HTTP 201` ➔ Toast notification displayed ➔ UI updates.
2. **READ**: Angular Service requests `GET /api/products` with search/filter/sort parameters ➔ Express Controller parses query ➔ Service executes Mongoose find & sort ➔ MongoDB returns matching documents ➔ Angular renders responsive table/cards.
3. **UPDATE**: User clicks Edit ➔ `GET /api/products/:id` populates form ➔ User updates values ➔ `PUT /api/products/:id` ➔ Backend validates payload & ID ➔ Mongoose updates document ➔ API returns `HTTP 200` ➔ UI refreshes.
4. **DELETE**: User clicks Delete ➔ Modal requires confirmation ➔ `DELETE /api/products/:id` ➔ Backend checks ObjectId ➔ Document removed from MongoDB ➔ API returns `HTTP 200` ➔ UI updates state.

---

## 🛠️ Technology Stack

| Domain | Technology / Framework | Usage & Purpose |
| :--- | :--- | :--- |
| **Frontend** | **Angular 18** | Component-based client architecture with standalone components |
| **Frontend Styling** | **Tailwind CSS** | Responsive styling, dark mode aesthetics, and glassmorphism UI |
| **Frontend Routing** | **Angular Router** | Single-page application navigation (`/dashboard`, `/products`, `/products/new`, `/products/:id`, `/products/:id/edit`) |
| **Forms & HTTP** | **Reactive Forms & HttpClient** | Client-side validation & typed REST API communication |
| **Backend API** | **Node.js & Express.js** | Modular RESTful API server with strict TypeScript typing |
| **Database ORM** | **Mongoose (MongoDB Atlas)** | Schema definition, timestamps, virtual getters, and query indexing |
| **Language** | **TypeScript** | Type safety across entire application stack |

---

## 📂 Repository & Project Structure

```
gupio-product-management-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts          # MongoDB connection handler
│   │   ├── models/
│   │   │   └── product.model.ts     # Mongoose schema, virtuals, and indexes
│   │   ├── services/
│   │   │   └── product.service.ts   # Business logic & MongoDB operations
│   │   ├── controllers/
│   │   │   └── product.controller.ts# HTTP request/response handlers
│   │   ├── routes/
│   │   │   └── product.routes.ts    # Express API endpoint definitions
│   │   ├── validators/
│   │   │   └── product.validator.ts # Backend validation & ObjectId check
│   │   ├── middleware/
│   │   │   └── error.middleware.ts  # Centralized error handler
│   │   ├── scripts/
│   │   │   └── seed.ts              # Sample database seeding script
│   │   ├── tests/
│   │   │   └── api.test.ts          # 12-step automated API test runner
│   │   ├── app.ts                   # Express app initialization & CORS setup
│   │   └── server.ts                # Server bootstrap entry point
│   ├── .env                         # Local environment variables
│   ├── .env.example                 # Environment template
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── models/
│   │   │   │   │   └── product.model.ts  # TypeScript interfaces & types
│   │   │   │   └── services/
│   │   │   │       └── product.service.ts# Angular API service
│   │   │   ├── features/
│   │   │   │   └── products/
│   │   │   │       ├── dashboard/        # Dynamic statistics view
│   │   │   │       ├── product-list/     # Table/Cards list with search & filter
│   │   │   │       ├── product-form/     # Add & Edit reactive forms
│   │   │   │       └── product-details/  # Single product details view
│   │   │   ├── shared/
│   │   │   │   ├── components/
│   │   │   │   │   ├── delete-confirm-modal/ # Modal dialog for delete confirmation
│   │   │   │   │   └── toast/                # Toast feedback system
│   │   │   │   └── services/
│   │   │   │       └── toast.service.ts
│   │   │   ├── app.component.ts
│   │   │   ├── app.routes.ts
│   │   │   └── app.config.ts
│   │   ├── environments/
│   │   │   ├── environment.ts
│   │   │   └── environment.prod.ts
│   │   └── styles.css
│   ├── tailwind.config.js
│   ├── angular.json
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🗄️ Database Schema & Stock Status Assumptions

### Product Schema (`Product` Collection)

| Field Name | Type | Rules | Description |
| :--- | :--- | :--- | :--- |
| `_id` | `ObjectId` | Auto-generated | MongoDB primary key |
| `name` | `String` | Required, Trim, Max: 100 | Product title |
| `category` | `String` | Required, Trim | Category (Electronics, Clothing, Books, Home, Sports, Other) |
| `price` | `Number` | Required, > 0 | Unit price in INR (₹) |
| `stockQuantity` | `Number` | Required, Integer, >= 0 | Available unit count |
| `description` | `String` | Required, Trim, Max: 1000 | Product specification text |
| `createdAt` | `Date` | Mongoose Timestamp | Record creation date |
| `updatedAt` | `Date` | Mongoose Timestamp | Record update date |

### Derived Stock Status Logic
Rather than storing `stockStatus` as a static, manually editable field in the database (which can cause stale/conflicting data if `stockQuantity` changes), **stock status is calculated dynamically**:

- `stockQuantity === 0` ➔ `"Out of Stock"`
- `1 <= stockQuantity <= 10` ➔ `"Low Stock"`
- `stockQuantity > 10` ➔ `"In Stock"`

This logic is implemented via a Mongoose virtual property on the backend and exposed in every API JSON payload as `stockStatus`.

---

## 📡 REST API Documentation

Base API Endpoint: `/api/products`

### 1. Create Product
- **Endpoint**: `POST /api/products`
- **Purpose**: Add a new product to MongoDB.
- **Request Body**:
  ```json
  {
    "name": "Wireless Headphones",
    "category": "Electronics",
    "price": 2499,
    "stockQuantity": 25,
    "description": "Bluetooth active noise canceling headphones"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "67026b42f3a8b21234567890",
      "name": "Wireless Headphones",
      "category": "Electronics",
      "price": 2499,
      "stockQuantity": 25,
      "description": "Bluetooth active noise canceling headphones",
      "createdAt": "2026-10-06T12:00:00.000Z",
      "updatedAt": "2026-10-06T12:00:00.000Z",
      "stockStatus": "In Stock"
    }
  }
  ```

### 2. List Products (with Search, Category Filter, and Price Sort)
- **Endpoint**: `GET /api/products`
- **Query Parameters**:
  - `search` (optional): Case-insensitive search on product name (e.g., `?search=phone`).
  - `category` (optional): Category filter (e.g., `?category=Electronics`).
  - `sort` (optional): `price_asc` (Low to High) or `price_desc` (High to Low).
  - Combined example: `GET /api/products?search=phone&category=Electronics&sort=price_asc`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [ ... ],
    "count": 10
  }
  ```

### 3. Get Dashboard Statistics
- **Endpoint**: `GET /api/products/stats`
- **Purpose**: Calculate live inventory metrics directly from MongoDB.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "totalProducts": 25,
      "inStock": 18,
      "lowStock": 5,
      "outOfStock": 2
    }
  }
  ```

### 4. Get Product Details by ID
- **Endpoint**: `GET /api/products/:id`
- **Response (200 OK)**: Returns individual product details.
- **Response (400 Bad Request)**: Invalid ObjectId format.
- **Response (404 Not Found)**: Product ID does not exist in MongoDB.

### 5. Update Product
- **Endpoint**: `PUT /api/products/:id`
- **Request Body**: Full/partial updated product fields.
- **Response (200 OK)**: Returns updated product.

### 6. Delete Product
- **Endpoint**: `DELETE /api/products/:id`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Product deleted successfully"
  }
  ```

---

## ⚡ Setup & Local Installation Guide

### Prerequisites
- **Node.js**: `v20.x` or `v22.x`
- **npm**: `v10.x`
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or **MongoDB Atlas Connection URI**.

### 1. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Set up environment variables (.env)
cp .env.example .env

# Seed sample database items
npm run seed

# Build TypeScript backend
npm run build

# Run Development Server
npm run dev
```
Backend will start on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Build Angular frontend
npm run build

# Start Angular Development Server
npm start
```
Frontend will open on `http://localhost:4200`.

---

## 🧪 Testing & Verification Report

An automated API test runner is included in `backend/src/tests/api.test.ts`.

### Run Automated API Test Suite
```bash
cd backend
npm run test:api
```

### Verification Test Execution Results

```text
==================================================
 RUNNING COMPREHENSIVE BACKEND API TEST SUITE
==================================================

✅ [PASS] TEST 1: Create product (POST /api/products)
✅ [PASS] TEST 2: Retrieve created product (GET /api/products/:id)
✅ [PASS] TEST 3: Update created product (PUT /api/products/:id)
✅ [PASS] TEST 4: Retrieve updated product (GET /api/products/:id)
✅ [PASS] TEST 5: Delete product (DELETE /api/products/:id)
✅ [PASS] TEST 6: Retrieve deleted product (Expected: 404)
✅ [PASS] TEST 7: Invalid input handling (price = -100, Expected: 400)
✅ [PASS] TEST 8: Missing record handling (Non-existent valid ID, Expected: 404)
✅ [PASS] TEST 9: Malformed ID handling (Invalid format, Expected: 400)
✅ [PASS] TEST 10: Search query parameter (GET /api/products?search=Headphones)
✅ [PASS] TEST 11: Category filter query parameter (GET /api/products?category=Electronics)
✅ [PASS] TEST 12: Price sort query parameter (GET /api/products?sort=price_asc)

==================================================
 TEST SUMMARY: 12 PASSED | 0 FAILED
==================================================
```

---

## 🚀 Deployment Instructions

### Database Deployment (MongoDB Atlas)
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and copy the connection string.
3. Configure Network Access to allow access from any IP (`0.0.0.0/0`) or your backend server IP.

### Backend Deployment (Render / Railway)
1. Push project repository to GitHub.
2. Create a new Web Service on Render pointing to the `backend/` directory.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Set Environment Variables:
   - `PORT=5000`
   - `MONGODB_URI=<Your MongoDB Atlas URI>`
   - `FRONTEND_URL=<Your Deployed Frontend Domain>`
   - `NODE_ENV=production`

### Frontend Deployment (Vercel / Netlify)
1. Connect repository to Vercel/Netlify pointing to `frontend/` directory.
2. Build Command: `npm run build`
3. Output Directory: `dist/frontend/browser`
4. Set Environment Configuration `environment.prod.ts` `apiBaseUrl` to your deployed backend URL.

---

## 📋 Evaluation Checklist

- [x] **Product List**: Table on desktop, Cards on mobile.
- [x] **Product Details**: Complete document inspection with timestamps.
- [x] **Create Product**: Angular Reactive Form with validation & backend API call.
- [x] **Edit Product**: Pre-filled form with PUT update persistence.
- [x] **Delete Product**: Confirmation modal dialog prior to deletion.
- [x] **Search**: Case-insensitive name search via backend query param.
- [x] **Category Filter**: Filter selector for Electronics, Clothing, Books, Home, Sports, Other.
- [x] **Price Sorting**: Low to High & High to Low sorting.
- [x] **Stock Quantity Management**: Editable quantity with derived status.
- [x] **Stock Status**: Automatically calculated status (`In Stock`, `Low Stock`, `Out of Stock`).
- [x] **Frontend & Backend Validation**: Client inline messages & Express server rejection.
- [x] **Database Persistence**: MongoDB Atlas storing all CRUD changes.
- [x] **State Consistency**: Page refresh maintains updated DB state.
- [x] **Clean Architecture**: Feature-based frontend and layer-based backend.

---

## 🎓 Placement Technical Verification Q&A

**1. Why did you choose Angular for the frontend?**  
Angular provides an enterprise-ready framework with built-in Dependency Injection, typed Reactive Forms, and HttpClient module out of the box, ensuring strict type safety and standardized architecture across the codebase.

**2. Why is stock status derived rather than stored directly in the database?**  
Storing `stockStatus` as an independent editable database field risks data inconsistency (e.g. `stockQuantity: 0` but `stockStatus: "In Stock"`). Deriving `stockStatus` dynamically guarantees data integrity.

**3. How is backend error handling implemented?**  
A centralized Express error middleware captures validation errors, Mongoose `CastError` (invalid ObjectId), and unexpected runtime failures. In production, stack traces are sanitized to hide sensitive server details.

**4. How does the search and filter query combination work?**  
The backend `ProductService` constructs a dynamic MongoDB filter query combining case-insensitive regular expressions for search, category equality matches, and price sort objects into a single database query.

---

*Project developed for Gupio Campus Placement Evaluation.*
