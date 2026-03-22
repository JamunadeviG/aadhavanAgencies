# Stock Management API Documentation

This document outlines the API endpoints that need to be implemented on the backend to support dynamic stock management when orders are updated.

## 📦 Stock Management Endpoints

### 1. Update Single Product Stock
```http
PATCH /api/products/:productId/stock
```

**Request Body:**
```json
{
  "quantityChange": 5,
  "operation": "subtract", // or "add"
  "reason": "Order ORD-123 - shipped",
  "orderId": "ORD-123",
  "status": "shipped"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stock updated successfully",
  "product": {
    "_id": "prod_123",
    "name": "Rice 5kg",
    "stock": 45,
    "previousStock": 50,
    "stockHistory": [
      {
        "date": "2026-03-22T15:30:00.000Z",
        "change": -5,
        "operation": "subtract",
        "reason": "Order ORD-123 - shipped",
        "orderId": "ORD-123"
      }
    ]
  }
}
```

### 2. Update Multiple Product Stocks (Bulk)
```http
PATCH /api/products/stock/bulk
```

**Request Body:**
```json
{
  "stockUpdates": [
    {
      "productId": "prod_123",
      "productName": "Rice 5kg",
      "quantity": 2,
      "operation": "subtract",
      "reason": "Order ORD-123 - shipped",
      "orderId": "ORD-123",
      "status": "shipped"
    },
    {
      "productId": "prod_456",
      "productName": "Sugar 1kg",
      "quantity": 3,
      "operation": "subtract",
      "reason": "Order ORD-123 - shipped",
      "orderId": "ORD-123",
      "status": "shipped"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stock updated for 2 products",
  "updates": [
    {
      "productId": "prod_123",
      "success": true,
      "previousStock": 50,
      "newStock": 48,
      "message": "Stock reduced by 2"
    },
    {
      "productId": "prod_456",
      "success": true,
      "previousStock": 25,
      "newStock": 22,
      "message": "Stock reduced by 3"
    }
  ]
}
```

### 3. Get Product Stock
```http
GET /api/products/:productId/stock
```

**Response:**
```json
{
  "success": true,
  "product": {
    "_id": "prod_123",
    "name": "Rice 5kg",
    "stock": 45,
    "lowStockThreshold": 10,
    "isLowStock": false
  }
}
```

