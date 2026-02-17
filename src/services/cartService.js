// Cart Service - Centralized cart management for the ERP system

/**
 * Get cart items from localStorage
 * @returns {Array} Array of cart items
 */
export const getCart = () => {
  try {
    const savedCart = localStorage.getItem('cart');
    if (!savedCart) {
      return [];
    }
    
    let parsedCart;
    try {
      parsedCart = JSON.parse(savedCart);
    } catch (parseError) {
      console.error('Error parsing cart JSON:', parseError);
      return [];
    }
    
    // Ensure cart is always an array
    if (!Array.isArray(parsedCart)) {
      console.log('Cart is not an array, converting to array');
      return [parsedCart];
    }
    
    return parsedCart;
  } catch (error) {
    console.error('Error getting cart:', error);
    return [];
  }
};

/**
 * Save cart items to localStorage
 * @param {Array} cartItems - Array of cart items
 */
export const saveCart = (cartItems) => {
  try {
    if (!Array.isArray(cartItems)) {
      throw new Error('Cart items must be an array');
    }
    localStorage.setItem('cart', JSON.stringify(cartItems));
  } catch (error) {
    console.error('Error saving cart:', error);
    throw error;
  }
};

/**
 * Add product to cart
 * @param {Object} product - Product object to add
 * @returns {Object} Updated cart items
 */
export const addToCart = (product) => {
  try {
    const existingCart = getCart();
    
    // Get product ID safely
    const productId = product._id || product.id;
    
    if (!productId) {
      throw new Error('Product must have either _id or id');
    }
    
    // Check if product already exists in cart
    const existingItemIndex = existingCart.findIndex(item => {
      const itemId = item._id || item.id;
      return itemId === productId;
    });
    
    let updatedCart;
    
    if (existingItemIndex !== -1) {
      // Update quantity if already exists
      updatedCart = [...existingCart];
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity: (updatedCart[existingItemIndex].quantity || 1) + 1
      };
    } else {
      // Add new item to cart
      const cartItem = {
        productId: productId,
        _id: product._id,
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        quantity: 1,
        stock: product.stock,
        addedAt: new Date().toISOString()
      };
      updatedCart = [...existingCart, cartItem];
    }
    
    // Save to localStorage
    saveCart(updatedCart);
    
    // Dispatch cart update event
    window.dispatchEvent(new Event('cartUpdated'));
    
    return updatedCart;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

/**
 * Update product quantity in cart
 * @param {string} productId - Product ID (_id or id)
 * @param {number} quantity - New quantity
 * @returns {Object} Updated cart items
 */
export const updateQuantity = (productId, quantity) => {
  try {
    if (!quantity || quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    
    const existingCart = getCart();
    
    const updatedCart = existingCart.map(item => {
      const itemId = item._id || item.id;
      if (itemId === productId) {
        return { ...item, quantity };
      }
      return item;
    });
    
    // Save to localStorage
    saveCart(updatedCart);
    
    // Dispatch cart update event
    window.dispatchEvent(new Event('cartUpdated'));
    
    return updatedCart;
  } catch (error) {
    console.error('Error updating quantity:', error);
    throw error;
  }
};

/**
 * Remove product from cart
 * @param {string} productId - Product ID (_id or id)
 * @returns {Object} Updated cart items
 */
export const removeFromCart = (productId) => {
  try {
    const existingCart = getCart();
    
    const updatedCart = existingCart.filter(item => {
      const itemId = item._id || item.id;
      return itemId !== productId;
    });
    
    // Save to localStorage
    saveCart(updatedCart);
    
    // Dispatch cart update event
    window.dispatchEvent(new Event('cartUpdated'));
    
    return updatedCart;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

/**
 * Clear entire cart
 * @returns {Array} Empty cart array
 */
export const clearCart = () => {
  try {
    localStorage.removeItem('cart');
    
    // Dispatch cart update event
    window.dispatchEvent(new Event('cartUpdated'));
    
    return [];
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

/**
 * Get cart item count (total quantity of all items)
 * @returns {number} Total item count
 */
export const getCartCount = () => {
  try {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }
};

/**
 * Calculate cart total
 * @returns {number} Total price
 */
export const getCartTotal = () => {
  try {
    const cart = getCart();
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return total + (price * quantity);
    }, 0);
  } catch (error) {
    console.error('Error calculating cart total:', error);
    return 0;
  }
};

/**
 * Get product from cart by ID
 * @param {string} productId - Product ID (_id or id)
 * @returns {Object|null} Cart item or null if not found
 */
export const getCartItem = (productId) => {
  try {
    const cart = getCart();
    return cart.find(item => {
      const itemId = item._id || item.id;
      return itemId === productId;
    }) || null;
  } catch (error) {
    console.error('Error getting cart item:', error);
    return null;
  }
};
