import AdminLayout from '../components/AdminLayout.jsx';

const users = [
  { name: 'Aadhavan Admin', email: 'aadhavan@gmail.com', role: 'Admin', lastLogin: 'Today, 8:42 AM' },
  { name: 'Kumaran Traders', email: 'orders@kumaran.co', role: 'Buyer', lastLogin: 'Yesterday, 9:10 PM' },
  { name: 'Ravi Stores', email: 'ravi@stores.com', role: 'Buyer', lastLogin: '2 days ago' }
];

const Users = () => {
  return (
    <AdminLayout active="users" title="Users & Customers">
      <div className="admin-table">
        <div className="admin-table-head">
          <div>
            <div className="kicker">Access control</div>
            <h2>Manage accounts</h2>
          </div>
          <button className="btn btn-primary">Add User</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Last Login</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.lastLogin}</td>
                <td>
                  <button className="btn ghost">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default Users;
