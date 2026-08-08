import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Star, Search, TrendingUp, Filter,
  Plus, Mail, Phone, MapPin, Instagram, Twitter
} from 'lucide-react';
import { FilterPill, EmptyState, ErrorDisplay, LoadingContainer, VegBadge } from '../components/ui';
import API_URL from '../apiConfig';

const CONTACT = {
  email: 'support@campusbites.com',
  phone: '+91 95358 47861',
  location: 'Main Canteen, Ground Floor, Academic Block',
};

const CATEGORIES = [
  { name: 'All', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop' },
  { name: 'Snacks', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=200&fit=crop' },
  { name: 'Meals', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&h=200&fit=crop' },
  { name: 'Beverages', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200&h=200&fit=crop' },
  { name: 'Combos', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop' },
  { name: 'Desserts', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=200&fit=crop' },
];

const MENU_PAGE = {
  wrapper: { padding: '0 1rem 8rem', maxWidth: 600, margin: '0 auto' },

  hero: {
    position: 'relative', height: 200, borderRadius: 'var(--radius-xl)',
    overflow: 'hidden', marginBottom: 'var(--space-lg)',
    boxShadow: 'var(--shadow-elevated)', animation: 'fadeIn 0.8s ease-out',
  },
  heroOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
    display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--space-lg)',
  },
  heroTitle: {
    fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-main)',
    marginBottom: 10, maxWidth: 220, lineHeight: 1.2,
  },
  heroSub: {
    fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
    maxWidth: 280, lineHeight: 1.4,
  },

  search: {
    borderRadius: 'var(--radius-lg)', padding: '12px var(--space-md)',
    display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
    animation: 'slideInUp 0.5s ease-out', marginBottom: 'var(--space-lg)',
  },
  searchInput: {
    background: 'transparent', border: 'none', color: 'var(--text-main)',
    width: '100%', fontSize: 'var(--text-base)', outline: 'none',
  },
  searchTrending: {
    background: 'var(--primary-surface)', borderRadius: 'var(--radius-md)', padding: 10,
  },

  categoriesWrap: {
    marginBottom: 'var(--space-lg)', padding: '0 4px',
  },
  categoriesScroll: {
    display: 'flex', gap: 'var(--space-sm)', overflowX: 'auto',
    padding: 'var(--space-xs) 0 var(--space-sm)',
    scrollbarWidth: 'none', msOverflowStyle: 'none',
  },
  categoryItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    cursor: 'pointer', minWidth: 70,
    transition: 'transform var(--duration-normal) var(--ease-bounce)',
  },
  categoryCircle: (active) => ({
    width: 68, height: 68, borderRadius: '50%', padding: 3,
    border: active ? '3px solid var(--primary)' : '2px solid var(--glass-border)',
    background: active ? 'var(--primary-surface)' : 'var(--surface)',
    transition: 'all var(--duration-normal) var(--ease-bounce)',
    transform: active ? 'scale(1.1)' : 'scale(1)',
    boxShadow: active ? '0 8px 15px var(--primary-glow)' : 'none',
    overflow: 'hidden',
  }),
  categoryImg: (active) => ({
    width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover',
    transition: 'filter var(--duration-normal) ease',
    filter: active ? 'brightness(1.1) saturate(1.1)' : 'brightness(0.8) grayscale(0.2)',
  }),
  categoryLabel: (active) => ({
    fontSize: 'var(--text-sm)', fontWeight: active ? 800 : 500,
    color: active ? 'var(--primary)' : 'var(--text-secondary)',
    transition: 'color var(--duration-fast) ease', letterSpacing: '0.2px',
  }),

  filterRow: {
    display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)',
    animation: 'bounce-in 0.6s ease-out 0.2s backwards',
  },

  gridHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 'var(--space-md)',
  },
  gridTitle: {
    fontSize: 'var(--text-lg)', fontWeight: 800,
    display: 'flex', alignItems: 'center', gap: 'var(--space-xs)',
  },
  gridCount: {
    fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 500,
  },

  grid: {},

  card: (i) => ({
    borderRadius: 'var(--radius-xl)', overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    animation: `scaleIn 0.4s ease-out ${i * 0.05}s both`,
    border: '1px solid var(--glass-border)',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    transition: 'transform var(--duration-normal) var(--ease-bounce), box-shadow var(--duration-normal) ease',
    cursor: 'default',
  }),
  cardImgWrap: { height: 160, overflow: 'hidden', position: 'relative' },
  cardImg: {
    width: '100%', height: '100%', objectFit: 'cover',
    transition: 'transform var(--duration-slow) ease',
  },
  badge: (top, left, bg, color = 'white') => ({
    position: 'absolute', top, left, background: bg, color,
    padding: '3px 8px', borderRadius: 'var(--radius-sm)',
    fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase',
  }),
  deliveryBadge: {
    position: 'absolute', bottom: 10, right: 10,
    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
    borderRadius: 'var(--radius-sm)', padding: '4px 8px',
    color: 'var(--text-main)', fontSize: 'var(--text-xs)', fontWeight: 700,
  },
  cardBody: {
    padding: 'var(--space-sm)', flex: 1, display: 'flex', flexDirection: 'column',
  },
  cardName: {
    fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--text-main)',
    marginBottom: 2, lineHeight: 1.3,
  },
  cardCategory: {
    fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
    marginBottom: 'var(--space-sm)', flex: 1,
  },
  cardFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  cardPrice: {
    fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--text-main)',
  },
  addBtn: {
    background: 'var(--primary)', color: 'white', border: 'none',
    width: 36, height: 36, borderRadius: 'var(--radius-md)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', boxShadow: 'var(--shadow-button)',
    transition: 'transform var(--duration-fast) var(--ease-standard)',
  },

  footer: {
    marginTop: 'var(--space-3xl)', borderRadius: 32, overflow: 'hidden',
    background: 'var(--bg-card)', animation: 'fadeIn 1.2s ease-out',
  },
  footerHeroWrap: { position: 'relative', height: 240, width: '100%' },
  footerGradient: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to bottom, transparent, var(--bg-card))',
  },
  footerBrand: {
    position: 'absolute', bottom: 20, left: 0, right: 0,
    textAlign: 'center', zIndex: 2,
  },
  footerBrandName: {
    fontSize: 'var(--text-2xl)', fontWeight: 900, letterSpacing: -1, marginBottom: 4,
  },
  footerBrandSub: {
    fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500,
  },
  footerContent: { padding: 'var(--space-lg) var(--space-md) var(--space-2xl)' },
  contactCard: {
    padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)',
    display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
    border: '1px solid rgba(255,255,255,0.05)',
    marginBottom: 'var(--space-md)',
  },
  contactIcon: (bg) => ({
    background: bg, padding: 10, borderRadius: 'var(--radius-md)',
  }),
  contactLabel: {
    fontSize: 'var(--text-xs)', color: 'var(--text-dim)',
    fontWeight: 700, textTransform: 'uppercase', marginBottom: 2,
  },
  contactValue: { fontSize: 'var(--text-sm)', fontWeight: 600 },
  contactValueSm: { fontSize: 'var(--text-xs)', fontWeight: 600, lineHeight: 1.4 },
  footerBottom: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 'var(--space-md)', paddingTop: 'var(--space-md)',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  socialRow: { display: 'flex', gap: 'var(--space-md)' },
  socialIcon: { cursor: 'pointer', transition: 'color var(--duration-fast)' },
  copyright: {
    fontSize: 'var(--text-xs)', color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.6,
  },
};

