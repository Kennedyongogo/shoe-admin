import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  InputAdornment,
  Stack,
  alpha,
  Tooltip,
  MenuItem,
} from "@mui/material";
import {
  Add,
  Search,
  EditOutlined,
  DeleteOutline,
  PhotoCameraOutlined,
  Close,
  Inventory2Outlined,
  Star,
  VisibilityOutlined,
} from "@mui/icons-material";
import ShoeIcon from "../icons/ShoeIcon";
import {
  sageGreen,
  sageGreenDark,
  sageGreenDeeper,
  cream,
  textOnLight,
  textMuted,
  fontBody,
} from "../../constants/brandColors";
import {
  buildImageUrl,
  getAuthToken,
  catalogGridSx,
  getProductImages,
} from "./catalogUtils";
import { colorNameToHex, previewSku } from "./colorUtils";
import { fieldSx, primaryButtonSx, cardShellSx } from "./catalogStyles";
import ProductPreviewDialog from "./ProductPreviewDialog";

const productsGridSx = {
  ...catalogGridSx,
  gridTemplateColumns: {
    xs: "1fr",
    sm: "repeat(2, 1fr)",
    lg: "repeat(3, 1fr)",
    xl: "repeat(4, 1fr)",
  },
};

const emptyForm = () => ({
  name: "",
  description: "",
  brand_id: "",
  category_id: "",
  base_price: "",
  material: "",
  closure_type: "",
  is_featured: false,
  is_active: true,
  colors: [],
  variants: [{ size: "", color: "", stock_quantity: 0, price: "" }],
  existingImages: [],
  newImages: [],
});

const deriveColorsFromProduct = (product) => {
  const map = new Map();
  (product.variants || []).forEach((variant) => {
    if (!variant.color) return;
    const key = variant.color.trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        name: variant.color,
        hex: variant.color_hex || colorNameToHex(variant.color),
      });
    }
  });
  (product.images || []).forEach((image) => {
    if (!image.color) return;
    const key = image.color.trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, { name: image.color, hex: colorNameToHex(image.color) });
    }
  });
  return Array.from(map.values());
};

const getColorOptions = (form) => {
  const names = new Set();
  form.colors.forEach((color) => color.name?.trim() && names.add(color.name.trim()));
  form.variants.forEach((variant) => variant.color?.trim() && names.add(variant.color.trim()));
  form.existingImages.forEach((image) => image.color?.trim() && names.add(image.color.trim()));
  form.newImages.forEach((image) => image.color?.trim() && names.add(image.color.trim()));
  return Array.from(names);
};

const formatPrice = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? `KES ${num.toLocaleString()}` : "—";
};

const DetailRow = ({ label, value }) => {
  if (!value?.toString().trim()) return null;
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
      <Typography
        sx={{
          fontSize: "0.78rem",
          fontWeight: 700,
          color: textMuted,
          minWidth: 72,
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: "0.82rem", color: textOnLight, lineHeight: 1.45, flex: 1 }}>
        {value}
      </Typography>
    </Stack>
  );
};

