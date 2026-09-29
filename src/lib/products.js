import products from "@/data/products.json";

export function getAllProducts() {
  return products;
}

export function getProductBySlug(slug) {
  return products.find((p) => p.slug === slug) || null;
}

export function getProductsByCategory(category) {
  if (!category || category === "all") return products;
  return products.filter((p) => p.category === category);
}

export function getRelatedProducts(product, limit = 4) {
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}

export function searchProducts(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
  );
}

export function filterAndSortProducts(list, { colors, sizes, minPrice, maxPrice, sort } = {}) {
  let result = [...list];

  if (colors?.length) {
    result = result.filter((p) => p.colors.some((c) => colors.includes(c.name)));
  }
  if (sizes?.length) {
    result = result.filter((p) => p.sizes.some((s) => sizes.includes(s)));
  }
  if (typeof minPrice === "number") {
    result = result.filter((p) => p.price >= minPrice);
  }
  if (typeof maxPrice === "number") {
    result = result.filter((p) => p.price <= maxPrice);
  }

  switch (sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      result.sort((a, b) => (b.badge === "New" ? 1 : 0) - (a.badge === "New" ? 1 : 0));
      break;
    default:
      break;
  }
  return result;
}

export function formatINR(n) {
  return "₹" + n.toLocaleString("en-IN");
}