const NO_IMG = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%231a1a1a' width='100' height='100'/><text fill='%23555' font-family='sans-serif' font-size='14' text-anchor='middle' x='50' y='55'>No Image</text></svg>";

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('All');
  const [foodTypeFilter, setFoodTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch {
        setError('Could not load menu. Please try again later.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const filteredProducts = products.filter((p) => {
    const matchCategory = category === 'All' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType =
      foodTypeFilter === 'all' ||
      (foodTypeFilter === 'veg' && p.isVeg !== false) ||
      (foodTypeFilter === 'nonveg' && p.isVeg === false);
    return matchCategory && matchSearch && matchType;
  });

  if (loading) return <LoadingContainer />;

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--space-lg)' }}>
        <ErrorDisplay>{error}</ErrorDisplay>
      </div>
    );
  }

  return (
    <div style={MENU_PAGE.wrapper}>
      {/* ─── Hero Banner ─── */}
      <div style={{ paddingTop: 'var(--space-lg)' }}>
        <div style={MENU_PAGE.hero}>
          <img
            src="/hero_food_banner.png"
            alt="Featured Food"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={MENU_PAGE.heroOverlay}>
            <h2 style={MENU_PAGE.heroTitle}>Order your favourite food here</h2>
            <p style={MENU_PAGE.heroSub}>
              Delicious meals from your campus canteen, prepared fresh and delivered hot.
            </p>
          </div>
        </div>

        {/* ─── Search Bar ─── */}
        <div className="glass-card-sm" style={MENU_PAGE.search}>
          <Search color="var(--text-secondary)" size={20} />
          <input
            type="text"
            placeholder="Search for food..."
            aria-label="Search for food"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={MENU_PAGE.searchInput}
          />
          <div style={MENU_PAGE.searchTrending}>
            <TrendingUp size={18} color="var(--primary)" />
          </div>
        </div>

        {/* ─── Categories ─── */}
        <div style={MENU_PAGE.categoriesWrap}>
          <div style={MENU_PAGE.categoriesScroll}>
            {CATEGORIES.map((cat) => {
              const active = category === cat.name;
              return (
                <div
                  key={cat.name}
                  className="category-item"
                  style={MENU_PAGE.categoryItem}
                  onClick={() => setCategory(cat.name)}
                >
                  <div style={MENU_PAGE.categoryCircle(active)}>
                    <img
                      src={cat.image}
                      alt={cat.name}
                      style={MENU_PAGE.categoryImg(active)}
                    />
                  </div>
                  <span style={MENU_PAGE.categoryLabel(active)}>{cat.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Veg / Non-Veg Filter ─── */}
        <div style={MENU_PAGE.filterRow}>
          <FilterPill active={foodTypeFilter === 'all'} onClick={() => setFoodTypeFilter('all')} style={{ flex: 1, padding: '14px 20px', borderRadius: 16, fontWeight: 700, fontSize: 'var(--text-base)' }}>
            🍽️ All Items
          </FilterPill>
          <FilterPill active={foodTypeFilter === 'veg'} onClick={() => setFoodTypeFilter('veg')} style={{ flex: 1, padding: '14px 20px', borderRadius: 16, fontWeight: 700, fontSize: 'var(--text-base)' }}>
            🟢 Veg Only
          </FilterPill>
          <FilterPill active={foodTypeFilter === 'nonveg'} onClick={() => setFoodTypeFilter('nonveg')} style={{ flex: 1, padding: '14px 20px', borderRadius: 16, fontWeight: 700, fontSize: 'var(--text-base)' }}>
            🔴 Non-Veg
          </FilterPill>
        </div>

        {/* ─── Grid Header ─── */}
        <div style={MENU_PAGE.gridHeader}>
          <h2 style={MENU_PAGE.gridTitle}>
            Menu <Filter size={18} color="var(--primary)" />
          </h2>
          <span style={MENU_PAGE.gridCount}>{filteredProducts.length} items</span>
        </div>

        {/* ─── Product Grid ─── */}
        {filteredProducts.length === 0 ? (
          <EmptyState icon={Search} title="No items found" description="Try a different search or filter." />
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product, idx) => (
              <div
                key={product.id}
                className="glass-card"
                role="article"
                aria-label={product.name}
                style={MENU_PAGE.card(idx)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-elevated)';
                  const img = e.currentTarget.querySelector('img[data-card-img]');
                  if (img) img.style.transform = 'scale(1.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                  const img = e.currentTarget.querySelector('img[data-card-img]');
                  if (img) img.style.transform = '';
                }}
              >
                {/* Image */}
                <div style={MENU_PAGE.cardImgWrap}>
                  <img
                    data-card-img
                    src={product.image}
                    alt={product.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = NO_IMG; }}
                    style={MENU_PAGE.cardImg}
                  />
                  <div style={{ position: 'absolute', top: 8, right: 8, boxShadow: 'var(--shadow-sm)' }}>
                    <VegBadge isVeg={product.isVeg !== false} />
                  </div>
                  {product.isBestSeller && (
                    <div style={MENU_PAGE.badge(10, 10, 'var(--warning)', '#000')}>Best Seller</div>
                  )}
                  {product.isSpicy && (
                    <div style={MENU_PAGE.badge(10, 10, 'var(--danger)')}>🌶️ Spicy</div>
                  )}
                  <div style={MENU_PAGE.deliveryBadge}>15 min</div>
                </div>

                {/* Content */}
                <div style={MENU_PAGE.cardBody}>
                  <h3 style={MENU_PAGE.cardName}>{product.name}</h3>
                  <p style={MENU_PAGE.cardCategory}>{product.category}</p>
                  <div style={MENU_PAGE.cardFooter}>
                    <span style={MENU_PAGE.cardPrice}>₹{product.price}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      aria-label={`Add ${product.name} to cart`}
                      style={MENU_PAGE.addBtn}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.12)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
                    >
                      <Plus size={20} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Footer ─── */}
        <footer style={MENU_PAGE.footer}>
          <div style={MENU_PAGE.footerHeroWrap}>
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=600&fit=crop"
              alt="Footer Hero"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={MENU_PAGE.footerGradient} />
            <div style={MENU_PAGE.footerBrand}>
              <h2 style={MENU_PAGE.footerBrandName}>
                Campus<span style={{ color: 'var(--primary)' }}>Bites</span>
              </h2>
              <p style={MENU_PAGE.footerBrandSub}>Deliciously Delivered.</p>
            </div>
          </div>

          <div style={MENU_PAGE.footerContent}>
            {/* Contact Cards */}
            <div className="glass-card-sm" style={MENU_PAGE.contactCard}>
              <div style={MENU_PAGE.contactIcon('var(--primary-surface)')}>
                <Mail size={20} color="var(--primary)" />
              </div>
              <div>
                <p style={MENU_PAGE.contactLabel}>Email Us</p>
                <p style={MENU_PAGE.contactValue}>{CONTACT.email}</p>
              </div>
            </div>

            <div className="glass-card-sm" style={MENU_PAGE.contactCard}>
              <div style={MENU_PAGE.contactIcon('var(--info-surface)')}>
                <Phone size={20} color="var(--info)" />
              </div>
              <div>
                <p style={MENU_PAGE.contactLabel}>Call Us</p>
                <p style={MENU_PAGE.contactValue}>{CONTACT.phone}</p>
              </div>
            </div>

            <div className="glass-card-sm" style={MENU_PAGE.contactCard}>
              <div style={MENU_PAGE.contactIcon('var(--success-surface)')}>
                <MapPin size={20} color="var(--success)" />
              </div>
              <div>
                <p style={MENU_PAGE.contactLabel}>Location</p>
                <p style={MENU_PAGE.contactValueSm}>{CONTACT.location}</p>
              </div>
            </div>

            {/* Socials + Copyright */}
            <div style={MENU_PAGE.footerBottom}>
              <div style={MENU_PAGE.socialRow}>
                <a href="#" aria-label="Instagram" style={MENU_PAGE.socialIcon}>
                  <Instagram size={22} color="var(--text-secondary)" />
                </a>
                <a href="#" aria-label="Twitter" style={MENU_PAGE.socialIcon}>
                  <Twitter size={22} color="var(--text-secondary)" />
                </a>
                <a href="#" aria-label="Star" style={MENU_PAGE.socialIcon}>
                  <Star size={22} color="var(--text-secondary)" />
                </a>
              </div>
              <p style={MENU_PAGE.copyright}>
                © 2026 Campus Bites. Created with ❤️ for students.<br />
                All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Menu;
