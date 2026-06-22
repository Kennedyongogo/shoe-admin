import { useCallback, useState } from "react";
import { Box, Typography, Tabs, Tab, Snackbar, Alert, alpha } from "@mui/material";
import { CategoryOutlined, StorefrontOutlined, LayersOutlined, Inventory2Outlined } from "@mui/icons-material";
import BrandsManager from "../components/Shoes/BrandsManager";
import ParentCategoriesManager from "../components/Shoes/ParentCategoriesManager";
import CategoriesManager from "../components/Shoes/CategoriesManager";
import ProductsManager from "../components/Shoes/ProductsManager";
import {
  sageGreen,
  sageGreenDark,
  cream,
  textOnLight,
  textMuted,
  fontBody,
  fontDisplay,
} from "../constants/brandColors";
import { mobileMainPaddingBottom } from "../constants/layout";

export default function Shoes() {
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showMessage = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  return (
    <Box sx={{ fontFamily: fontBody, width: "100%" }}>
      <Box sx={{ mb: { xs: 2.5, md: 3 } }}>
        <Typography
          sx={{
            fontFamily: fontDisplay,
            fontWeight: 700,
            fontSize: { xs: "1.5rem", sm: "1.85rem" },
            color: textOnLight,
          }}
        >
          Shoe Catalog
        </Typography>
        <Typography sx={{ color: textMuted, mt: 0.5, fontSize: "0.9rem" }}>
          Manage brands, categories, and products
        </Typography>
      </Box>

      <Box
        sx={{
          mb: 3,
          borderRadius: "16px",
          bgcolor: alpha(cream, 0.7),
          border: `1px solid ${alpha(sageGreenDark, 0.1)}`,
          p: 0.5,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: 48,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontFamily: fontBody,
              fontSize: "0.9rem",
              minHeight: 48,
              borderRadius: "12px",
              color: textMuted,
            },
            "& .Mui-selected": {
              color: `${sageGreenDark} !important`,
              bgcolor: "#fff",
              boxShadow: `0 2px 12px ${alpha(sageGreenDark, 0.1)}`,
            },
            "& .MuiTabs-indicator": { display: "none" },
          }}
        >
          <Tab icon={<StorefrontOutlined />} iconPosition="start" label="Brands" />
          <Tab icon={<LayersOutlined />} iconPosition="start" label="Parents" />
          <Tab icon={<CategoryOutlined />} iconPosition="start" label="Categories" />
          <Tab icon={<Inventory2Outlined />} iconPosition="start" label="Products" />
        </Tabs>
      </Box>

      {tab === 0 && <BrandsManager onMessage={showMessage} />}
      {tab === 1 && <ParentCategoriesManager onMessage={showMessage} />}
      {tab === 2 && <CategoriesManager onMessage={showMessage} />}
      {tab === 3 && <ProductsManager onMessage={showMessage} />}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: { xs: mobileMainPaddingBottom, md: 2 } }}
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
