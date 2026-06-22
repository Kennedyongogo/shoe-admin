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
  CategoryOutlined,
  SubdirectoryArrowRight,
} from "@mui/icons-material";
import {
  sageGreen,
  sageGreenDark,
  sageGreenDeeper,
  cream,
  textOnLight,
  textMuted,
  fontBody,
} from "../../constants/brandColors";
import { buildImageUrl, getAuthToken, catalogGridSx } from "./catalogUtils";
import { fieldSx, primaryButtonSx, cardShellSx } from "./catalogStyles";

const emptyForm = () => ({
  name: "",
  description: "",
  parent_id: "",
  sort_order: "0",
  is_active: true,
  imageFile: null,
  imagePreview: "",
});

const CategoryCard = ({ category, onEdit, onDelete }) => {
  const imageUrl = buildImageUrl(category.image_url);
  const description = category.description?.trim() || "";

  return (
    <Box sx={cardShellSx}>
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
        {imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt={category.name}
            sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `linear-gradient(145deg, ${alpha(sageGreen, 0.1)} 0%, ${alpha(cream, 0.95)} 100%)`,
              color: sageGreenDark,
            }}
          >
            <CategoryOutlined sx={{ fontSize: 52, opacity: 0.4 }} />
          </Box>
        )}
      </Box>

      <Box sx={{ p: 2.25, flex: 1, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Typography
            sx={{ fontWeight: 800, fontSize: "1.05rem", color: textOnLight, lineHeight: 1.25 }}
            noWrap
          >
            {category.name}
          </Typography>
          <Chip
            label={category.is_active ? "Active" : "Inactive"}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.68rem",
              fontWeight: 700,
              flexShrink: 0,
              bgcolor: category.is_active ? alpha(sageGreen, 0.15) : alpha("#a63d3d", 0.1),
              color: category.is_active ? sageGreenDark : "#a63d3d",
            }}
          />
        </Stack>

        <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: "wrap", gap: 0.75 }}>
          {category.parent && (
            <Chip
              icon={<SubdirectoryArrowRight sx={{ fontSize: "14px !important" }} />}
              label={category.parent.name}
              size="small"
              sx={{
                height: 24,
                fontSize: "0.68rem",
                fontWeight: 600,
                bgcolor: alpha(sageGreen, 0.1),
                color: sageGreenDark,
              }}
            />
          )}
          <Chip
            label={`Order ${category.sort_order ?? 0}`}
            size="small"
            sx={{
              height: 24,
              fontSize: "0.68rem",
              fontWeight: 600,
              bgcolor: alpha(sageGreenDark, 0.08),
              color: textMuted,
            }}
          />
        </Stack>

        {description && (
          <Typography
            sx={{
              mt: 1.25,
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
            onClick={() => onEdit(category)}
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
          <Tooltip title="Delete category">
            <IconButton
              onClick={() => onDelete(category)}
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

export default function CategoriesManager({ onMessage }) {
  const [categories, setCategories] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterParentId, setFilterParentId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const fetchParents = useCallback(async () => {
    try {
      const response = await fetch("/api/categories/parents", {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await response.json();
      if (data.success) setParents(data.data || []);
    } catch {
      onMessage("Failed to load parent categories", "error");
    }
  }, [onMessage]);

  const fetchCategories = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (filterParentId) params.set("parent_id", filterParentId);

      const response = await fetch(`/api/categories/children?${params}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await response.json();

      if (data.success) {
        setCategories(data.data || []);
      } else {
        onMessage(data.message || "Failed to load categories", "error");
      }
    } catch {
      onMessage("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  }, [search, filterParentId, onMessage]);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetchCategories();
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchCategories, search]);

  const openCreate = () => {
    if (parents.length === 0) {
      onMessage("Create a parent category first", "error");
      return;
    }
    setEditingCategory(null);
    setForm({
      ...emptyForm(),
      parent_id: filterParentId || parents[0]?.id || "",
    });
    setDialogOpen(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setForm({
      name: category.name || "",
      description: category.description || "",
      parent_id: category.parent_id || "",
      sort_order: String(category.sort_order ?? 0),
      is_active: category.is_active !== false,
      imageFile: null,
      imagePreview: buildImageUrl(category.image_url),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (form.imageFile && form.imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(form.imagePreview);
    }
    setDialogOpen(false);
    setEditingCategory(null);
    setForm(emptyForm());
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onMessage("Please choose an image file", "error");
      return;
    }
    if (form.imageFile && form.imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(form.imagePreview);
    }
    setForm((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      onMessage("Category name is required", "error");
      return;
    }
    if (!form.parent_id) {
      onMessage("Parent category is required", "error");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("parent_id", form.parent_id);
      formData.append("sort_order", form.sort_order || "0");
      formData.append("is_active", String(form.is_active));
      if (form.imageFile) formData.append("category_image", form.imageFile);

      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories/children";
      const response = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        onMessage(
          data.message || (editingCategory ? "Category updated" : "Category created")
        );
        closeDialog();
        fetchCategories();
      } else {
        onMessage(data.message || "Failed to save category", "error");
      }
    } catch {
      onMessage("Failed to save category", "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/categories/${categoryToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await response.json();

      if (data.success) {
        onMessage(data.message || "Category deleted");
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
        fetchCategories();
      } else {
        onMessage(data.message || "Failed to delete category", "error");
      }
    } catch {
      onMessage("Failed to delete category", "error");
    } finally {
      setDeleting(false);
    }
  };

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
          Subcategories under a parent — Running, Sneakers, Formal, etc.
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreate}
          disabled={parents.length === 0}
          sx={{
            ...primaryButtonSx,
            bgcolor: sageGreenDark,
            boxShadow: `0 6px 20px ${alpha(sageGreenDeeper, 0.25)}`,
            "&:hover": { bgcolor: sageGreenDeeper },
          }}
        >
          Add category
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          select
          label="Filter by parent"
          value={filterParentId}
          onChange={(e) => setFilterParentId(e.target.value)}
          sx={{ ...fieldSx, minWidth: { sm: 220 } }}
        >
          <MenuItem value="">All parents</MenuItem>
          {parents.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          placeholder="Search categories…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={fieldSx}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: sageGreen, fontSize: 22 }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress sx={{ color: sageGreenDark }} />
        </Box>
      ) : categories.length === 0 ? (
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
          <CategoryOutlined sx={{ fontSize: 52, color: sageGreen, mb: 1.5 }} />
          <Typography sx={{ fontWeight: 700, color: textOnLight, mb: 0.5 }}>
            {search ? "No categories match your search" : "No categories yet"}
          </Typography>
          <Typography sx={{ color: textMuted, fontSize: "0.9rem", mb: 2 }}>
            {search || filterParentId
              ? "Try a different search or parent filter."
              : parents.length === 0
                ? "Add parent categories first."
                : "Add subcategories like Running or Sneakers under a parent."}
          </Typography>
          {!search && !filterParentId && parents.length > 0 && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openCreate}
              sx={{ ...primaryButtonSx, bgcolor: sageGreenDark }}
            >
              Add category
            </Button>
          )}
        </Box>
      ) : (
        <Box sx={catalogGridSx}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={openEdit}
              onDelete={(c) => {
                setCategoryToDelete(c);
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
        PaperProps={{ sx: { borderRadius: "20px", fontFamily: fontBody } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: textOnLight, pr: 6 }}>
          {editingCategory ? "Edit category" : "New category"}
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
                  width: "100%",
                  height: 140,
                  borderRadius: "16px",
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
                {form.imagePreview ? (
                  <Box
                    component="img"
                    src={form.imagePreview}
                    alt="Category preview"
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
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
                {form.imagePreview ? "Change image" : "Upload image"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageSelect}
              />
            </Box>

            <TextField
              fullWidth
              required
              label="Category name"
              placeholder="e.g. Running, Sneakers"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              sx={fieldSx}
            />

            <TextField
              fullWidth
              required
              select
              label="Parent category"
              value={form.parent_id}
              onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
              sx={fieldSx}
              helperText="Subcategories belong under one parent (e.g. Running under Men's Shoes)"
            >
              {parents.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Sort order"
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              sx={fieldSx}
              helperText="Lower numbers appear first in menus"
              inputProps={{ min: 0 }}
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
          <Button onClick={closeDialog} sx={{ borderRadius: "12px", textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700, bgcolor: sageGreenDark }}
          >
            {saving ? "Saving…" : editingCategory ? "Save changes" : "Create category"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: "20px", fontFamily: fontBody } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: textOnLight }}>Delete category?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: textMuted }}>
            Delete <strong>{categoryToDelete?.name}</strong>? Products linked to this category may
            be affected. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
