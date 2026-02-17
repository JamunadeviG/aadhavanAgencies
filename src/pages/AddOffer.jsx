import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout.jsx';
import { addOffer, getOffers, updateOffer, deleteOffer } from '../utils/offerStorage.js';
import './AddOffer.css';

const AddOffer = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    discount: '',
    validTill: '',
    productName: '',
    category: ''
  });
  const [offers, setOffers] = useState(() => getOffers());
  const [toast, setToast] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const timer = toast ? setTimeout(() => setToast(null), 2500) : null;
    return () => timer && clearTimeout(timer);
  }, [toast]);

  const isValid = useMemo(() => {
    return form.title.trim() && form.description.trim() && form.discount && form.validTill && form.productName && form.category;
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePublish = (e) => {
    e.preventDefault();
    if (!isValid) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      discount: Number(form.discount),
      validTill: form.validTill,
      productName: form.productName.trim(),
      category: form.category.trim()
    };

    const updated = editingId ? updateOffer(editingId, payload) : addOffer(payload);

    setOffers(updated);
    setForm({ title: '', description: '', discount: '', validTill: '', productName: '', category: '' });
    setEditingId(null);
    setToast(editingId ? 'Offer updated successfully' : 'Offer published successfully');
  };

  const handleEdit = (offer) => {
    navigate('/add-offer', { state: { editingOffer: offer } });
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm('Delete this offer?');
    if (!confirmed) return;
    const updated = deleteOffer(id);
    setOffers(updated);
    if (editingId === id) {
      setEditingId(null);
      setForm({ title: '', description: '', discount: '', validTill: '', productName: '', category: '' });
    }
    setToast('Offer removed');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: '', description: '', discount: '', validTill: '', productName: '', category: '' });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AdminLayout active="add-offer" title="Create Promotions">
      <div className="offer-grid">
        <section className="card">
          <div className="offer-head">
            <div>
              <div className="section-kicker">Campaign Builder</div>
              <h2>Launch a new offer</h2>
            </div>
            <div className="offer-head-actions">
              {editingId && (
                <button type="button" className="btn ghost" onClick={cancelEdit}>
                  Cancel edit
                </button>
              )}
              <button className="btn btn-primary" type="button">Save Draft</button>
            </div>
          </div>

          <form className="offer-form" onSubmit={handlePublish}>
            <label>
              Offer Name
              <input
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="Festival combo"
                required
              />
            </label>
            <label>
              Description
              <textarea
                name="description"
                rows="3"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the promotion"
                required
              />
            </label>
            <div className="offer-row">
              <label>
                Product Name
                <input
                  name="productName"
                  type="text"
                  value={form.productName}
                  onChange={handleChange}
                  placeholder="e.g., Premium Rice"
                  required
                />
              </label>
              <label>
                Discount (%)
                <input
                  name="discount"
                  type="number"
                  min="0"
                  max="90"
                  value={form.discount}
                  onChange={handleChange}
                  placeholder="10"
                  required
                />
              </label>
              <label>
                Valid Till
                <input
                  name="validTill"
                  type="date"
                  value={form.validTill}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Category
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Dairy &amp; Eggs">Dairy &amp; Eggs</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Rice &amp; Grains">Rice &amp; Grains</option>
                  <option value="Grocery &amp; Staples">Grocery &amp; Staples</option>
                  <option value="Snacks &amp; Mixes">Snacks &amp; Mixes</option>
                  <option value="Spices &amp; Masala">Spices &amp; Masala</option>
                  <option value="Cleaning Supplies">Cleaning Supplies</option>
                </select>
              </label>
            </div>
            <button type="submit" className="btn btn-primary" disabled={!isValid}>
              {editingId ? 'Update Offer' : 'Publish Offer'}
            </button>
          </form>
        </section>

        <section className="card">
          <div className="section-kicker">Recent offers</div>
          <ul className="offer-list">
            {offers.map((offer) => (
              <li key={offer.id}>
                <div>
                  <strong>{offer.title}</strong>
                  <span>
                    {offer.discount}% off • Valid till {new Date(offer.validTill).toLocaleDateString()}
                    {offer.productName && (
                      <span className="offer-product">Product: {offer.productName}</span>
                    )}
                    {offer.category && (
                      <span className="offer-category">Category: {offer.category}</span>
                    )}
                  </span>
                </div>
                <div className="offer-list-actions">
                  <button className="btn ghost" onClick={() => handleEdit(offer)}>
                    Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(offer.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {toast && (
        <div className="offer-toast" role="status">
          {toast}
        </div>
      )}
    </AdminLayout>
  );
};

export default AddOffer;
