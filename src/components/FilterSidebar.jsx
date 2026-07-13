import React, { useState } from 'react';
import { Search, RotateCcw, X } from 'lucide-react';

export default function FilterSidebar({
  categories,
  selectedCategories,
  onCategoryChange,
  brands,
  selectedBrands,
  onBrandChange,
  priceRange,
  onPriceChange,
  onClearFilters,
  isOpen,
  onClose
}) {
  // Search input for categories/brands search at the top of the sidebar
  const [sidebarSearch, setSidebarSearch] = useState('');

  // Filter categories and brands list based on search input
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  const filteredBrands = brands.filter((brand) =>
    (brand || 'Generic').toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  const isAnyFilterActive =
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    priceRange.min !== '' ||
    priceRange.max !== '';

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="filter-sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`filter-sidebar ${isOpen ? 'mobile-open' : ''}`}>
        {/* Mobile Drawer Header (visible on mobile viewports only) */}
        <div className="sidebar-drawer-header">
          <h3 className="sidebar-drawer-title">Filters</h3>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close filters">
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Search Bar */}
        <div className="sidebar-search-wrapper">
          <Search size={16} className="sidebar-search-icon" />
          <input
            type="text"
            placeholder="Search filters..."
            className="sidebar-search-input"
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
          />
        </div>

        {/* Categories Checkboxes Section */}
        <div className="filter-section">
          <h4 className="filter-section-title">Categories</h4>
          <div className="checkbox-list">
            {filteredCategories.length === 0 ? (
              <span className="no-items-text">No categories found</span>
            ) : (
              filteredCategories.map((cat) => {
                const isChecked = selectedCategories.includes(cat.slug);
                return (
                  <label key={cat.slug} className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      className="custom-checkbox-input"
                      checked={isChecked}
                      onChange={() => onCategoryChange(cat.slug)}
                    />
                    <span className="checkbox-text">{cat.name}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* Price Range Section (Updates Immediately) */}
        <div className="filter-section">
          <h4 className="filter-section-title">Price Range</h4>
          <div className="price-inputs">
            <input
              type="number"
              placeholder="Min"
              className="price-num-input"
              value={priceRange.min}
              onChange={(e) => onPriceChange('min', e.target.value)}
              min="0"
            />
            <span className="price-dash">—</span>
            <input
              type="number"
              placeholder="Max"
              className="price-num-input"
              value={priceRange.max}
              onChange={(e) => onPriceChange('max', e.target.value)}
              min="0"
            />
          </div>
        </div>

        {/* Brands Checkboxes Section */}
        <div className="filter-section">
          <h4 className="filter-section-title">Brands</h4>
          <div className="checkbox-list">
            {filteredBrands.length === 0 ? (
              <span className="no-items-text">No brands found</span>
            ) : (
              filteredBrands.map((brandName) => {
                const displayName = brandName || 'Generic';
                const isChecked = selectedBrands.includes(brandName);
                return (
                  <label key={brandName} className="custom-checkbox-label">
                    <input
                      type="checkbox"
                      className="custom-checkbox-input"
                      checked={isChecked}
                      onChange={() => onBrandChange(brandName)}
                    />
                    <span className="checkbox-text">{displayName}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* Clear Filters Action Button */}
        {isAnyFilterActive && (
          <button className="clear-filters-btn" onClick={onClearFilters}>
            <RotateCcw size={14} />
            Reset All Filters
          </button>
        )}
      </aside>
    </>
  );
}
