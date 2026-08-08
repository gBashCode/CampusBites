import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Image as ImageIcon, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../apiConfig';
import { PrimaryButton, SecondaryButton, InputField, EmptyState } from '../../components/ui';

const ManageMenu = () => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const { user, token } = useAuth();

    const [formData, setFormData] = useState({
        name: '', price: '', category: 'Snacks', description: '', image: '', isAvailable: true, isVeg: true
    });

    const fetchProducts = async () => {
        setFetchLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/products`);
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : data.products || []);
        } catch (err) {
            console.error('Failed to fetch products');
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData(product);
        } else {
            setEditingProduct(null);
            setFormData({ name: '', price: '', category: 'Snacks', description: '', image: '', isAvailable: true, isVeg: true });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!user?.id) {
            alert('Authentication error. Please log in again.');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                fetchProducts();
            }
        } catch (err) {
            console.error('Delete error:', err);
        } finally {
            setConfirmDelete(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user?.id) {
            alert('Authentication error. Please log in again.');
            return;
        }

        setLoading(true);
        const url = editingProduct
            ? `${API_URL}/api/products/${editingProduct._id}`
            : `${API_URL}/api/products`;

        const method = editingProduct ? 'PUT' : 'POST';

        try {
            await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            setIsModalOpen(false);
            fetchProducts();
        } catch (err) {
            alert('Operation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ color: 'white' }}>
            {/* Header Action Bar */}
            <div className="header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-1px' }}>Menu</h1>
                    <p style={{ color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Manage items & prices</p>
                </div>
                <PrimaryButton icon={Plus} onClick={() => handleOpenModal()} className="add-btn">
                    Add Item
                </PrimaryButton>
            </div>

            {/* Table Area */}
            <div style={{ overflowX: 'hidden' }}>
                {fetchLoading ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                        <div style={{
                            width: '32px', height: '32px',
                            border: '3px solid var(--glass-border)',
                            borderTop: '3px solid var(--primary)',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                            margin: '0 auto 1rem'
                        }} />
                        <p>Loading menu items...</p>
                    </div>
                ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left' }}>Item</th>
                            <th style={{ textAlign: 'left' }}>Category</th>
                            <th style={{ textAlign: 'left' }}>Price</th>
                            <th style={{ textAlign: 'left' }}>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product._id} className="table-row">
                                <td data-label="Item">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: 'var(--surface)', overflow: 'hidden', flexShrink: 0 }}>
                                            {product.image ? (
                                                <img src={product.image} alt={`${product.name} image`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                                                    <ImageIcon size={18} />
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ overflow: 'hidden' }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td data-label="Category">{product.category}</td>
                                <td data-label="Price" style={{ fontWeight: 800, fontSize: '1.05rem' }}>₹{product.price}</td>
                                <td data-label="Status">
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        color: product.isAvailable ? 'var(--success)' : 'var(--text-secondary)',
                                        fontSize: '0.85rem',
                                        fontWeight: 600
                                    }}>
                                        {product.isAvailable ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                        {product.isAvailable ? 'Live' : 'Hidden'}
                                    </div>
                                </td>
                                <td data-label="Actions" style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                         <button className="action-btn" onClick={() => handleOpenModal(product)} title="Edit" aria-label={`Edit ${product.name}`}><Edit2 size={16} /></button>
                                        {confirmDelete === product._id ? (
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--danger)', color: 'white', border: 'none', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                                                >
                                                    Confirm
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDelete(null)}
                                                    style={{ padding: '4px 8px', borderRadius: '6px', background: 'var(--surface)', color: 'white', border: 'none', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                             <button className="action-btn delete" onClick={() => setConfirmDelete(product._id)} title="Delete" aria-label={`Delete ${product.name}`}><Trash2 size={16} /></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={editingProduct ? 'Edit menu item' : 'Add new menu item'}>
                    <div className="glass-card modal-content" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>{editingProduct ? 'Edit Item' : 'New Item'}</h2>
                            <button onClick={() => setIsModalOpen(false)} aria-label="Close dialog" className="btn-ghost"><XCircle size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <InputField label="Item Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Item Name" />
                            </div>

                            <div className="form-grid" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <InputField label="Price (₹)" required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="99" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <InputField label="Category" as="select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                        <option>Snacks</option>
                                        <option>Meals</option>
                                        <option>Beverages</option>
                                        <option>Combos</option>
                                        <option>Desserts</option>
                                    </InputField>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <InputField label="Description" as="textarea" rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Item description..." />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <InputField label="Image URL" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." />
                                {formData.image && (
                                    <div style={{ marginTop: '8px', width: '60px', height: '60px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Veg/Non-Veg Selection */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>Food Type</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {/* Veg Option */}
                                    <div
                                        onClick={() => setFormData({ ...formData, isVeg: true })}
                                        style={{
                                            flex: 1,
                                            padding: '1rem',
                                            borderRadius: 'var(--radius-md)',
                                            border: formData.isVeg ? '2px solid var(--success)' : '1px solid var(--glass-border)',
                                            background: formData.isVeg ? 'var(--success-surface)' : 'rgba(255,255,255,0.03)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}
                                    >
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            border: '2px solid var(--success)',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'white'
                                        }}>
                                            <div style={{
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                background: 'var(--success)'
                                            }} />
                                        </div>
                                        <span style={{ fontWeight: 600, color: formData.isVeg ? 'var(--success)' : 'var(--text-secondary)' }}>Vegetarian</span>
                                    </div>

                                    {/* Non-Veg Option */}
                                    <div
                                        onClick={() => setFormData({ ...formData, isVeg: false })}
                                        style={{
                                            flex: 1,
                                            padding: '1rem',
                                            borderRadius: 'var(--radius-md)',
                                            border: !formData.isVeg ? '2px solid var(--danger)' : '1px solid var(--glass-border)',
                                            background: !formData.isVeg ? 'var(--danger-surface)' : 'rgba(255,255,255,0.03)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}
                                    >
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            border: '2px solid var(--danger)',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'white'
                                        }}>
                                            <div style={{
                                                width: 0,
                                                height: 0,
                                                borderLeft: '5px solid transparent',
                                                borderRight: '5px solid transparent',
                                                borderBottom: '8px solid var(--danger)'
                                            }} />
                                        </div>
                                        <span style={{ fontWeight: 600, color: !formData.isVeg ? 'var(--danger)' : 'var(--text-secondary)' }}>Non-Vegetarian</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    id="available"
                                    checked={formData.isAvailable}
                                    onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                                />
                                <label htmlFor="available" style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>Available</label>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <SecondaryButton onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>Discard</SecondaryButton>
                                <PrimaryButton type="submit" disabled={loading} loading={loading} style={{ flex: 2 }}>
                                    {editingProduct ? 'Update' : 'Publish'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMenu;