### 4. Get Low Stock Products
```http
GET /api/products/low-stock?threshold=10
```

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "_id": "prod_789",
      "name": "Oil 1L",
      "stock": 8,
      "lowStockThreshold": 10,
      "isLowStock": true
    }
  ],
  "count": 1
}
```

### 5. Get Stock History
```http
GET /api/products/:productId/stock-history
```

**Response:**
```json
{
  "success": true,
  "history": [
    {
      "date": "2026-03-22T15:30:00.000Z",
      "change": -5,
      "operation": "subtract",
      "reason": "Order ORD-123 - shipped",
      "orderId": "ORD-123",
      "previousStock": 50,
      "newStock": 45
    },
    {
      "date": "2026-03-21T10:15:00.000Z",
      "change": 20,
      "operation": "add",
      "reason": "Stock replenishment",
      "previousStock": 30,
      "newStock": 50
    }
  ]
}
```

## 📦 Order Stock Processing Endpoints

### 1. Mark Order as Stock Processed
```http
PATCH /api/orders/:orderId/stock-processed
```

**Request Body:**
```json
{
  "stockProcessed": true,
  "processedStatus": "shipped",
  "processedAt": "2026-03-22T15:30:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order marked as stock processed",
  "order": {
    "_id": "ORD-123",
    "stockProcessed": true,
    "processedStatus": "shipped",
    "processedAt": "2026-03-22T15:30:00.000Z"
  }
}
```

### 2. Check Order Stock Status
```http
GET /api/orders/:orderId/stock-status
```

**Response:**
```json
{
  "success": true,
  "stockProcessed": true,
  "processedStatus": "shipped",
  "processedAt": "2026-03-22T15:30:00.000Z",
  "stockUpdates": [
    {
      "productId": "prod_123",
      "quantity": 2,
      "processedAt": "2026-03-22T15:30:00.000Z"
    }
  ]
}
```

## 📦 Enhanced Order Status Update Endpoint

### Update Order Status with Stock Management
```http
PUT /api/orders/:orderId/status
```

**Request Body:**
```json
{
  "status": "shipped",
  "updateStock": true,
  "previousStatus": "processing"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "order": {
    "_id": "ORD-123",
    "status": "shipped",
    "previousStatus": "processing",
    "updatedAt": "2026-03-22T15:30:00.000Z",
    "stockProcessed": true,
    "processedAt": "2026-03-22T15:30:00.000Z"
  },
  "stockUpdate": {
    "success": true,
    "message": "Stock updated for 2 products",
    "updates": [
      {
        "productId": "prod_123",
        "productName": "Rice 5kg",
        "previousStock": 50,
        "newStock": 48,
        "quantity": 2
      }
    ]
  }
}
```

## 📦 Database Schema Updates

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  price: Number,
  stock: Number,
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  stockHistory: [{
    date: Date,
    change: Number,
    operation: String, // 'add' or 'subtract'
    reason: String,
    orderId: String,
    previousStock: Number,
    newStock: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  orderId: String,
  customerName: String,
  customerEmail: String,
  items: [{
    productId: String,
    productName: String,
    quantity: Number,
    price: Number
  }],
  total: Number,
  status: String, // 'placed', 'processing', 'shipped', 'delivered', 'cancelled'
  previousStatus: String,
  stockProcessed: {
    type: Boolean,
    default: false
  },
  processedStatus: String,
  processedAt: Date,
  lastStockUpdate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 📦 Stock Update Logic Rules

### When Order Status Changes:

1. **placed → processing**: No stock change
2. **processing → shipped**: Deduct stock from products
3. **shipped → delivered**: No stock change (already deducted)
4. **delivered → cancelled**: Restore stock (if stock was processed)
5. **shipped → cancelled**: Restore stock
6. **processing → cancelled**: No stock change (stock not yet deducted)
7. **placed → cancelled**: No stock change (stock not yet deducted)

### Stock Validation Rules:

1. **Check Stock Availability**: Before deducting stock, verify sufficient stock exists
2. **Prevent Negative Stock**: Don't allow stock to go below 0
3. **Low Stock Alert**: Mark products as low stock when below threshold
4. **Stock History**: Maintain complete audit trail of all stock changes
5. **Bulk Operations**: Ensure all stock updates in an order are atomic (all succeed or all fail)

### Error Handling:

1. **Insufficient Stock**: Return error with details of which products don't have enough stock
2. **Product Not Found**: Return error for missing products
3. **Invalid Operation**: Validate operation type ('add' or 'subtract')
4. **Database Errors**: Proper error messages and logging

## 📦 Implementation Priority

### Phase 1: Core Stock Management
1. `PATCH /api/products/:productId/stock`
2. `PATCH /api/products/stock/bulk`
3. Update order status endpoint with stock processing

### Phase 2: Stock Monitoring
1. `GET /api/products/low-stock`
2. `GET /api/products/:productId/stock-history`
3. Stock processing tracking for orders

### Phase 3: Advanced Features
1. Stock alerts and notifications
2. Automatic stock reports
3. Stock forecasting and analytics

## 📦 Testing Requirements

### Unit Tests:
- Stock deduction logic
- Stock restoration logic
- Bulk stock updates
- Stock validation rules

### Integration Tests:
- Order status update with stock changes
- Concurrent stock updates
- Error handling scenarios

### Load Tests:
- Multiple simultaneous stock updates
- Bulk order processing
- Stock history performance

This API design ensures that stock is automatically and accurately managed when orders are marked as "shipped" or "delivered", with proper error handling and audit trails.
