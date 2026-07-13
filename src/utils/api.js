const BASE_URL = 'https://dummyjson.com';

/**
 * Helper to handle fetch responses and handle HTTP errors
 */
async function fetchJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Fetch failed for URL: ${url}`, error);
    throw error;
  }
}

/**
 * Fetch all categories from DummyJSON.
 * Returns array of category objects: [{ slug, name, url }, ...]
 */
export async function getCategories() {
  return fetchJson(`${BASE_URL}/products/categories`);
}

/**
 * Fetch products.
 * If a category is specified, fetches products within that category.
 * If no category is specified, fetches all products.
 * We fetch all products (limit = 0) to perform client-side filtering, brand extraction, and pagination,
 * which is essential because DummyJSON does not support combined filters (category + brand + price + search).
 */
export async function getProducts(categorySlug = '') {
  if (categorySlug) {
    return fetchJson(`${BASE_URL}/products/category/${categorySlug}?limit=0`);
  }
  return fetchJson(`${BASE_URL}/products?limit=0`);
}

/**
 * Fetch details for a single product by ID.
 */
export async function getProductById(id) {
  return fetchJson(`${BASE_URL}/products/${id}`);
}
