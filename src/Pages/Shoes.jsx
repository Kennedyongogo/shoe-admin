import { useCallback, useEffect, useRef, useState } from "react";
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
  Snackbar,
  Alert,
  Stack,
  alpha,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Search,
  EditOutlined,
  DeleteOutline,
  PhotoCameraOutlined,
  Close,
} from "@mui/icons-material";
import ShoeIcon from "../components/icons/ShoeIcon";
import {
  sageGreen,
  sageGreenDark,
  sageGreenDeeper,
  cream,
  textOnLight,
  textMuted,
  fontBody,
  fontDisplay,
} from "../constants/brandColors";

const buildImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return path.startsWith("/") ? path : `/${path}`;
};

const emptyForm = () => ({
  name: "",
  description: "",
  is_active: true,
  logoFile: null,
  logoPreview: "",
});

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    bgcolor: alpha(cream, 0.6),
    fontFamily: fontBody,
    "& fieldset": { borderColor: alpha(sageGreenDark, 0.18) },
    "&:hover fieldset": { borderColor: alpha(sageGreen, 0.45) },
    "&.Mui-focused fieldset": { borderColor: sageGreenDark, borderWidth: 2 },
  },
  "& .MuiInputLabel-root": {
    fontFamily: fontBody,
    color: textMuted,
    "&.Mui-focused": { color: sageGreenDark },
  },
};

