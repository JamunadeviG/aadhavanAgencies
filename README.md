# Wholesale Grocery ERP - Beginner-Friendly ERP System

A scalable ERP web application for wholesale grocery shops built with React, Node.js, Express, and MongoDB.

## 🎯 Project Scope (10% Implementation)

This is the initial 10% implementation focusing on:
- ✅ Project folder structure
- ✅ User authentication (Admin role only)
- ✅ Product management (CRUD operations)
- ✅ Basic inventory stock tracking
- ✅ Simple dashboard summary

## 🛠️ Tech Stack

- **Frontend**: React (Vite)
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT
- **Styling**: Simple CSS (no Tailwind)

## 📁 Project Structure

```
code/
├── server/                 # Backend application
│   ├── models/            # MongoDB models (User, Product)
│   ├── routes/             # API routes
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth middleware
│   ├── server.js          # Express server entry point
│   └── package.json
│
├── client/                # Frontend application
│   ├── src/
│   │   ├── pages/         # Page components (Login, Dashboard, Products)
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API services
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # React entry point
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB instance)
- npm or yarn

### Step 1: Setup Backend

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string_here
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   ```

4. Start the backend server:
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000`

### Step 2: Setup Frontend

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new admin user
- `POST /api/auth/login` - Login admin user

### Products (Protected - requires JWT token)
- `POST /api/products` - Create a new product
- `GET /api/products` - Get all products
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

## 🔐 Authentication

1. **Register**: First, register an admin account using the register form
2. **Login**: Use your credentials to login
3. **Token**: JWT token is automatically stored in localStorage
4. **Protected Routes**: All product routes require authentication

## 📊 Features

### Dashboard
- View total number of products
- View total stock quantity across all products
- Quick navigation to product management

### Product Management
- Add new products with name, category, unit, price, and stock
- View all products in a table format
- Edit existing products
- Delete products
- Stock tracking (shows out-of-stock indicator when stock is 0)

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (default: 'admin')
}
```

### Product Model
```javascript
{
  name: String,
  category: String,
  unit: String (e.g., kg, liter, piece),
  price: Number,
  stock: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Configuration

### MongoDB Atlas Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and add it to `server/.env`

Example connection string format:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/erp_db?retryWrites=true&w=majority
```

## 📦 Building for Production

### Backend
```bash
cd server
npm start
```

### Frontend
```bash
cd client
npm run build
npm run preview
```

## 🎓 Code Structure for Beginners

- **Models**: Define database schemas and data structure
- **Controllers**: Handle business logic and database operations
- **Routes**: Define API endpoints and link them to controllers
- **Middleware**: Intercept requests (e.g., authentication check)
- **Services**: Frontend API communication layer
- **Pages**: React components for different views
- **Components**: Reusable UI components

## 🚧 Future Extensions (90% Remaining)

This codebase is designed to be easily extended with:
- Purchase management
- Sales management
- Billing and invoicing
- Payment tracking
- GST calculations
- Reports and analytics
- Multi-user roles
- Supplier management
- Customer management

## 📄 License

ISC

## 🤝 Contributing

This is a beginner-friendly project. Feel free to extend and modify as needed.

---

**Note**: Remember to change the JWT_SECRET in production and never commit `.env` files to version control.
