import React, { useState, useEffect, useCallback } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService.js';
import AdminLayout from '../components/AdminLayout.jsx';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getImageUrl } from '../utils/imageUtils.js';
import './Products.css';

// Separate Sortable Product Card Component
const SortableProductItem = ({ product, id, isSelected, onToggleSelect, onInlineEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={"prod-card-wrapper " + (isSelected ? 'selected' : '')}>
      <div className="drag-handle" {...attributes} {...listeners}>
        <span>⋮⋮</span>
      </div>
      <div className="select-checkbox-zone">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(product._id)}
          className="prod-checkbox"
        />
      </div>
      <div className="prod-data-display">
        <div className="prod-thumb">
          {product.image ? (
            <img src={getImageUrl(product.image)} alt={product.name} onError={(e) => { e.target.style.display = 'none' }} />
          ) : (
            <div className="no-thumb">N/A</div>
          )}
        </div>
        <div className="prod-meta">
          <h4>{product.name}</h4>
          <span className="prod-category">{product.category}</span>
        </div>
        <div className="prod-price-stock">
          <div className="p-price">₹{product.price} /{product.unit}</div>
          <div className={"p-stock " + (product.stock > 0 ? 'in' : 'out')}>
            {product.stock} left
          </div>
        </div>
        <div className="prod-row-actions">
          <button onClick={() => onInlineEdit(product)} className="action-btn edit">Edit</button>
          <button onClick={() => onDelete(product._id)} className="action-btn delete">🗑️</button>
        </div>
      </div>
    </div>
  );
};

// Inline Edit Form Component
const InlineEditForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || 'Others',
    unit: product?.unit || '',
    price: product?.price || '',
    stock: product?.stock || ''
  });

  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(product?._id, formData, imageFile);
  };

  return (
    <div className="inline-edit-expansion slide-down">
      <form onSubmit={handleSubmit} className="inline-form">
        <div className="inline-grid">
          <div className="inp-group">
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="inp-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="Grain & cereals">Grain & cereals</option>
              <option value="Pulses & Dals">Pulses & Dals</option>
              <option value="Spices & Masalas">Spices & Masalas</option>
              <option value="Edible Oils & Ghee">Edible Oils & Ghee</option>
              <option value="Snacks & Packaged Foods">Snacks & Packaged Foods</option>
            </select>
          </div>
          <div className="inp-group">
            <label>Unit</label>
            <input type="text" name="unit" value={formData.unit} onChange={handleChange} required />
          </div>
          <div className="inp-group">
            <label>Price</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} required />
          </div>
          <div className="inp-group">
            <label>Stock</label>
            <input type="number" name="stock" value={formData.stock} onChange={handleChange} required />
          </div>
          <div className="inp-group">
            <label>Replace Image (opt)</label>
            <input type="file" onChange={(e) => setImageFile(e.target.files[0])} />
          </div>
        </div>
        <div className="inline-actions">
          <button type="button" className="btn cancel-btn" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn save-btn">Save Changes</button>
        </div>
      </form>
    </div>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null); // Tracks which product is expanding inline
  const [isAddingNew, setIsAddingNew] = useState(false);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      // Ensure all products have a valid id for dnd-kit
      const secureProducts = (res.products || []).map((p, i) => ({ ...p, fallbackId: p._id || ("fallback-" + i) }));
      setProducts(secureProducts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setProducts((items) => {
        const oldIndex = items.findIndex((i) => (i._id || i.fallbackId) === active.id);
        const newIndex = items.findIndex((i) => (i._id || i.fallbackId) === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      // In a real app we would ping the new order array to the DB right here.
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm("Delete " + selectedIds.length + " products?")) return;
    try {
      // Deleting in parallel
      await Promise.all(selectedIds.map(id => deleteProduct(id)));
      setSelectedIds([]);
      fetchProducts();
    } catch (err) {
      alert("Bulk delete failed");
    }
  };

  const handleInlineSave = async (id, data, imageFile) => {
    try {
      if (id === 'NEW') {
        const res = await createProduct({
          ...data,
          price: parseFloat(data.price),
          stock: parseInt(data.stock)
        }, imageFile);
        setIsAddingNew(false);
      } else {
        await updateProduct(id, {
          ...data,
          price: parseFloat(data.price),
          stock: parseInt(data.stock)
        }, imageFile);
        setEditingId(null);
      }
      fetchProducts();
    } catch (err) {
      alert("Save failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product permanently?')) {
      await deleteProduct(id);
      fetchProducts();
    }
  };

  return (
    <AdminLayout active="products" title="Inventory Management">

      {/* Top Header Actions */}
      <div className="prod-management-header">
        <div className="left-controls">
          <button className="create-new-btn" onClick={() => { setIsAddingNew(true); setEditingId(null); }}>
            + Add New Product
          </button>
          <button className="refresh-sync-btn" onClick={fetchProducts}>
            ↻ Sync Data
          </button>
        </div>
      </div>

      {/* New Product Inline Form Addition */}
      {isAddingNew && (
        <div className="new-product-wrapper">
          <div className="new-header">Creating New Product Sequence</div>
          <InlineEditForm
            product={null}
            onSave={(id, d, f) => handleInlineSave('NEW', d, f)}
            onCancel={() => setIsAddingNew(false)}
          />
        </div>
      )}

      {/* Drag & Drop Main Grid context */}
      <div className="dnd-grid-container">
        {loading ? (
          <div className="skeleton-loader">Loading Inventory System...</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={products.map(p => p._id || p.fallbackId)} strategy={rectSortingStrategy}>
              <div className="sortable-list">
                {products.map((product) => {
                  const idString = product._id || product.fallbackId;
                  const isEditing = editingId === idString;

                  return (
                    <div className="product-row-animator" key={idString}>
                      {!isEditing ? (
                        <SortableProductItem
                          id={idString}
                          product={product}
                          isSelected={selectedIds.includes(product._id)}
                          onToggleSelect={toggleSelect}
                          onInlineEdit={() => { setEditingId(idString); setIsAddingNew(false); }}
                          onDelete={handleDelete}
                        />
                      ) : (
                        <div className="inline-edit-enclosure">
                          <InlineEditForm
                            product={product}
                            onSave={handleInlineSave}
                            onCancel={() => setEditingId(null)}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Bulk Action Sliding Toolbar */}
      <div className={"bulk-action-toolbar " + (selectedIds.length > 0 ? 'visible' : '')}>
        <div className="bulk-info">
          <span className="count">{selectedIds.length}</span> products selected
        </div>
        <div className="bulk-actions">
          <button className="bulk-btn cancel" onClick={() => setSelectedIds([])}>Deselect</button>
          <button className="bulk-btn apply-discount">Apply Discount (Demo)</button>
          <button className="bulk-btn delete-all" onClick={handleBulkDelete}>Delete Selected</button>
        </div>
      </div>

    </AdminLayout>
  );
};

export default Products;
