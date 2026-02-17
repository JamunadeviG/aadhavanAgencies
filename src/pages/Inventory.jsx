import AdminLayout from '../components/AdminLayout.jsx';

const Inventory = () => {
  return (
    <AdminLayout active="inventory" title="Inventory Management">
      <div className="inventory-placeholder">
        <h2>Inventory Management</h2>
        <p>Manage your stock levels, track inventory movements, and set low-stock alerts.</p>
        <div className="placeholder-actions">
          <button className="btn btn-primary">Add New Item</button>
          <button className="btn ghost">Generate Report</button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Inventory;
