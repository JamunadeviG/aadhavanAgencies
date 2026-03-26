const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const Product = require('../models/Product');
const PriceUpdate = require('../models/PriceUpdate');
const Notification = require('../models/Notification');

// Configure axios timeout and headers for scraping
const axiosConfig = {
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/json,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5'
  }
};

/**
 * Fetch a price based on URL, scraping type, and CSS/JSON selector
 */
const fetchPrice = async (url, type, selector) => {
  if (!url || !type || !selector) return null;

  try {
    if (type === 'API') {
      const response = await axios.get(url, { timeout: axiosConfig.timeout });
      // Resolve deeply nested properties like "data.product.price"
      const keys = selector.split('.');
      let current = response.data;
      
      for (const key of keys) {
        if (current === null || current === undefined || current[key] === undefined) {
          return null;
        }
        current = current[key];
      }
      
      const price = parseFloat(current);
      return isNaN(price) ? null : price;

    } else if (type === 'SCRAPE') {
      const response = await axios.get(url, axiosConfig);
      const $ = cheerio.load(response.data);
      const priceText = $(selector).first().text();
      
      if (!priceText) return null;

      // Extract numeric value from text like "₹ 1,200.50" -> 1200.50
      const matches = priceText.match(/[\d,]+\.?\d*/);
      if (matches) {
         const numericValue = parseFloat(matches[0].replace(/,/g, ''));
         return isNaN(numericValue) ? null : numericValue;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Error fetching price from ${url} (${type}):`, error.message);
    return null;
  }
};

/**
 * Iterates through dynamic pricing configured products, compares price and requests update if changed
 */
const checkAndUpdatePrices = async () => {
  console.log(`[${new Date().toISOString()}] 🔄 Starting automated price monitoring cycle...`);
  try {
    // Find all products that have a priceSourceUrl and priceSourceType config
    const products = await Product.find({ 
      priceSourceUrl: { $ne: null },
      priceSourceType: { $ne: null },
      priceSelector: { $ne: null }
    });
    
    if (products.length === 0) {
      console.log('ℹ️ No products configured for dynamic price monitoring.');
      return;
    }

    console.log(`📡 Found ${products.length} products to monitor.`);
    
    for (const product of products) {
      const newMrp = await fetchPrice(
        product.priceSourceUrl, 
        product.priceSourceType, 
        product.priceSelector
      );
      
      if (newMrp !== null) {
        if (product.mrp !== newMrp) {
          console.log(`📈 Price change detected for ID:${product._id} (${product.name}): MRP changed from ${product.mrp || 'N/A'} to ${newMrp}`);
          
          // Check if there is already a pending update for this product
          const existingPending = await PriceUpdate.findOne({ product: product._id, status: 'PENDING' });
          
          if (existingPending) {
             // Just update the latest detected price
             if (existingPending.newMrp !== newMrp) {
                existingPending.newMrp = newMrp;
                existingPending.detectedAt = Date.now();
                await existingPending.save();
             }
          } else {
             // Create approval request
             const priceUpdate = await PriceUpdate.create({
               product: product._id,
               productName: product.name,
               oldMrp: product.mrp || 0,
               newMrp: newMrp,
               sourceType: product.priceSourceType
             });

             // Trigger Notification to Admin
             await Notification.create({
               title: 'Price Update Detected',
               message: `Product "${product.name}" price changed from ₹${product.mrp || 0} to ₹${newMrp}. Approval required.`,
               type: 'PRICE_UPDATE',
               referenceId: priceUpdate._id,
               forRoles: ['admin'] // Target admin
             });
             
             console.log(`✅ Update request created for ID:${product._id}. Awaiting admin approval.`);
          }
        }
        
        product.lastPriceCheck = new Date();
        await product.save();

      } else {
        // Just update last check time if we failed to parse a number
        product.lastPriceCheck = new Date();
        await product.save();
        console.warn(`⚠️ Could not determine price for ID:${product._id} (${product.name})`);
      }
      
      // Sleep slightly to prevent rate listing/IP bans from scraping sources
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log('✅ Automated price monitoring cycle completed.');
  } catch (error) {
    console.error('❌ Error in price monitoring service:', error);
  }
};

/**
 * Initialize background chron job for dynamic pricing
 */
const startPriceMonitorJob = () => {
  // Run every 2 hours ('0 */2 * * *')
  cron.schedule('0 */2 * * *', () => {
    checkAndUpdatePrices();
  });
  console.log('✅ Background price monitoring job scheduled (running every 2 hours)');
  
  // Optionally, kick off the first cycle 5 seconds after start
  setTimeout(() => {
    checkAndUpdatePrices();
  }, 5000);
};

module.exports = {
  fetchPrice,
  checkAndUpdatePrices,
  startPriceMonitorJob
};
