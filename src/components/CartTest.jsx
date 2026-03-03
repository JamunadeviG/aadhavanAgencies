// Test component to isolate cart functionality
import React, { useState } from 'react';
import { addToCart } from '../services/cartApiService.js';

const CartTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAddToCart = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      console.log('🧪 CART TEST: Starting test...');
      
      // Test with a known product ID format
      const testData = {
        productId: '507f1f77bcf86cd799439011', // Valid ObjectId format
        quantity: 1
      };
      
      console.log('🧪 CART TEST: Sending data:', testData);
      
      const response = await addToCart(testData);
      
      console.log('🧪 CART TEST: Response:', response);
      setTestResult(`✅ Success: ${JSON.stringify(response, null, 2)}`);
      
    } catch (error) {
      console.error('🧪 CART TEST: Error:', error);
      console.error('🧪 CART TEST: Error response:', error.response?.data);
      setTestResult(`❌ Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #007bff', margin: '20px' }}>
      <h3>🧪 Cart Functionality Test</h3>
      <button 
        onClick={testAddToCart}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Add to Cart'}
      </button>
      
      {testResult && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          backgroundColor: testResult.includes('✅') ? '#d4edda' : '#f8d7da',
          borderRadius: '5px',
          fontFamily: 'monospace',
          fontSize: '12px',
          whiteSpace: 'pre-wrap'
        }}>
          {testResult}
        </div>
      )}
      
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        <p>Check browser console for detailed logs</p>
        <p>Make sure server is running on localhost:5000</p>
        <p>Make sure you're logged in</p>
      </div>
    </div>
  );
};

export default CartTest;
