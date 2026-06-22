import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogContent,
  Stack,
  alpha,
  Divider,
} from "@mui/material";
import {
  Close,
  EditOutlined,
  ShoppingBagOutlined,
  CheckCircleOutline,
  RemoveShoppingCartOutlined,
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
import { buildImageUrl, getProductImages } from "./catalogUtils";
import { colorNameToHex } from "./colorUtils";
import { primaryButtonSx } from "./catalogStyles";

const formatPrice = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? `KES ${num.toLocaleString()}` : "—";
};

const colorsMatch = (a, b) => a?.trim().toLowerCase() === b?.trim().toLowerCase();

const sortSizes = (sizes) =>
  [...sizes].sort((a, b) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB;
    return String(a).localeCompare(String(b));
  });

const getColorOptions = (product) => {
  const map = new Map();
  (product?.variants || []).forEach((variant) => {
    if (!variant.color || variant.is_active === false) return;
    const key = variant.color.trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        name: variant.color,
        hex: variant.color_hex || colorNameToHex(variant.color),
      });
    }
  });
  return Array.from(map.values());
};

const Gallery = ({ images, productName, activeIndex, onSelect }) => {
  if (!images.length) {
    return (
      <Box
        sx={{
          height: { xs: 280, md: "100%" },
          minHeight: 280,
          borderRadius: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha(cream, 0.7),
          border: `1px dashed ${alpha(sageGreenDark, 0.15)}`,
        }}
      >
        <ShoeIcon sx={{ fontSize: 64, color: sageGreen, opacity: 0.35 }} />
      </Box>
    );
  }

  const active = images[activeIndex] || images[0];

  return (
    <Stack spacing={1.5} sx={{ height: "100%" }}>
      <Box
        sx={{
          position: "relative",
          flex: 1,
          minHeight: { xs: 280, md: 340 },
          borderRadius: "20px",
          overflow: "hidden",
          bgcolor: alpha(cream, 0.5),
          border: `1px solid ${alpha(sageGreenDark, 0.08)}`,
        }}
      >
        <Box
          component="img"
          key={active.url}
          src={buildImageUrl(active.url)}
          alt={active.alt_text?.trim() || productName}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            animation: "fadeIn 0.35s ease",
            "@keyframes fadeIn": {
              from: { opacity: 0.4 },
              to: { opacity: 1 },
            },
          }}
        />
      </Box>

      {images.length > 1 && (
        <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 0.5 }}>
          {images.map((img, index) => (
            <Box
              key={`${img.url}-${index}`}
              onClick={() => onSelect(index)}
              sx={{
                width: 72,
                height: 72,
                flexShrink: 0,
                borderRadius: "14px",
                overflow: "hidden",
                cursor: "pointer",
                border:
                  index === activeIndex
                    ? `2px solid ${sageGreenDark}`
                    : `2px solid ${alpha(sageGreenDark, 0.12)}`,
                opacity: index === activeIndex ? 1 : 0.75,
                transition: "all 0.2s ease",
                "&:hover": { opacity: 1 },
              }}
            >
              <Box
                component="img"
                src={buildImageUrl(img.url)}
                alt={img.alt_text || ""}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default function ProductPreviewDialog({ open, product, onClose, onEdit }) {
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [imageIndex, setImageIndex] = useState(0);

  const colorOptions = useMemo(
    () => (product ? getColorOptions(product) : []),
    [product]
  );

  const variantsForColor = useMemo(() => {
    if (!product || !selectedColor) return [];
    return (product.variants || []).filter(
      (variant) =>
        variant.is_active !== false && colorsMatch(variant.color, selectedColor)
    );
  }, [product, selectedColor]);

  const sizesForColor = useMemo(
    () => sortSizes([...new Set(variantsForColor.map((variant) => variant.size))]),
    [variantsForColor]
  );

  const selectedVariant = useMemo(
    () => variantsForColor.find((variant) => variant.size === selectedSize) || null,
    [variantsForColor, selectedSize]
  );

  const displayImages = useMemo(
    () => (product ? getProductImages(product, selectedColor) : []),
    [product, selectedColor]
  );

  const displayPrice = selectedVariant?.price ?? product?.base_price;
  const categoryLabel = product?.category?.parent
    ? `${product.category.parent.name} › ${product.category.name}`
    : product?.category?.name;

  useEffect(() => {
    if (!open || !product) return;

    const colors = getColorOptions(product);
    const initialColor = colors[0]?.name || "";
    setSelectedColor(initialColor);

    const initialSizes = (product.variants || [])
      .filter(
        (variant) =>
          variant.is_active !== false &&
          (!initialColor || colorsMatch(variant.color, initialColor))
      )
      .map((variant) => variant.size);
    setSelectedSize(sortSizes([...new Set(initialSizes)])[0] || "");
    setImageIndex(0);
  }, [open, product]);

  useEffect(() => {
    setImageIndex(0);
    if (!sizesForColor.length) {
      setSelectedSize("");
      return;
    }
    if (!sizesForColor.includes(selectedSize)) {
      setSelectedSize(sizesForColor[0]);
    }
  }, [selectedColor, sizesForColor, selectedSize]);

  if (!product) return null;

  const stock = selectedVariant?.stock_quantity ?? 0;
  const inStock = stock > 0;
  const lowStock = inStock && stock <= 5;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: "24px",
          fontFamily: fontBody,
          overflow: "hidden",
          maxHeight: "92vh",
        },
      }}
    >
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${alpha(sageGreenDark, 0.08)}`,
          bgcolor: alpha(cream, 0.45),
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <VisibilityOutlined sx={{ color: sageGreenDark }} />
          <Box>
            <Typography sx={{ fontWeight: 800, color: textOnLight, lineHeight: 1.2 }}>
              Customer preview
            </Typography>
            <Typography sx={{ fontSize: "0.8rem", color: textMuted }}>
              Pick a color and size — gallery and stock update like the storefront
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: textMuted }}>
          <Close />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" },
            gap: { xs: 2.5, md: 3.5 },
            alignItems: "start",
          }}
        >
          <Gallery
            images={displayImages}
            productName={product.name}
            activeIndex={imageIndex}
            onSelect={setImageIndex}
          />

          <Stack spacing={2.25}>
            <Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.75, mb: 1 }}>
                {product.brand?.name && (
                  <Chip
                    label={product.brand.name}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      bgcolor: alpha(sageGreen, 0.12),
                      color: sageGreenDark,
                    }}
                  />
                )}
                {categoryLabel && (
                  <Chip
                    label={categoryLabel}
                    size="small"
                    sx={{ fontWeight: 600, bgcolor: alpha(sageGreenDark, 0.08), color: textMuted }}
                  />
                )}
                {product.is_featured && (
                  <Chip label="Featured" size="small" color="success" variant="outlined" />
                )}
              </Stack>

              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.45rem", sm: "1.75rem" },
                  color: textOnLight,
                  lineHeight: 1.2,
                }}
              >
                {product.name}
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  fontWeight: 800,
                  fontSize: "1.35rem",
                  color: sageGreenDark,
                }}
              >
                {formatPrice(displayPrice)}
              </Typography>
            </Box>

            {colorOptions.length > 0 && (
              <Box>
                <Typography sx={{ fontWeight: 700, color: textOnLight, mb: 1 }}>
                  Color: <span style={{ color: sageGreenDark }}>{selectedColor || "—"}</span>
                </Typography>
                <Stack direction="row" spacing={1.25} flexWrap="wrap" sx={{ gap: 1 }}>
                  {colorOptions.map((color) => {
                    const selected = colorsMatch(color.name, selectedColor);
                    return (
                      <Box
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        title={color.name}
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          cursor: "pointer",
                          bgcolor: color.hex || alpha(sageGreenDark, 0.15),
                          border: selected
                            ? `3px solid ${sageGreenDark}`
                            : `2px solid ${alpha(sageGreenDark, 0.2)}`,
                          boxShadow: selected
                            ? `0 0 0 3px ${alpha(sageGreen, 0.25)}`
                            : "none",
                          transition: "all 0.2s ease",
                          "&:hover": { transform: "scale(1.06)" },
                        }}
                      />
                    );
                  })}
                </Stack>
              </Box>
            )}

            {sizesForColor.length > 0 && (
              <Box>
                <Typography sx={{ fontWeight: 700, color: textOnLight, mb: 1 }}>
                  Size: <span style={{ color: sageGreenDark }}>{selectedSize || "—"}</span>
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                  {sizesForColor.map((size) => {
                    const variant = variantsForColor.find((item) => item.size === size);
                    const variantStock = variant?.stock_quantity ?? 0;
                    const outOfStock = variantStock <= 0;
                    const selected = size === selectedSize;

                    return (
                      <Button
                        key={size}
                        variant={selected ? "contained" : "outlined"}
                        disabled={outOfStock}
                        onClick={() => setSelectedSize(size)}
                        sx={{
                          minWidth: 52,
                          borderRadius: "12px",
                          textTransform: "none",
                          fontWeight: 700,
                          fontFamily: fontBody,
                          bgcolor: selected ? sageGreenDark : "transparent",
                          borderColor: outOfStock
                            ? alpha(textMuted, 0.25)
                            : alpha(sageGreenDark, 0.25),
                          color: selected ? "#fff" : outOfStock ? textMuted : sageGreenDark,
                          "&:hover": {
                            bgcolor: selected ? sageGreenDeeper : alpha(sageGreen, 0.08),
                            borderColor: sageGreenDark,
                          },
                        }}
                      >
                        {size}
                      </Button>
                    );
                  })}
                </Stack>
              </Box>
            )}

            <Box
              sx={{
                p: 1.5,
                borderRadius: "16px",
                bgcolor: inStock ? alpha(sageGreen, 0.1) : alpha("#a63d3d", 0.08),
                border: `1px solid ${inStock ? alpha(sageGreen, 0.2) : alpha("#a63d3d", 0.2)}`,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                {inStock ? (
                  <CheckCircleOutline sx={{ color: sageGreenDark, fontSize: 20 }} />
                ) : (
                  <RemoveShoppingCartOutlined sx={{ color: "#a63d3d", fontSize: 20 }} />
                )}
                <Typography sx={{ fontWeight: 700, color: inStock ? sageGreenDark : "#a63d3d" }}>
                  {inStock
                    ? lowStock
                      ? `Only ${stock} left in stock`
                      : `${stock} in stock`
                    : "Out of stock for this size"}
                </Typography>
              </Stack>
              {selectedVariant?.sku && (
                <Typography sx={{ mt: 0.75, fontSize: "0.8rem", color: textMuted }}>
                  SKU: {selectedVariant.sku}
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              size="large"
              disabled={!inStock || !selectedVariant}
              startIcon={<ShoppingBagOutlined />}
              sx={{
                ...primaryButtonSx,
                py: 1.5,
                bgcolor: sageGreenDark,
                "&:hover": { bgcolor: sageGreenDeeper },
                "&.Mui-disabled": { bgcolor: alpha(sageGreenDark, 0.35), color: "#fff" },
              }}
            >
              {inStock ? "Add to bag (preview)" : "Unavailable"}
            </Button>

            <Divider sx={{ borderColor: alpha(sageGreenDark, 0.08) }} />

            <Stack spacing={1}>
              {product.material && (
                <Typography sx={{ fontSize: "0.9rem", color: textOnLight }}>
                  <strong>Material:</strong> {product.material}
                </Typography>
              )}
              {product.closure_type && (
                <Typography sx={{ fontSize: "0.9rem", color: textOnLight }}>
                  <strong>Closure:</strong> {product.closure_type}
                </Typography>
              )}
              {product.description?.trim() && (
                <Typography
                  sx={{ fontSize: "0.9rem", color: textMuted, lineHeight: 1.6, whiteSpace: "pre-wrap" }}
                >
                  {product.description}
                </Typography>
              )}
            </Stack>

            {displayImages.length > 0 && (
              <Typography sx={{ fontSize: "0.78rem", color: textMuted }}>
                Showing {displayImages.length} image{displayImages.length === 1 ? "" : "s"} for{" "}
                {selectedColor || "this product"}
                {displayImages.some((img) => !img.color) ? " (includes shared shots)" : ""}
              </Typography>
            )}
          </Stack>
        </Box>
      </DialogContent>

      <Box
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${alpha(sageGreenDark, 0.08)}`,
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
          bgcolor: alpha(cream, 0.35),
        }}
      >
        <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 700, color: textMuted }}>
          Close
        </Button>
        <Button
          variant="outlined"
          startIcon={<EditOutlined />}
          onClick={() => {
            onClose();
            onEdit(product);
          }}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "12px",
            borderColor: alpha(sageGreenDark, 0.3),
            color: sageGreenDark,
          }}
        >
          Edit product
        </Button>
      </Box>
    </Dialog>
  );
}
