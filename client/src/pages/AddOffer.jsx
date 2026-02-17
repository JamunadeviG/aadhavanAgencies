import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout.jsx';
import { addOffer, getOffers, updateOffer, deleteOffer } from '../utils/offerStorage.js';
import './AddOffer.css';

const AddOffer = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    discount: '',
    validTill: ''
  });
  const [offers, setOffers] = useState(() => getOffers());
  const [toast, setToast] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const timer = toast ? setTimeout(() => setToast(null), 2500) : null;
    return () => timer && clearTimeout(timer);
  }, [toast]);

  const isValid = useMemo(() => {
    return form.title.trim() && form.description.trim() && form.discount && form.validTill;
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
      validTill: form.validTill
    };

    const updated = editingId ? updateOffer(editingId, payload) : addOffer(payload);

    setOffers(updated);
    setForm({ title: '', description: '', discount: '', validTill: '' });
    setEditingId(null);
    setToast(editingId ? 'Offer updated successfully' : 'Offer published successfully');
  };

  const handleEdit = (offer) => {
    setEditingId(offer.id);
    setForm({
      title: offer.title,
      description: offer.description,
      discount: String(offer.discount),
      validTill: offer.validTill
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm('Delete this offer?');
    if (!confirmed) return;
    const updated = deleteOffer(id);
    setOffers(updated);
    if (editingId === id) {
      setEditingId(null);
      setForm({ title: '', description: '', discount: '', validTill: '' });
    }
    setToast('Offer removed');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ title: '', description: '', discount: '', validTill: '' });
  };

  return (
    <AdminLayout active="offers" title="Create Promotions">
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
