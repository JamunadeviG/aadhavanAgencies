import AdminLayout from '../components/AdminLayout.jsx';

const sampleOrders = [
  { id: 'ORD-1023', customer: 'Jaya Stores', status: 'Dispatched', eta: '2 hrs', amount: '₹12,450' },
  { id: 'ORD-1022', customer: 'SK Supermart', status: 'Packed', eta: '4 hrs', amount: '₹8,930' },
  { id: 'ORD-1021', customer: 'A1 Grocers', status: 'Delivered', eta: 'Completed', amount: '₹5,110' }
];

const TrackOrders = () => {
  return (
    <AdminLayout active="track" title="Track Orders">
      <div className="admin-table">
        <div className="admin-table-head">
          <div>
            <div className="kicker">Logistics overview</div>
            <h2>Live order monitoring</h2>
          </div>
          <button className="btn">Refresh</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Status</th>
              <th>ETA</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {sampleOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>
                  <span className={`status-pill status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td>{order.eta}</td>
                <td>{order.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default TrackOrders;
