import { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import Navbar from "./Navbar";
import Dashboard from "../Pages/Dashboard";
import Shoes from "../Pages/Shoes";
import Settings from "../Pages/Settings";
import NotFound from "../Pages/NotFound";
import { mobileMainPaddingBottom } from "../constants/layout";

function PageRoutes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      setLoading(false);
    } else {
      window.location.href = "/";
    }
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      <Navbar user={user} setUser={setUser} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 2, md: 3 },
          px: { xs: 2, md: 3 },
          pb: { xs: mobileMainPaddingBottom, md: 3 },
          mt: { xs: 8, md: 9 },
          minHeight: "100vh",
          width: { xs: "100%", md: "auto" },
          boxSizing: "border-box",
          scrollPaddingBottom: { xs: mobileMainPaddingBottom, md: 0 },
          bgcolor: "#F7F4EF",
          fontFamily: '"DM Sans", "Inter", sans-serif',
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="/analytics" replace />} />
            <Route path="home" element={<Navigate to="/analytics" replace />} />
            <Route path="analytics" element={<Dashboard user={user} />} />
            <Route path="shoes" element={<Shoes />} />
            <Route path="settings" element={<Settings user={user} setUser={setUser} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </Box>
    </Box>
  );
}

export default PageRoutes;
