import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../utils/api';
import ProductCard from './ProductCard';
import FilterSidebar from './FilterSidebar';
import { ChevronLeft, ChevronRight, SlidersHorizontal, Search, PackageOpen, AlertTriangle } from 'lucide-react';

const ITEMS_PER_PAGE = 8; // Fits 4 columns or 2 columns layout perfectly

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Products and categories loaded from DummyJSON
  const [rawProducts, setRawProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Responsive resize event listener for synchronizing mobile/desktop viewports
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 968);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 968);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  


  // Extract URL parameters
  const categoriesParam = searchParams.get('categories') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const brandsParam = searchParams.get('brands') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'featured';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const selectedCategories = useMemo(() => {
    return categoriesParam ? categoriesParam.split(',') : [];
  }, [categoriesParam]);

  const selectedBrands = useMemo(() => {
    return brandsParam ? brandsParam.split(',') : [];
  }, [brandsParam]);

  // Load categories list on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const catData = await getCategories();
        setCategories(catData);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch products based on selected categories
  // If multiple categories are checked, fetch them in parallel and merge
  useEffect(() => {
    async function fetchActiveProducts() {
      setLoading(true);
      setError(null);
      try {
        if (selectedCategories.length === 0) {
          // If no categories are checked, load all products (up to limit=0)
          const data = await getProducts();
          setRawProducts(data.products || []);
        } else {
          // Fetch categories in parallel
          const fetchPromises = selectedCategories.map((catSlug) => getProducts(catSlug));
          const results = await Promise.all(fetchPromises);
          
          // Merge products and deduplicate by ID
          const allMerged = results.flatMap((res) => res.products || []);
          const uniqueMap = new Map();
          allMerged.forEach((prod) => uniqueMap.set(prod.id, prod));
          
          setRawProducts(Array.from(uniqueMap.values()));
        }
      } catch (err) {
        setError('Failed to retrieve products. Please check your network connection.');
      } finally {
        setLoading(false);
      }
    }
    fetchActiveProducts();
  }, [categoriesParam]); // Dependency on categories param string

  // Extract unique brands dynamically from active loaded products
  const uniqueBrands = useMemo(() => {
    const brandsSet = new Set(
      rawProducts
        .map((p) => p.brand)
        .filter(Boolean)
    );
    return [...brandsSet].sort();
  }, [rawProducts]);

  // Merge/update URL search parameters
  const updateParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { ...current, ...newParams };

    // Delete empty params to keep URL neat
    Object.keys(merged).forEach((key) => {
      if (
        merged[key] === '' ||
        merged[key] === null ||
        merged[key] === undefined ||
        (Array.isArray(merged[key]) && merged[key].length === 0)
      ) {
        delete merged[key];
      }
    });

    // Reset page to 1 unless page itself is explicitly changed
    if (!('page' in newParams)) {
      delete merged.page;
    }

    setSearchParams(merged);
  };

  // Checkbox category toggle handler
  const handleCategoryChange = (slug) => {
    let nextCategories;
    if (selectedCategories.includes(slug)) {
      nextCategories = selectedCategories.filter((c) => c !== slug);
    } else {
      nextCategories = [...selectedCategories, slug];
    }
    
    // Clear brand selections when categories change, as brands will be different
    updateParams({
      categories: nextCategories.join(','),
      brands: ''
    });
  };

  // Checkbox brand toggle handler
  const handleBrandChange = (brandName) => {
    let nextBrands;
    if (selectedBrands.includes(brandName)) {
      nextBrands = selectedBrands.filter((b) => b !== brandName);
    } else {
      nextBrands = [...selectedBrands, brandName];
    }
    updateParams({ brands: nextBrands.join(',') });
  };

  // Immediate Price change handler
  const handlePriceChange = (type, value) => {
    updateParams({
      [type === 'min' ? 'minPrice' : 'maxPrice']: value
    });
  };

  const handleSortChange = (e) => {
    updateParams({ sort: e.target.value });
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Client-side filtering & sorting on loaded dataset
  const filteredProducts = useMemo(() => {
    return rawProducts
      .filter((p) => {
        // Text Search
        if (search) {
          const term = search.toLowerCase();
          const titleMatch = p.title.toLowerCase().includes(term);
          const descMatch = p.description.toLowerCase().includes(term);
          const brandMatch = (p.brand || '').toLowerCase().includes(term);
          if (!titleMatch && !descMatch && !brandMatch) return false;
        }

        // Price Filter (matched against the rounded integer displayed on UI)
        const displayPrice = Math.round(p.price);
        if (minPrice && displayPrice < parseFloat(minPrice)) return false;
        if (maxPrice && displayPrice > parseFloat(maxPrice)) return false;

        // Brand Filter
        if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sort === 'price-asc') return a.price - b.price;
        if (sort === 'price-desc') return b.price - a.price;
        if (sort === 'rating-desc') return b.rating - a.rating;
        return a.id - b.id; // default featured
      });
  }, [rawProducts, search, minPrice, maxPrice, selectedBrands, sort]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const activePage = page > totalPages ? 1 : page; // Clamp page index

  const paginatedProducts = useMemo(() => {
    const start = (activePage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, activePage]);

  // Skeleton Loader grid
  const renderSkeletons = () => (
    <div className="product-grid">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div key={idx} className="skeleton-card">
          <div className="skeleton-image shimmer" />
          <div className="skeleton-text skeleton-title shimmer" />
          <div className="skeleton-text shimmer" style={{ width: '50%' }} />
          <div className="skeleton-text skeleton-price shimmer" />
        </div>
      ))}
    </div>
  );

  const handleCloseMobileDrawer = () => {
    const current = Object.fromEntries(searchParams.entries());
    delete current.filters;
    setSearchParams(current);
  };

  const isMobileDrawerOpen = searchParams.get('filters') === 'show';
  const showFilters = searchParams.get('filters') !== 'hidden';

  // Responsive state checking for filters open/closed status
  const isFiltersOpen = isMobile ? isMobileDrawerOpen : showFilters;

  return (
    <div className={`listing-layout ${!showFilters ? 'filters-hidden' : ''}`}>
      {/* Checkbox-based Sidebar Filter Panel */}
      {showFilters && (
        <FilterSidebar
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange}
          brands={uniqueBrands}
          selectedBrands={selectedBrands}
          onBrandChange={handleBrandChange}
          priceRange={{ min: minPrice, max: maxPrice }}
          onPriceChange={handlePriceChange}
          onClearFilters={handleClearFilters}
          isOpen={isMobileDrawerOpen}
          onClose={handleCloseMobileDrawer}
        />
      )}

      {/* Main Listing Side */}
      <div>
        {/* Sorting and Results summary header */}
        <div className="grid-header">
          {isMobile ? (
            // On mobile viewports, show clickable toggle button only when drawer is closed
            !isFiltersOpen && (
              <button
                className="grid-filter-toggle-btn"
                onClick={() => updateParams({ filters: 'show' })}
                aria-label="Show Filters"
              >
                <Search size={16} />
                Show Filters
              </button>
            )
          ) : (
            // On desktop viewports, show static title label only when sidebar is open
            isFiltersOpen && (
              <div className="grid-filter-toggle-btn">
                <Search size={16} />
                Filters
              </div>
            )
          )}
        </div>

        {/* Dynamic content sections */}
        {loading ? (
          renderSkeletons()
        ) : error ? (
          <div className="state-container">
            <AlertTriangle size={48} style={{ color: 'var(--accent-rose)' }} />
            <h3 className="state-title">Network Error</h3>
            <p className="state-desc">{error}</p>
            <button className="state-action-btn" onClick={() => updateParams({ categories: categoriesParam })}>
              Retry Connection
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="state-container">
            <PackageOpen size={48} style={{ color: 'var(--text-muted)' }} />
            <h3 className="state-title">No Products Match</h3>
            <p className="state-desc">
              Your selected filters returned no matching results. Please check your criteria or reset filters.
            </p>
            <button className="state-action-btn" onClick={handleClearFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* 4-column Product Grid (Amazon layout) */}
            <div className="product-grid">
              {paginatedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>

            {/* Pagination numbers at bottom */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(activePage - 1)}
                  disabled={activePage === 1}
                  aria-label="Previous Page"
                >
                  ← Previous
                </button>
                
                {(() => {
                  let start = Math.max(1, activePage - 2);
                  let end = Math.min(totalPages, start + 4);
                  
                  if (end - start < 4) {
                    start = Math.max(1, end - 4);
                  }
                  
                  const pages = [];
                  for (let pNum = start; pNum <= end; pNum++) {
                    pages.push(
                      <button
                        key={pNum}
                        className={`pagination-page-btn ${activePage === pNum ? 'active' : ''}`}
                        onClick={() => handlePageChange(pNum)}
                      >
                        {pNum}
                      </button>
                    );
                  }
                  return pages;
                })()}

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(activePage + 1)}
                  disabled={activePage === totalPages}
                  aria-label="Next Page"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