const ProductImageCarousel = ({ images, productName }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1 || paused) return undefined;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [images.length, paused]);

  if (!images.length) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(145deg, ${alpha(sageGreen, 0.12)} 0%, ${alpha(cream, 0.95)} 100%)`,
          color: sageGreenDark,
        }}
      >
        <ShoeIcon sx={{ fontSize: 48, opacity: 0.45 }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{ position: "relative", width: "100%", height: "100%" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((img, i) => (
        <Box
          key={`${img.url}-${i}`}
          component="img"
          src={buildImageUrl(img.url)}
          alt={img.alt_text?.trim() || productName}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: i === index ? 1 : 0,
            transition: "opacity 0.7s ease-in-out",
            pointerEvents: "none",
          }}
        />
      ))}

      {images.length > 1 && (
        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: alpha("#000", 0.35),
            borderRadius: "999px",
            px: 1.25,
            py: 0.75,
          }}
        >
          {images.map((_, i) => (
            <Box
              key={i}
              onClick={() => setIndex(i)}
              sx={{
                width: i === index ? 18 : 7,
                height: 7,
                borderRadius: "999px",
                bgcolor: i === index ? "#fff" : alpha("#fff", 0.45),
                cursor: "pointer",
                transition: "all 0.25s ease",
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

const ProductCard = ({ product, onView, onEdit, onDelete }) => {
  const images = useMemo(() => getProductImages(product), [product]);
  const categoryLabel = product.category?.parent
    ? `${product.category.parent.name} › ${product.category.name}`
    : product.category?.name;

  return (
    <Box
      sx={{
        ...cardShellSx,
        cursor: "pointer",
      }}
      onClick={() => onView(product)}
    >
      <Box
        sx={{
          position: "relative",
          height: { xs: 180, sm: 200 },
          width: "100%",
          overflow: "hidden",
          bgcolor: alpha(cream, 0.6),
          borderBottom: `1px solid ${alpha(sageGreenDark, 0.06)}`,
        }}
      >
        <ProductImageCarousel images={images} productName={product.name} />
        {product.is_featured && (
          <Chip
            icon={<Star sx={{ fontSize: "14px !important" }} />}
            label="Featured"
            size="small"
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              height: 24,
              fontWeight: 700,
              fontSize: "0.68rem",
              bgcolor: alpha("#fff", 0.92),
              color: sageGreenDark,
              zIndex: 1,
            }}
          />
        )}
      </Box>

      <Box sx={{ p: 2.25, flex: 1, display: "flex", flexDirection: "column", gap: 1.25 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Typography
            sx={{ fontWeight: 800, fontSize: "1.05rem", color: textOnLight, lineHeight: 1.25 }}
          >
            {product.name}
          </Typography>
          <Chip
            label={product.is_active ? "Active" : "Inactive"}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.68rem",
              fontWeight: 700,
              flexShrink: 0,
              bgcolor: product.is_active ? alpha(sageGreen, 0.15) : alpha("#a63d3d", 0.1),
              color: product.is_active ? sageGreenDark : "#a63d3d",
            }}
          />
        </Stack>

        <Typography sx={{ fontWeight: 800, color: sageGreenDark, fontSize: "1rem" }}>
          {formatPrice(product.base_price)}
        </Typography>

        <Stack spacing={0.75}>
          <DetailRow label="Brand" value={product.brand?.name} />
          <DetailRow label="Category" value={categoryLabel} />
          <DetailRow label="Material" value={product.material} />
          <DetailRow label="Closure" value={product.closure_type} />
        </Stack>

        {product.description?.trim() && (
          <Box
            sx={{
              mt: 0.25,
              p: 1.25,
              borderRadius: "12px",
              bgcolor: alpha(cream, 0.55),
              border: `1px solid ${alpha(sageGreenDark, 0.06)}`,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                mb: 0.5,
              }}
            >
              Description
            </Typography>
            <Typography sx={{ fontSize: "0.84rem", color: textOnLight, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
              {product.description}
            </Typography>
          </Box>
        )}

        <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
          {images.length > 0 && (
            <Chip
              label={`${images.length} image${images.length === 1 ? "" : "s"}`}
              size="small"
              sx={{
                height: 24,
                fontSize: "0.68rem",
                fontWeight: 600,
                bgcolor: alpha(sageGreenDark, 0.08),
                color: textMuted,
              }}
            />
          )}
          {product.variants?.length > 0 && (
            <Chip
              label={`${product.variants.length} variant${product.variants.length === 1 ? "" : "s"}`}
              size="small"
              sx={{
                height: 24,
                fontSize: "0.68rem",
                fontWeight: 600,
                bgcolor: alpha(sageGreenDark, 0.08),
                color: textMuted,
              }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: "auto", pt: 1 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<VisibilityOutlined sx={{ fontSize: 18 }} />}
            onClick={(e) => {
              e.stopPropagation();
              onView(product);
            }}
            fullWidth
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
              fontFamily: fontBody,
              bgcolor: sageGreenDark,
              "&:hover": { bgcolor: sageGreenDeeper },
            }}
          >
            View
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditOutlined sx={{ fontSize: 18 }} />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
              fontFamily: fontBody,
              borderColor: alpha(sageGreenDark, 0.25),
              color: sageGreenDark,
              minWidth: 48,
              px: 1.5,
              "&:hover": { borderColor: sageGreenDark, bgcolor: alpha(sageGreen, 0.08) },
            }}
          >
            Edit
          </Button>
          <Tooltip title="Delete product">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product);
              }}
              sx={{
                borderRadius: "12px",
                border: `1px solid ${alpha("#a63d3d", 0.25)}`,
                color: "#a63d3d",
                "&:hover": { bgcolor: alpha("#a63d3d", 0.08) },
              }}
            >
              <DeleteOutline />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );
};

export default function ProductsManager({ onMessage }) {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const fileInputRef = useRef(null);

  const fetchLookups = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${getAuthToken()}` };
      const [brandsRes, categoriesRes] = await Promise.all([
        fetch("/api/brands", { headers }),
        fetch("/api/categories/children", { headers }),
      ]);
      const brandsData = await brandsRes.json();
      const categoriesData = await categoriesRes.json();
      if (brandsData.success) setBrands(brandsData.data || []);
      if (categoriesData.success) setCategories(categoriesData.data || []);
    } catch {
      onMessage("Failed to load brands or categories", "error");
    }
  }, [onMessage]);

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "50", sortBy: "createdAt", sortOrder: "DESC" });
      if (search.trim()) params.set("search", search.trim());

      const response = await fetch(`/api/products?${params}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.data || []);
      } else {
        onMessage(data.message || "Failed to load products", "error");
      }
    } catch {
      onMessage("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  }, [search, onMessage]);

  useEffect(() => {
    fetchLookups();
  }, [fetchLookups]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetchProducts();
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchProducts, search]);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      brand_id: product.brand_id || "",
      category_id: product.category_id || "",
      base_price: product.base_price ?? "",
      material: product.material || "",
      closure_type: product.closure_type || "",
      is_featured: Boolean(product.is_featured),
      is_active: product.is_active !== false,
      existingImages: (product.images || []).map((img, index) => ({
        url: img.url,
        alt_text: img.alt_text || "",
        color: img.color || "",
        sort_order: img.sort_order ?? index,
        is_primary: Boolean(img.is_primary),
      })),
      colors: deriveColorsFromProduct(product),
      variants:
        product.variants?.length > 0
          ? product.variants.map((variant) => ({
              id: variant.id,
              size: variant.size,
              color: variant.color,
              stock_quantity: variant.stock_quantity ?? 0,
              price: variant.price ?? "",
            }))
          : [{ size: "", color: "", stock_quantity: 0, price: "" }],
      newImages: [],
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    form.newImages.forEach((img) => {
      if (img.preview?.startsWith("blob:")) URL.revokeObjectURL(img.preview);
    });
    setDialogOpen(false);
    setEditingProduct(null);
    setForm(emptyForm());
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const invalid = files.find((file) => !file.type.startsWith("image/"));
    if (invalid) {
      onMessage("Please choose image files only", "error");
      return;
    }

    setForm((prev) => ({
      ...prev,
      newImages: [
        ...prev.newImages,
        ...files.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
          alt_text: prev.name.trim() || "",
          color: "",
        })),
      ],
    }));
    e.target.value = "";
  };

  const removeExistingImage = (index) => {
    setForm((prev) => {
      const next = prev.existingImages.filter((_, i) => i !== index);
      if (next.length && !next.some((img) => img.is_primary)) {
        next[0] = { ...next[0], is_primary: true };
      }
      return { ...prev, existingImages: next };
    });
  };

  const removeNewImage = (index) => {
    setForm((prev) => {
      const target = prev.newImages[index];
      if (target?.preview?.startsWith("blob:")) URL.revokeObjectURL(target.preview);
      return { ...prev, newImages: prev.newImages.filter((_, i) => i !== index) };
    });
  };

  const updateExistingAlt = (index, alt_text) => {
    setForm((prev) => ({
      ...prev,
      existingImages: prev.existingImages.map((img, i) =>
        i === index ? { ...img, alt_text } : img
      ),
    }));
  };

  const updateNewAlt = (index, alt_text) => {
    setForm((prev) => ({
      ...prev,
      newImages: prev.newImages.map((img, i) => (i === index ? { ...img, alt_text } : img)),
    }));
  };

  const updateExistingColor = (index, color) => {
    setForm((prev) => ({
      ...prev,
      existingImages: prev.existingImages.map((img, i) =>
        i === index ? { ...img, color } : img
      ),
    }));
  };

  const updateNewColor = (index, color) => {
    setForm((prev) => ({
      ...prev,
      newImages: prev.newImages.map((img, i) => (i === index ? { ...img, color } : img)),
    }));
  };

  const addColorOption = () => {
    setForm((prev) => ({
      ...prev,
      colors: [...prev.colors, { name: "", hex: "" }],
    }));
  };

  const updateColorOption = (index, name) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.map((color, i) =>
        i === index ? { name, hex: colorNameToHex(name) } : color
      ),
    }));
  };

  const removeColorOption = (index) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const addVariantRow = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { size: "", color: "", stock_quantity: 0, price: "" }],
    }));
  };

  const updateVariantRow = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const commitVariantColor = (index) => {
    setForm((prev) => {
      const color = prev.variants[index]?.color?.trim();
      if (!color) return prev;

      const exists = prev.colors.some(
        (entry) => entry.name.trim().toLowerCase() === color.toLowerCase()
      );
      if (exists) return prev;

      return {
        ...prev,
        colors: [...prev.colors, { name: color, hex: colorNameToHex(color) }],
      };
    });
  };

  const removeVariantRow = (index) => {
    setForm((prev) => ({
      ...prev,
      variants:
        prev.variants.length === 1
          ? [{ size: "", color: "", stock_quantity: 0, price: "" }]
          : prev.variants.filter((_, i) => i !== index),
    }));
  };

  const setPrimaryExisting = (index) => {
    setForm((prev) => ({
      ...prev,
      existingImages: prev.existingImages.map((img, i) => ({
        ...img,
        is_primary: i === index,
      })),
      newImages: prev.newImages.map((img) => ({ ...img, is_primary: false })),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      onMessage("Product name is required", "error");
      return;
    }
    if (!form.base_price) {
      onMessage("Base price is required", "error");
      return;
    }
    if (!form.brand_id) {
      onMessage("Brand is required", "error");
      return;
    }
    if (!form.category_id) {
      onMessage("Category is required", "error");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("brand_id", form.brand_id);
      formData.append("category_id", form.category_id);
      formData.append("base_price", form.base_price);
      formData.append("material", form.material.trim());
      formData.append("closure_type", form.closure_type.trim());
      formData.append("is_featured", String(form.is_featured));
      formData.append("is_active", String(form.is_active));
      formData.append("existing_images", JSON.stringify(form.existingImages));
      formData.append(
        "images_meta",
        JSON.stringify(
          form.newImages.map((img) => ({
            alt_text: img.alt_text.trim(),
            color: img.color || "",
          }))
        )
      );
      formData.append(
        "variants",
        JSON.stringify(
          form.variants
            .filter((variant) => variant.size && variant.color)
            .map((variant) => ({
              id: variant.id,
              size: variant.size,
              color: variant.color,
              stock_quantity: Number(variant.stock_quantity) || 0,
              price: variant.price === "" ? null : variant.price,
            }))
        )
      );
      form.newImages.forEach((img) => formData.append("product_images", img.file));

      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const response = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        onMessage(data.message || (editingProduct ? "Product updated" : "Product created"));
        closeDialog();
        fetchProducts();
      } else {
        onMessage(data.message || "Failed to save product", "error");
      }
    } catch {
      onMessage("Failed to save product", "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await response.json();

      if (data.success) {
        onMessage(data.message || "Product deleted");
        setDeleteDialogOpen(false);
        setProductToDelete(null);
        fetchProducts();
      } else {
        onMessage(data.message || "Failed to delete product", "error");
      }
    } catch {
      onMessage("Failed to delete product", "error");
    } finally {
      setDeleting(false);
    }
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.parent ? `${cat.parent.name} › ${cat.name}` : cat.name,
  }));

  const selectedBrand = brands.find((brand) => brand.id === form.brand_id);
  const colorOptions = getColorOptions(form);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Typography sx={{ color: textMuted, fontSize: "0.9rem" }}>
          Shoes in your catalog — linked to a brand and subcategory (parent category sets audience).
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreate}
          disabled={!brands.length || !categories.length}
          sx={{
            ...primaryButtonSx,
            bgcolor: sageGreenDark,
            boxShadow: `0 6px 20px ${alpha(sageGreenDeeper, 0.25)}`,
            "&:hover": { bgcolor: sageGreenDeeper },
          }}
        >
          Add product
        </Button>
      </Stack>

      <TextField
        fullWidth
        placeholder="Search products…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ ...fieldSx, mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ color: sageGreen, fontSize: 22 }} />
            </InputAdornment>
          ),
        }}
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress sx={{ color: sageGreenDark }} />
        </Box>
      ) : products.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            px: 3,
            borderRadius: "20px",
            bgcolor: alpha(cream, 0.5),
            border: `1px dashed ${alpha(sageGreenDark, 0.2)}`,
          }}
        >
          <Inventory2Outlined sx={{ fontSize: 48, color: sageGreen, mb: 1.5 }} />
          <Typography sx={{ fontWeight: 700, color: textOnLight, mb: 0.5 }}>
            {search ? "No products match your search" : "No products yet"}
          </Typography>
          <Typography sx={{ color: textMuted, fontSize: "0.9rem", mb: 2 }}>
            {search
              ? "Try a different search term."
              : !brands.length || !categories.length
                ? "Add brands and categories first, then create products."
                : "Add your first shoe product to get started."}
          </Typography>
          {!search && brands.length > 0 && categories.length > 0 && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openCreate}
              sx={{ ...primaryButtonSx, bgcolor: sageGreenDark }}
            >
              Add product
            </Button>
          )}
        </Box>
      ) : (
        <Box sx={productsGridSx}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onView={setViewProduct}
              onEdit={openEdit}
              onDelete={(p) => {
                setProductToDelete(p);
                setDeleteDialogOpen(true);
              }}
            />
          ))}
        </Box>
      )}

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: "20px", fontFamily: fontBody } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: textOnLight, pr: 6 }}>
          {editingProduct ? "Edit product" : "New product"}
          <IconButton
            onClick={closeDialog}
            sx={{ position: "absolute", right: 12, top: 12, color: textMuted }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: alpha(sageGreenDark, 0.08) }}>
          <Stack spacing={2.5}>
            <TextField
              label="Product name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
              sx={fieldSx}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label="Brand"
                value={form.brand_id}
                onChange={(e) => setForm((prev) => ({ ...prev, brand_id: e.target.value }))}
                fullWidth
                required
                sx={fieldSx}
              >
                {brands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Category"
                value={form.category_id}
                onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
                fullWidth
                required
                sx={fieldSx}
              >
                {categoryOptions.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Base price"
                type="number"
                value={form.base_price}
                onChange={(e) => setForm((prev) => ({ ...prev, base_price: e.target.value }))}
                fullWidth
                required
                sx={fieldSx}
              />
              <TextField
                label="Material"
                value={form.material}
                onChange={(e) => setForm((prev) => ({ ...prev, material: e.target.value }))}
                fullWidth
                sx={fieldSx}
              />
              <TextField
                label="Closure type"
                value={form.closure_type}
                onChange={(e) => setForm((prev) => ({ ...prev, closure_type: e.target.value }))}
                fullWidth
                placeholder="lace, slip-on, velcro"
                sx={fieldSx}
              />
            </Stack>
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
              sx={fieldSx}
            />

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: textOnLight }}>Colors (optional)</Typography>
                  <Typography sx={{ color: textMuted, fontSize: "0.82rem" }}>
                    Pre-define colors here, or type them in variants below — hex is filled when you finish typing.
                  </Typography>
                </Box>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={addColorOption}
                  sx={{ textTransform: "none", fontWeight: 700, color: sageGreenDark }}
                >
                  Add color
                </Button>
              </Stack>
              <Stack spacing={1.25}>
                {form.colors.length === 0 && (
                  <Typography sx={{ color: textMuted, fontSize: "0.85rem" }}>
                    Colors are picked up from variants when you finish typing in the color field.
                  </Typography>
                )}
                {form.colors.map((color, index) => (
                  <Stack
                    key={`color-${index}`}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.25}
                    alignItems={{ sm: "center" }}
                    sx={{
                      p: 1.25,
                      borderRadius: "14px",
                      border: `1px solid ${alpha(sageGreenDark, 0.1)}`,
                      bgcolor: alpha(cream, 0.45),
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "10px",
                        bgcolor: color.hex || alpha(sageGreenDark, 0.12),
                        border: `1px solid ${alpha(sageGreenDark, 0.15)}`,
                        flexShrink: 0,
                      }}
                    />
                    <TextField
                      label="Color name"
                      value={color.name}
                      onChange={(e) => updateColorOption(index, e.target.value)}
                      fullWidth
                      size="small"
                      sx={fieldSx}
                    />
                    <TextField
                      label="Hex"
                      value={color.hex || ""}
                      size="small"
                      disabled
                      sx={{ ...fieldSx, minWidth: { sm: 120 } }}
                    />
                    <IconButton onClick={() => removeColorOption(index)} color="error">
                      <DeleteOutline />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: textOnLight }}>Variants (size & stock)</Typography>
                  <Typography sx={{ color: textMuted, fontSize: "0.82rem" }}>
                    SKU is generated automatically when you save.
                  </Typography>
                </Box>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={addVariantRow}
                  sx={{ textTransform: "none", fontWeight: 700, color: sageGreenDark }}
                >
                  Add variant
                </Button>
              </Stack>
              <Stack spacing={1.25}>
                {form.variants.map((variant, index) => (
                  <Stack
                    key={variant.id || `variant-${index}`}
                    spacing={1.25}
                    sx={{
                      p: 1.5,
                      borderRadius: "14px",
                      border: `1px solid ${alpha(sageGreenDark, 0.1)}`,
                      bgcolor: alpha(cream, 0.35),
                    }}
                  >
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                      <TextField
                        label="Size"
                        value={variant.size}
                        onChange={(e) => updateVariantRow(index, "size", e.target.value)}
                        size="small"
                        sx={fieldSx}
                      />
                      <TextField
                        label="Color"
                        value={variant.color}
                        onChange={(e) => updateVariantRow(index, "color", e.target.value)}
                        onBlur={() => commitVariantColor(index)}
                        size="small"
                        placeholder="White, Black, Navy…"
                        sx={fieldSx}
                      />
                      <TextField
                        label="Stock"
                        type="number"
                        value={variant.stock_quantity}
                        onChange={(e) =>
                          updateVariantRow(index, "stock_quantity", e.target.value)
                        }
                        size="small"
                        sx={fieldSx}
                      />
                      <TextField
                        label="Price override"
                        type="number"
                        value={variant.price}
                        onChange={(e) => updateVariantRow(index, "price", e.target.value)}
                        size="small"
                        placeholder="Optional"
                        sx={fieldSx}
                      />
                      <IconButton onClick={() => removeVariantRow(index)} color="error">
                        <DeleteOutline />
                      </IconButton>
                    </Stack>
                    {variant.size && variant.color && (
                      <Typography sx={{ fontSize: "0.78rem", color: textMuted }}>
                        SKU preview:{" "}
                        {previewSku({
                          brandName: selectedBrand?.name,
                          productName: form.name,
                          color: variant.color,
                          size: variant.size,
                        })}
                      </Typography>
                    )}
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography sx={{ fontWeight: 700, color: textOnLight }}>Product images</Typography>
                <Button
                  size="small"
                  startIcon={<PhotoCameraOutlined />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ textTransform: "none", fontWeight: 700, color: sageGreenDark }}
                >
                  Add images
                </Button>
              </Stack>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleImageSelect}
              />
              <Typography sx={{ color: textMuted, fontSize: "0.82rem", mb: 2 }}>
                Assign each image to a color so the storefront gallery switches when a customer picks
                that color. Leave as &quot;All colors&quot; for shared lifestyle shots.
              </Typography>

              <Stack spacing={1.5}>
                {form.existingImages.map((img, index) => (
                  <Stack
                    key={`existing-${img.url}-${index}`}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ sm: "center" }}
                    sx={{
                      p: 1.5,
                      borderRadius: "14px",
                      border: `1px solid ${alpha(sageGreenDark, 0.1)}`,
                      bgcolor: alpha(cream, 0.45),
                    }}
                  >
                    <Box
                      component="img"
                      src={buildImageUrl(img.url)}
                      alt={img.alt_text || form.name || "Product image"}
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: "12px",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                    <TextField
                      label="Alt text"
                      value={img.alt_text}
                      onChange={(e) => updateExistingAlt(index, e.target.value)}
                      fullWidth
                      size="small"
                      sx={fieldSx}
                    />
                    <TextField
                      select
                      label="Color"
                      value={img.color || ""}
                      onChange={(e) => updateExistingColor(index, e.target.value)}
                      size="small"
                      sx={{ ...fieldSx, minWidth: { sm: 150 } }}
                    >
                      <MenuItem value="">All colors</MenuItem>
                      {colorOptions.map((color) => (
                        <MenuItem key={color} value={color}>
                          {color}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant={img.is_primary ? "contained" : "outlined"}
                        onClick={() => setPrimaryExisting(index)}
                        sx={{ textTransform: "none", fontWeight: 700, whiteSpace: "nowrap" }}
                      >
                        {img.is_primary ? "Primary" : "Set primary"}
                      </Button>
                      <IconButton onClick={() => removeExistingImage(index)} color="error">
                        <DeleteOutline />
                      </IconButton>
                    </Stack>
                  </Stack>
                ))}

                {form.newImages.map((img, index) => (
                  <Stack
                    key={`new-${img.preview}`}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ sm: "center" }}
                    sx={{
                      p: 1.5,
                      borderRadius: "14px",
                      border: `1px dashed ${alpha(sageGreen, 0.35)}`,
                      bgcolor: alpha(sageGreen, 0.04),
                    }}
                  >
                    <Box
                      component="img"
                      src={img.preview}
                      alt={img.alt_text || "New product image"}
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: "12px",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                    <TextField
                      label="Alt text"
                      value={img.alt_text}
                      onChange={(e) => updateNewAlt(index, e.target.value)}
                      fullWidth
                      size="small"
                      sx={fieldSx}
                    />
                    <TextField
                      select
                      label="Color"
                      value={img.color || ""}
                      onChange={(e) => updateNewColor(index, e.target.value)}
                      size="small"
                      sx={{ ...fieldSx, minWidth: { sm: 150 } }}
                    >
                      <MenuItem value="">All colors</MenuItem>
                      {colorOptions.map((color) => (
                        <MenuItem key={color} value={color}>
                          {color}
                        </MenuItem>
                      ))}
                    </TextField>
                    <IconButton onClick={() => removeNewImage(index)} color="error">
                      <DeleteOutline />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_featured}
                    onChange={(e) => setForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
                    color="success"
                  />
                }
                label="Featured product"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_active}
                    onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                    color="success"
                  />
                }
                label="Active"
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeDialog} sx={{ textTransform: "none", fontWeight: 700, color: textMuted }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ ...primaryButtonSx, bgcolor: sageGreenDark, minWidth: 120 }}
          >
            {saving ? <CircularProgress size={22} color="inherit" /> : editingProduct ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: "20px", fontFamily: fontBody } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Delete product?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: textMuted }}>
            This will permanently remove <strong>{productToDelete?.name}</strong> and its variants.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDelete}
            disabled={deleting}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: "12px" }}
          >
            {deleting ? <CircularProgress size={22} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <ProductPreviewDialog
        open={Boolean(viewProduct)}
        product={viewProduct}
        onClose={() => setViewProduct(null)}
        onEdit={openEdit}
      />
    </Box>
  );
}
