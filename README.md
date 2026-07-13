# 🛒 AetherCart - Premium E-Commerce Product Listing & Detail Application

A high-performance, responsive, Amazon-style e-commerce application built as part of the Frontend Engineer Assessment. It dynamically fetches categories, brands, products, and details using the public [DummyJSON Products API](https://dummyjson.com/docs/products).

---

## 🚀 Setup Instructions

Follow these steps to run the project locally on your machine:

### 1. Prerequisites
Ensure you have Node.js installed (v18+ recommended).

### 2. Installation
Extract the repository folder, open your terminal in the project directory, and install dependencies:
```bash
npm install
```

### 3. Run Development Server
Start the local Vite developer server:
```bash
npm run dev
```
Open your browser and navigate to the local address displayed in the terminal (typically `http://localhost:5173` or `http://localhost:5174`).

### 4. Build for Production
To bundle and optimize the project for production, run:
```bash
npm run build
```
The compiled output will be generated inside the `dist/` directory.

---

## 🛠️ Architectural Decisions

1. **URL-driven State Management (Single Source of Truth)**
   Instead of storing filters (categories, brands, price range, search query) and pagination in local React state, they are synced directly with the browser URL's query parameters (e.g. `?categories=smartphones,laptops&brands=Apple&minPrice=100&maxPrice=1000&page=1`). This guarantees:
   - **Persistence**: Navigating from a product details view back to the listing page preserves all selected filters.
   - **Shareability**: A user can copy and paste the URL, and another user will see the exact same filtered product view.
   - **Browser History Integration**: Browser Back/Forward buttons function naturally as search parameter changes.

2. **Parallel Categorized Fetching & Merging**
   Since the DummyJSON API does not support requesting multiple categories in a single call, we query selected categories in parallel using `Promise.all` and merge/deduplicate them in client memory. When no categories are selected, it fetches the root product database (`limit=0`). This matches the checkbox-based category specification while utilizing the specified REST endpoints.

3. **Bespoke Styling System**
   The storefront utilizes vanilla CSS variables and responsive rules configured around a light-theme layout matching the visual screenshots. This avoids the bundle size and setup overhead of Tailwind CSS, while providing full control over transitions, responsive columns, and specific styling for checkboxes.

4. **Sidebar Filter Toggling (☰)**
   Clicking the hamburger menu button `☰` in the header toggles the visibility of the sidebar filters panel on desktop and mobile by updating the `?filters=hidden` URL query state. When filters are toggled closed, the product grid automatically stretches to span the full page width.

---

## 📌 Assumptions Made

1. **Card Layout Constraints**
   Based on the design mockup screenshots, product cards in the grid display the image, title, price, and rating (star rating + numeric score in parentheses) on a single row, hiding brand and detailed tag badges to maintain a clean layout. The full details are shown in the product details view.

2. **Price Filter Boundary Matching**
   Prices on storefront cards are displayed as rounded integers (e.g. `$60` instead of `$59.99`) to match the mockup designs. To prevent rounding-mismatch bugs (e.g. a card showing `$60` disappearing when filtering for a minimum price of `60`), the price filtering comparison is executed against the same rounded integer shown to the user (`Math.round(p.price)`) rather than the raw database float.

3. **Immediate Updates on Typing**
   Price range filters update the product listing immediately as the user types (e.g. typing `5` then `9` immediately refilters the listing), in compliance with the filter behavior rule: *"Changing a filter should update the product list immediately"*.

4. **Details Page Scope**
   Product details page contains standard e-commerce features (back navigation, centered image, image thumbnail select options, brand/category text values, and reviews list) and omits pagination elements, keeping the view clean.

---

## 🔮 Improvements If Given More Time

1. **Double-Handle Range Sliders**
   Replace the Min/Max text inputs with an interactive double-handle range slider to give visual representation of the catalog price spectrum.

2. **Client-side Caching**
   Implement React Query (TanStack Query) or a simple caching layer for fetched categories and products to avoid refetching data from the server when toggling between categories.

3. **Persistent Shopping Cart**
   Add a fully functional slide-out Shopping Cart panel connected to a LocalStorage-backed Redux or React Context state manager, letting users add/remove items and calculate checkout values.

4. **Comprehensive Test Suite**
   Integrate Vitest and React Testing Library to write unit tests for the filter merging algorithms and routing actions, and Playwright for visual regression testing.
