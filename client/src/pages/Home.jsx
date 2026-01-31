import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService.js';
import { getOffers } from '../utils/offerStorage.js';
import ShopHeader from '../components/ShopHeader.jsx';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated();
  const [offers, setOffers] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    setOffers(getOffers());
  }, []);

  const offerSlides = useMemo(() => {
    if (!offers.length) return [];
    const chunkSize = 3;
    const slides = [];
    for (let i = 0; i < offers.length; i += chunkSize) {
      slides.push(offers.slice(i, i + chunkSize));
    }
    return slides;
  }, [offers]);

  useEffect(() => {
    setCarouselIndex(0);
  }, [offerSlides.length]);

  const offerImages = useMemo(
    () => [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1502740479091-635887520276?auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=60'
    ],
    []
  );

  const getOfferImage = (globalIndex) => offerImages[globalIndex % offerImages.length];

  const handlePrevSlide = () => {
    if (offerSlides.length <= 1) return;
    setCarouselIndex((prev) => (prev === 0 ? offerSlides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    if (offerSlides.length <= 1) return;
    setCarouselIndex((prev) => (prev === offerSlides.length - 1 ? 0 : prev + 1));
  };

  const categories = useMemo(
    () => [
      { label: 'Fresh Vegetables', note: 'Farm picked', icon: '🥦' },
      { label: 'Dairy & Eggs', note: 'Daily harvest', icon: '🥛' },
      { label: 'Beverages', note: 'Juices & tea', icon: '🧃' },
      { label: 'Rice & Grains', note: 'Bulk packs', icon: '🌾' },
      { label: 'Grocery & Staples', note: 'Kitchen ready', icon: '🛍️' },
      { label: 'Snacks & Mixes', note: 'Ready to fry', icon: '🍿' },
      { label: 'Spices & Masala', note: 'Signature blends', icon: '🌶️' },
      { label: 'Cleaning Supplies', note: 'Shop hygiene', icon: '🧼' }
    ],
    []
  );

  const highlights = useMemo(
    () => [
      { title: '24H Door Delivery', desc: 'Fast trucks cover all of TN districts with refrigerated logistics.', badge: 'NEW' },
      { title: '900+ Store Partners', desc: 'Trusted by supermarkets, hotels and Kirana stores since 1995.', badge: 'TRUSTED' },
      { title: 'Bulk & Retail Packs', desc: 'From 1kg pouches to 50kg bags – order what your shelf needs.', badge: 'SMART' }
    ],
    []
  );

  const footerLinks = useMemo(
    () => [
      { label: 'Home', path: '/' },
      { label: 'Products', path: '/products' },
      { label: 'Login', path: '/login' },
      { label: 'Retail Signup', path: '/register' },
      { label: 'Support', path: '/contact' }
    ],
    []
  );

  const footerContacts = useMemo(
    () => [
      { label: 'Customer Care', value: '+91 97909 48214' },
      { label: 'Email', value: 'aadhavan@gmail.com' },
      { label: 'HQ', value: 'No. 35,Thalagiriyar Street, Thiruvannamalai, TamilNadu  – 606601' }
    ],
    []
  );

  const products = useMemo(
    () => [
      { name: 'Premium Idli Rice', unit: '25 kg bag', price: '₹ 1,480', tag: 'Hot' },
      { name: 'Organic Toor Dal', unit: '30 kg sack', price: '₹ 4,990', tag: 'New' },
      { name: 'Sunflower Oil', unit: '15 L tin', price: '₹ 1,990', tag: 'Save 12%' },
      { name: 'Cold Pressed Groundnut Oil', unit: '15 L tin', price: '₹ 2,180', tag: 'Bestseller' },
      { name: 'Madras Sambar Powder', unit: '10 kg pack', price: '₹ 2,260', tag: 'Chef Pick' },
      { name: 'Roasted Vermicelli', unit: '20 x 1kg', price: '₹ 1,150', tag: 'Combo' }
    ],
    []
  );

  const handlePrimaryCta = () => {
    navigate(isLoggedIn ? '/dashboard' : '/login');
  };

  return (
    <div className="home-page">
      <ShopHeader />

      <main className="home-main">
        <section className="hero">
          <div className="container hero-grid card">
            <div className="hero-copy">
              <div className="pill">Free home delivery in 24 hours</div>
              <h1>
                Fresh wholesale grocery,
                <span> now just a click away.</span>
              </h1>
              <p>
                Aadhavan Agencies delivers seasonal vegetables, staples, beverages and all the shelf
                essentials your store relies on. Place orders online and get guided replenishment for every shelf.
              </p>

              <div className="hero-actions">
                <button className="btn btn-primary" onClick={handlePrimaryCta}>
                  {isLoggedIn ? 'Go to dashboard' : 'Start ordering'}
                </button>
                <button className="btn ghost" onClick={() => navigate('/products')}>
                  Browse catalog
                </button>
              </div>

              <div className="hero-facts">
                <div>
                  <strong>950+</strong>
                  <span>Retailers onboard</span>
                </div>
                <div>
                  <strong>1200</strong>
                  <span>SKUs stocked daily</span>
                </div>
                <div>
                  <strong>18</strong>
                  <span>Districts served</span>
                </div>
              </div>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <div className="hero-fruit">
                <div className="fruit fruit-1" />
                <div className="fruit fruit-2" />
                <div className="fruit fruit-3" />
              </div>
              <div className="hero-search card">
                <div className="hero-search-title">Search entire store</div>
                <div className="hero-search-field">
                  <input type="text" placeholder="Ex: buy 25kg sona rice" onFocus={() => navigate('/products')} />
                  <button className="btn btn-primary" onClick={() => navigate('/products')}>
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="category-section">
          <div className="container section-head">
            <div>
              <div className="kicker">Categories</div>
              <h2 className="section-heading">Shop by aisles</h2>
            </div>
            <button className="btn" onClick={() => navigate('/products')}>
              View products
            </button>
          </div>
          <div className="container category-grid">
            {categories.map((cat) => (
              <button key={cat.label} className="category-card card" onClick={() => navigate('/products')}>
                <div className="category-icon">{cat.icon}</div>
                <div className="category-name">{cat.label}</div>
                <div className="category-note">{cat.note}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="highlight-section">
          <div className="container highlight-grid">
            {highlights.map((item) => (
              <div key={item.title} className="highlight-card card">
                <div className="tag hot">{item.badge}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <button className="link" onClick={() => navigate('/products')}>
                  Learn more →
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="offers-section">
          <div className="container offers-head">
            <div>
              <div className="kicker">Published offers</div>
              <h2 className="section-heading">Latest promotions from admin</h2>
              <p className="offers-copy">Redeem campaign pricing directly from your dashboard once you log in.</p>
            </div>
            <div className="offers-controls">
              <button className="circle-btn" aria-label="Previous offers" onClick={handlePrevSlide} disabled={offerSlides.length <= 1}>
                ←
              </button>
              <button className="circle-btn" aria-label="Next offers" onClick={handleNextSlide} disabled={offerSlides.length <= 1}>
                →
              </button>
            </div>
          </div>

          {offerSlides.length ? (
            <div className="container offers-carousel">
              {(offerSlides[carouselIndex] || []).map((offer, idx) => {
                const globalIndex = carouselIndex * 3 + idx;
                return (
                  <article key={offer.id} className="offer-card card">
                    <div
                      className="offer-media"
                      style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.35)), url(${getOfferImage(globalIndex)})` }}
                      aria-hidden="true"
                    />
                    <div className="offer-body">
                      <div className="tag hot">{offer.discount}% OFF</div>
                      <h3>{offer.title}</h3>
                      <p>{offer.description}</p>
                      <div className="offer-meta">Valid till {new Date(offer.validTill).toLocaleDateString()}</div>
                      <div className="offer-actions">
                        <button className="btn btn-primary" onClick={() => navigate(isLoggedIn ? '/products' : '/login')}>
                          {isLoggedIn ? 'Apply to order' : 'Login to redeem'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="container no-offers card">
              <p>No offers published yet. Check back soon.</p>
            </div>
          )}

          {offerSlides.length > 1 && (
            <div className="container carousel-status">
              Slide {carouselIndex + 1} of {offerSlides.length}
            </div>
          )}
        </section>

        {isLoggedIn ? (
          <section className="products-block">
            <div className="container">
              <div className="block-head">
                <div>
                  <div className="kicker">Fresh Online Store</div>
                  <h2 className="section-heading">This week’s fast-movers</h2>
                </div>
                <div className="block-tabs">
                  <button className="tab active" onClick={() => navigate('/products')}>
                    All
                  </button>
                  <button className="tab" onClick={() => navigate('/products?tag=summer')}>
                    Summer
                  </button>
                  <button className="tab" onClick={() => navigate('/products?tag=dry-fruits')}>
                    Dry Fruits
                  </button>
                  <button className="tab" onClick={() => navigate('/products?tag=liquid')}>
                    Liquid
                  </button>
                </div>
              </div>

              <div className="product-grid">
                {products.map((p) => (
                  <div className="product-card card" key={p.name}>
                    <div className="product-art" aria-hidden="true" />
                    <div className="product-body">
                      <div className="product-name">{p.name}</div>
                      <div className="product-unit">{p.unit}</div>
                      <div className="product-foot">
                        <div>
                          <div className="product-price">{p.price}</div>
                          <div className="product-tag">{p.tag}</div>
                        </div>
                        <button className="btn btn-primary" onClick={() => navigate('/products')}>
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="products-block locked">
            <div className="container locked-card card">
              <div>
                <div className="kicker">Products are gated</div>
                <h2 className="section-heading">Login to see live pricing</h2>
                <p className="locked-copy">Sign in to your dashboard to browse inventory, apply offers, and place orders.</p>
              </div>
              <div className="locked-actions">
                <button className="btn btn-primary" onClick={() => navigate('/login')}>
                  Login now
                </button>
                <button className="btn ghost" onClick={() => navigate('/register')}>
                  Create account
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="cta-section">
          <div className="container cta-card card">
            <div>
              <div className="pill">Ready when you are</div>
              <h2>Log in to manage stock, pricing & deliveries.</h2>
              <p>Admin dashboard helps you edit price lists, update stock and track deliveries in real time.</p>
            </div>
            <div className="cta-actions">
              <button className="btn btn-primary" onClick={handlePrimaryCta}>
                {isLoggedIn ? 'Open dashboard' : 'Admin login'}
              </button>
              <button className="btn ghost" onClick={() => navigate('/products')}>
                Explore catalog
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">AA</div>
            <div>
              <p className="footer-name">Aadhavan Agencies</p>
              <p className="footer-tagline">Wholesale supply partner for modern retailers.</p>
            </div>
          </div>

          <div className="footer-links">
            <p className="footer-heading">Explore</p>
            {footerLinks.map((link) => (
              <button key={link.label} className="footer-link" onClick={() => navigate(link.path)}>
                {link.label}
              </button>
            ))}
          </div>

          <div className="footer-contact">
            <p className="footer-heading">Get in touch</p>
            <ul>
              {footerContacts.map((item) => (
                <li key={item.label}>
                  <strong>{item.label}:</strong> <span>{item.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-hours">
            <p className="footer-heading">Office hours</p>
            <p>Mon - Sat: 6:00 AM - 8:00 PM</p>
            <p>Closed on public holidays.</p>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
              Partner Login
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container footer-bottom-inner">
            <span>© {new Date().getFullYear()} Aadhavan Agencies. All rights reserved.</span>
            <span>GST: 33AABCU9603R1Z5 • CIN: U15400TZ2010PTC033500</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
