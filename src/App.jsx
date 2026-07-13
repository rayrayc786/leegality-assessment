import React from 'react';
import { BrowserRouter, Routes, Route, Link, useSearchParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import ProductListingPage from './components/ProductListingPage';
import ProductDetailPage from './components/ProductDetailPage';
import { Search, X, Menu, ShoppingCart, RotateCcw, User } from 'lucide-react';
import './App.css';

/**
 * Smart Search Input linked directly to the URL query parameters
 */
function SearchBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const value = searchParams.get('search') || '';

  const handleChange = (e) => {
    const val = e.target.value;

    const isOnListing = location.pathname === '/' || location.pathname === '/products';

    if (isOnListing) {
      const current = Object.fromEntries(searchParams.entries());
      if (val) {
        current.search = val;
      } else {
        delete current.search;
      }
      // Reset page number on search text change
      delete current.page;
      setSearchParams(current);
    } else {
      // Redirect to listing page with search query active
      navigate(val ? `/?search=${encodeURIComponent(val)}` : '/');
    }
  };

  const handleClear = () => {
    const isOnListing = location.pathname === '/' || location.pathname === '/products';
    if (isOnListing) {
      const current = Object.fromEntries(searchParams.entries());
      delete current.search;
      delete current.page;
      setSearchParams(current);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="search-container">
      <Search className="search-icon" />
      <input
        type="text"
        placeholder="Search products..."
        className="search-input"
        value={value}
        onChange={handleChange}
        id="search-input"
      />
      {value && (
        <button className="clear-search-btn" onClick={handleClear} aria-label="Clear Search">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/**
 * Main Layout Container for the entire application
 */
function MainLayout({ children }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const handleToggleSidebar = () => {
    const isOnListing = location.pathname === '/' || location.pathname === '/products';
    if (!isOnListing) return;

    const isMobile = window.innerWidth <= 968;
    const current = Object.fromEntries(searchParams.entries());

    if (isMobile) {
      if (current.filters === 'show') {
        delete current.filters;
      } else {
        current.filters = 'show';
      }
    } else {
      if (current.filters === 'hidden') {
        delete current.filters;
      } else {
        current.filters = 'hidden';
      }
    }
    setSearchParams(current);
  };

  const isOnListing = location.pathname === '/' || location.pathname === '/products';

  return (
    <div className="app-container">
      <header className="header-nav">
        {/* Hamburger Toggle Button (far left) */}
        <button
          className={`hamburger-btn ${!isOnListing ? 'disabled' : ''}`}
          onClick={handleToggleSidebar}
          aria-label="Toggle filter sidebar"
        >
          <Menu size={22} />
        </button>

        {/* Global Search Input */}
        <SearchBar />

        {/* Header Right Icons */}
        <div className="header-right-icons">
          <button className="header-icon-btn" aria-label="Shopping Cart">
            <ShoppingCart size={20} />
          </button>
          <button className="header-icon-btn" aria-label="Recent Views">
            <RotateCcw size={20} />
          </button>
          <button className="header-icon-btn" aria-label="User Profile">
            <User size={20} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<ProductListingPage />} />
          <Route path="/products" element={<ProductListingPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          {/* Fallback routing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
