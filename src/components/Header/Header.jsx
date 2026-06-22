import { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  CircularProgress,
  Chip,
  Divider,
  Avatar,
} from "@mui/material";
import {
  Menu as MenuIcon,
  KeyboardArrowDown,
  SettingsOutlined,
  LogoutOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import {
  cream,
  sageGreen,
  sageGreenDark,
  textOnLight,
  fontBody,
} from "../../constants/brandColors";

const buildImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return path.startsWith("/") ? path : `/${path}`;
};

const LoadingScreen = () => (
  <Box
    sx={{
      position: "fixed",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: cream,
      zIndex: 1300,
    }}
  >
    <CircularProgress sx={{ color: sageGreenDark }} />
  </Box>
);

export default function Header({ user, setUser, handleDrawerOpen, open, isMobile }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      const userData = JSON.parse(savedUser);
      setCurrentUser(userData);
      setUser(userData);
    } else {
      window.location.href = "/";
    }
    setLoading(false);
  }, [setUser]);

  useEffect(() => {
    if (user) setCurrentUser(user);
  }, [user]);

  const displayUser = user || currentUser;
  const profileImageUrl = buildImageUrl(displayUser?.profile_image);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menuOpen = Boolean(anchorEl);

  return (
    <>
      {loading && <LoadingScreen />}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: 1.5,
          fontFamily: fontBody,
        }}
      >
        {!isMobile && (
          <IconButton
            aria-label="Open navigation"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              color: cream,
              bgcolor: alpha("#fff", 0.08),
              border: `1px solid ${alpha("#fff", 0.12)}`,
              borderRadius: "12px",
              ...(open && { display: "none" }),
              "&:hover": { bgcolor: alpha("#fff", 0.14) },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Chip
          onClick={(e) => setAnchorEl(e.currentTarget)}
          icon={
            <Avatar
              src={profileImageUrl || undefined}
              alt={displayUser?.full_name}
              sx={{
                width: 28,
                height: 28,
                bgcolor: alpha(sageGreenDark, 0.2),
                color: sageGreenDark,
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              {displayUser?.full_name?.charAt(0)?.toUpperCase() || "A"}
            </Avatar>
          }
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, px: 0.5 }}>
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: textOnLight,
                  lineHeight: 1.2,
                }}
                noWrap
              >
                {displayUser?.full_name || displayUser?.name || "Admin"}
              </Typography>
              <KeyboardArrowDown
                sx={{
                  fontSize: 20,
                  color: sageGreenDark,
                  transition: "transform 0.2s",
                  transform: menuOpen ? "rotate(180deg)" : "none",
                }}
              />
            </Box>
          }
          sx={{
            height: "auto",
            py: 0.5,
            pl: 0.5,
            pr: 1,
            bgcolor: cream,
            border: `1px solid ${alpha("#fff", 0.5)}`,
            boxShadow: `0 4px 16px ${alpha("#000", 0.12)}`,
            cursor: "pointer",
            "& .MuiChip-icon": { ml: 0.5 },
            "&:hover": {
              bgcolor: alpha(cream, 0.95),
              boxShadow: `0 6px 20px ${alpha("#000", 0.16)}`,
            },
          }}
        />

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 200,
                borderRadius: "16px",
                bgcolor: cream,
                border: `1px solid ${alpha(sageGreenDark, 0.12)}`,
                boxShadow: `0 16px 40px ${alpha(sageGreenDark, 0.18)}`,
                overflow: "hidden",
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: textOnLight }}>
              {displayUser?.full_name}
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: sageGreen }}>
              {displayUser?.email}
            </Typography>
          </Box>
          <Divider sx={{ borderColor: alpha(sageGreenDark, 0.1) }} />
          <MenuItem
            onClick={() => {
              navigate("/settings");
              setAnchorEl(null);
            }}
            sx={{
              py: 1.25,
              fontWeight: 600,
              color: textOnLight,
              "&:hover": { bgcolor: alpha(sageGreen, 0.1) },
            }}
          >
            <SettingsOutlined sx={{ mr: 1.5, fontSize: 20, color: sageGreenDark }} />
            Settings
          </MenuItem>
          <MenuItem
            onClick={() => {
              logout();
              setAnchorEl(null);
            }}
            sx={{
              py: 1.25,
              fontWeight: 600,
              color: "#a63d3d",
              "&:hover": { bgcolor: alpha("#a63d3d", 0.08) },
            }}
          >
            <LogoutOutlined sx={{ mr: 1.5, fontSize: 20 }} />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </>
  );
}