const BrandCard = ({ brand, onEdit, onDelete }) => {
  const logoUrl = buildImageUrl(brand.logo_url);
  const description = brand.description?.trim() || "";

  return (
    <Box
      sx={{
        borderRadius: "20px",
        overflow: "hidden",
        bgcolor: "#fff",
        border: `1px solid ${alpha(sageGreenDark, 0.1)}`,
        boxShadow: `0 8px 28px ${alpha(sageGreenDeeper, 0.07)}`,
        transition: "all 0.25s ease",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 16px 40px ${alpha(sageGreenDeeper, 0.12)}`,
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          height: { xs: 150, sm: 160 },
          width: "100%",
          overflow: "hidden",
          bgcolor: alpha(cream, 0.6),
          borderBottom: `1px solid ${alpha(sageGreenDark, 0.06)}`,
        }}
      >
        {logoUrl ? (
          <Box
            component="img"
            src={logoUrl}
            alt={brand.name}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
          />
        ) : (
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
        )}
      </Box>

      <Box sx={{ p: 2.25, flex: 1, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Typography
            sx={{ fontWeight: 800, fontSize: "1.05rem", color: textOnLight, lineHeight: 1.25 }}
            noWrap
          >
            {brand.name}
          </Typography>
          <Chip
            label={brand.is_active ? "Active" : "Inactive"}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.68rem",
              fontWeight: 700,
              flexShrink: 0,
              bgcolor: brand.is_active ? alpha(sageGreen, 0.15) : alpha("#a63d3d", 0.1),
              color: brand.is_active ? sageGreenDark : "#a63d3d",
            }}
          />
        </Stack>

        {description && (
          <Typography
            sx={{
              mt: 1,
              fontSize: "0.85rem",
              color: textMuted,
              lineHeight: 1.5,
              flex: 1,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </Typography>
        )}

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditOutlined sx={{ fontSize: 18 }} />}
            onClick={() => onEdit(brand)}
            fullWidth
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
              fontFamily: fontBody,
              borderColor: alpha(sageGreenDark, 0.25),
              color: sageGreenDark,
              "&:hover": { borderColor: sageGreenDark, bgcolor: alpha(sageGreen, 0.08) },
            }}
          >
            Edit
          </Button>
          <Tooltip title="Delete brand">
            <IconButton
              onClick={() => onDelete(brand)}
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

export default function Shoes() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const fileInputRef = useRef(null);

  const token = () => localStorage.getItem("token");

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchBrands = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());

      const response = await fetch(`/api/brands?${params}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await response.json();

      if (data.success) {
        setBrands(data.data || []);
      } else {
        showMessage(data.message || "Failed to load brands", "error");
      }
    } catch {
      showMessage("Failed to load brands", "error");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetchBrands();
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchBrands, search]);

  const openCreate = () => {
    setEditingBrand(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (brand) => {
    setEditingBrand(brand);
    setForm({
      name: brand.name || "",
      description: brand.description || "",
      is_active: brand.is_active !== false,
      logoFile: null,
      logoPreview: buildImageUrl(brand.logo_url),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (form.logoFile && form.logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(form.logoPreview);
    }
    setDialogOpen(false);
    setEditingBrand(null);
    setForm(emptyForm());
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showMessage("Please choose an image file", "error");
      return;
    }
    if (form.logoFile && form.logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(form.logoPreview);
    }
    setForm((prev) => ({
      ...prev,
      logoFile: file,
      logoPreview: URL.createObjectURL(file),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showMessage("Brand name is required", "error");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("is_active", String(form.is_active));
      if (form.logoFile) formData.append("brand_logo", form.logoFile);

      const url = editingBrand ? `/api/brands/${editingBrand.id}` : "/api/brands";
      const method = editingBrand ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token()}` },
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        showMessage(data.message || (editingBrand ? "Brand updated" : "Brand created"));
        closeDialog();
        fetchBrands();
      } else {
        showMessage(data.message || "Failed to save brand", "error");
      }
    } catch {
      showMessage("Failed to save brand", "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!brandToDelete) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/brands/${brandToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await response.json();

      if (data.success) {
        showMessage(data.message || "Brand deleted");
        setDeleteDialogOpen(false);
        setBrandToDelete(null);
        fetchBrands();
      } else {
        showMessage(data.message || "Failed to delete brand", "error");
      }
    } catch {
      showMessage("Failed to delete brand", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ fontFamily: fontBody, width: "100%" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "flex-end" }}
        spacing={2}
        sx={{ mb: { xs: 2.5, md: 3.5 } }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: fontDisplay,
              fontWeight: 700,
              fontSize: { xs: "1.5rem", sm: "1.85rem" },
              color: textOnLight,
            }}
          >
            Shoe Brands
          </Typography>
          <Typography sx={{ color: textMuted, mt: 0.5, fontSize: "0.9rem" }}>
            Manage the brands in your Carl Shoe Store catalog
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreate}
          sx={{
            borderRadius: "14px",
            py: 1.25,
            px: 2.5,
            fontWeight: 700,
            textTransform: "none",
            fontFamily: fontBody,
            bgcolor: sageGreenDark,
            boxShadow: `0 6px 20px ${alpha(sageGreenDeeper, 0.25)}`,
            "&:hover": { bgcolor: sageGreenDeeper },
          }}
        >
          Add brand
        </Button>
      </Stack>

      <TextField
        fullWidth
        placeholder="Search brands…"
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
      ) : brands.length === 0 ? (
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
          <ShoeIcon sx={{ fontSize: 48, color: sageGreen, mb: 1.5 }} />
          <Typography sx={{ fontWeight: 700, color: textOnLight, mb: 0.5 }}>
            {search ? "No brands match your search" : "No brands yet"}
          </Typography>
          <Typography sx={{ color: textMuted, fontSize: "0.9rem", mb: 2 }}>
            {search ? "Try a different search term." : "Add your first shoe brand to get started."}
          </Typography>
          {!search && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openCreate}
              sx={{
                borderRadius: "14px",
                textTransform: "none",
                fontWeight: 700,
                bgcolor: sageGreenDark,
              }}
            >
              Add brand
            </Button>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: { xs: 2, sm: 2.5, md: 3 },
          }}
        >
          {brands.map((brand) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              onEdit={openEdit}
              onDelete={(b) => {
                setBrandToDelete(b);
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
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: "20px", fontFamily: fontBody },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: textOnLight, pr: 6 }}>
          {editingBrand ? "Edit brand" : "New brand"}
          <IconButton
            onClick={closeDialog}
            sx={{ position: "absolute", right: 12, top: 12, color: textMuted }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: alpha(sageGreenDark, 0.08) }}>
          <Stack spacing={2.5}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: "20px",
                  border: `2px dashed ${alpha(sageGreenDark, 0.2)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  bgcolor: alpha(cream, 0.6),
                  cursor: "pointer",
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {form.logoPreview ? (
                  <Box
                    component="img"
                    src={form.logoPreview}
                    alt="Logo preview"
                    sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                  />
                ) : (
                  <PhotoCameraOutlined sx={{ fontSize: 36, color: sageGreen }} />
                )}
              </Box>
              <Button
                size="small"
                onClick={() => fileInputRef.current?.click()}
                sx={{ textTransform: "none", fontWeight: 600, color: sageGreenDark }}
              >
                {form.logoPreview ? "Change logo" : "Upload logo"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleLogoSelect}
              />
            </Box>

            <TextField
              fullWidth
              required
              label="Brand name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              sx={fieldSx}
            />

            <TextField
              fullWidth
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              multiline
              minRows={3}
              sx={fieldSx}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: sageGreenDark },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      bgcolor: sageGreen,
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ fontFamily: fontBody, fontWeight: 600, color: textOnLight }}>
                  Active on storefront
                </Typography>
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={closeDialog}
            sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 700,
              bgcolor: sageGreenDark,
              "&:hover": { bgcolor: sageGreenDeeper },
            }}
          >
            {saving ? "Saving…" : editingBrand ? "Save changes" : "Create brand"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: "20px", fontFamily: fontBody } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: textOnLight }}>Delete brand?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: textMuted }}>
            Are you sure you want to delete <strong>{brandToDelete?.name}</strong>? This cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
            sx={{ borderRadius: "12px", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            disabled={deleting}
            sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700 }}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: "12px", fontFamily: fontBody }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
