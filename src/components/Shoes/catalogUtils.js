export const buildImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return path.startsWith("/") ? path : `/${path}`;
};

export const getProductImages = (product, color = null) => {
  const images = Array.isArray(product?.images) ? product.images : [];
  const sorted = [...images]
    .filter((img) => img?.url)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  if (!color?.trim()) return sorted;

  const matched = sorted.filter(
    (img) => img.color && img.color.trim().toLowerCase() === color.trim().toLowerCase()
  );
  if (matched.length) return matched;

  const universal = sorted.filter((img) => !img.color?.trim());
  return universal.length ? universal : sorted;
};

export const getPrimaryProductImage = (product, color = null) => {
  const images = getProductImages(product, color);
  if (!images.length) return null;
  return images.find((img) => img.is_primary) || images[0];
};

export const getAuthToken = () => localStorage.getItem("token");

export const catalogGridSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    lg: "repeat(4, 1fr)",
  },
  gap: { xs: 2, sm: 2.5, md: 3 },
};
