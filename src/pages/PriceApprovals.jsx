import { useState, useEffect } from 'react';
import api from '../services/api.js';
import AdminLayout from '../components/AdminLayout.jsx';

const PriceApprovals = () => {
  const [updates, setUpdates] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchData();
    // Setting up simple polling every 30 seconds for near real-time updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch both pending updates and notification summaries
      const [updatesRes, notifRes] = await Promise.all([
        api.get('/price-updates').catch(() => ({ data: { updates: [] } })),
        api.get('/notifications').catch(() => ({ data: { notifications: [] } }))
      ]);
      
      if (updatesRes.data && updatesRes.data.success) {
        setUpdates(updatesRes.data.updates);
      }
      if (notifRes.data && notifRes.data.success) {
        setNotifications(notifRes.data.notifications);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching price approvals:', err);
      // Keep silent for polling errors unless it's initial load
      if (loading) setError('Failed to fetch approval queue.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      setProcessingId(id);
      await api.post(`/price-updates/${id}/${action}`);
      // Filter out the handled item locally for immediate UI response
      setUpdates(prev => prev.filter(item => item._id !== id));
      // Trigger a re-fetch to ensure sync
      fetchData();
    } catch (err) {
      console.error(`Failed to ${action} update:`, err);
      alert(`Failed to ${action} the price update. Please try again.`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout active="price-approvals" title="Pending Price Approvals">
      <div style={{ padding: '0 0 2rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Dynamic Pricing Queue</h2>
            <p style={{ color: '#666', marginTop: '0.25rem' }}>Review scraping and API price changes before pushing them live.</p>
          </div>
          <button 
            onClick={fetchData} 
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading pending reviews...</div>
        ) : updates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#f9f9f9', borderRadius: '8px', border: '1px dashed #ccc' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>All Caught Up! ✅</h3>
            <p style={{ color: '#666', margin: 0 }}>There are no pending price updates waiting for approval.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {updates.map((update) => {
              // Try to find matching notification for extra context if needed, mostly we just need the update details
              const timeString = new Date(update.detectedAt).toLocaleString();
              const priceDiff = update.newMrp - update.oldMrp;
              const isIncrease = priceDiff > 0;

              return (
                <div key={update._id} style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  padding: '1.5rem', 
                  background: 'white', 
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  borderLeft: `4px solid ${isIncrease ? '#ed6c02' : '#2e7d32'}` // Orange for increase, Green for drop
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    
                    {/* Details Column */}
                    <div style={{ flex: '1 1 300px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', background: '#e0e0e0', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', color: '#555' }}>
                          {update.sourceType}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#888' }}>Detected: {timeString}</span>
                      </div>
                      
                      <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>{update.productName}</h3>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>Product ID: {update.product}</div>
                    </div>

                    {/* Price Comparison Column */}
                    <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Old Price</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '500', color: '#757575', textDecoration: 'line-through' }}>₹{update.oldMrp}</div>
                      </div>
                      
                      <div style={{ color: '#bdbdbd', fontSize: '1.5rem' }}>➔</div>

                      <div style={{ textAlign: 'center' }}>
                         <div style={{ fontSize: '0.85rem', color: isIncrease ? '#ed6c02' : '#2e7d32', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 'bold' }}>New Price</div>
                         <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isIncrease ? '#ed6c02' : '#2e7d32' }}>₹{update.newMrp}</div>
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div style={{ flex: '0 0 150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem' }}>
                      <button 
                         onClick={() => handleAction(update._id, 'approve')}
                         disabled={processingId === update._id}
                         style={{
                           padding: '0.5rem 1rem',
                           background: '#fff',
                           border: '2px solid #2e7d32',
                           color: '#2e7d32',
                           fontWeight: 'bold',
                           borderRadius: '4px',
                           cursor: processingId === update._id ? 'not-allowed' : 'pointer',
                           opacity: processingId === update._id ? 0.7 : 1,
                           transition: 'all 0.2s'
                         }}
                         onMouseOver={(e) => {
                           if (processingId !== update._id) {
                             e.target.style.background = '#2e7d32';
                             e.target.style.color = '#fff';
                           }
                         }}
                         onMouseOut={(e) => {
                           if (processingId !== update._id) {
                             e.target.style.background = '#fff';
                             e.target.style.color = '#2e7d32';
                           }
                         }}
                      >
                        {processingId === update._id ? 'Processing...' : 'Accept'}
                      </button>
                      <button 
                         onClick={() => handleAction(update._id, 'reject')}
                         disabled={processingId === update._id}
                         style={{
                           padding: '0.5rem 1rem',
                           background: '#fff',
                           border: '1px solid #d32f2f',
                           color: '#d32f2f',
                           borderRadius: '4px',
                           cursor: processingId === update._id ? 'not-allowed' : 'pointer',
                           opacity: processingId === update._id ? 0.7 : 1,
                           transition: 'all 0.2s'
                         }}
                         onMouseOver={(e) => {
                           if (processingId !== update._id) {
                             e.target.style.background = '#ffeeee';
                           }
                         }}
                         onMouseOut={(e) => {
                           if (processingId !== update._id) {
                             e.target.style.background = '#fff';
                           }
                         }}
                      >
                        Reject
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PriceApprovals;
