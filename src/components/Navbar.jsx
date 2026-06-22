import { useEffect, useState } from "react";
import {
  Logout,
  Dashboard,
  Settings,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { styled, useTheme, alpha } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import {
  Box,
  Typography,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import Header from "./Header/Header";
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
import { MOBILE_BOTTOM_NAV_HEIGHT } from "../constants/layout";

const drawerWidth = 272;
const collapsedWidth = 92;
const mobileBottomNavHeight = MOBILE_BOTTOM_NAV_HEIGHT;
const carlLogo = "/logo.png";

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: collapsedWidth,
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  minHeight: 72,
  padding: theme.spacing(1.5, 1.5, 1, 1.5),
  borderBottom: `1px solid ${alpha(sageGreenDark, 0.12)}`,
  background: `linear-gradient(180deg, ${cream} 0%, rgba(240, 235, 224, 0.85) 100%)`,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "isMobile",
})(({ theme, open, isMobile }) => ({
  zIndex: theme.zIndex.drawer + 1,
  background: `linear-gradient(135deg, ${sageGreenDark} 0%, ${sageGreenDeeper} 100%)`,
  boxShadow: `0 4px 24px ${alpha(sageGreenDeeper, 0.35)}, inset 0 1px 0 ${alpha("#fff", 0.08)}`,
  borderBottom: `1px solid ${alpha("#fff", 0.06)}`,
  fontFamily: fontBody,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(isMobile
    ? {
        marginLeft: 0,
        width: "100%",
      }
    : open
      ? {
          marginLeft: drawerWidth,
          width: `calc(100% - ${drawerWidth}px)`,
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }
      : {
          marginLeft: collapsedWidth,
          width: `calc(100% - ${collapsedWidth}px)`,
        }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiDrawer-paper": {
    borderRight: `1px solid ${alpha(sageGreenDark, 0.1)}`,
    background: `linear-gradient(180deg, ${cream} 0%, rgba(245, 241, 234, 0.98) 100%)`,
    boxShadow: `4px 0 24px ${alpha(sageGreenDeeper, 0.06)}`,
  },
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const navItems = [
  { text: "Dashboard", icon: Dashboard, path: "/analytics" },
  { text: "Settings", icon: Settings, path: "/settings" },
];

const navButtonSx = (open, active) => ({
  mx: open ? 1 : 0.75,
  mb: 0.75,
  borderRadius: "14px",
  flexDirection: open ? "row" : "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: open ? 48 : 72,
  px: open ? 1.75 : 0.5,
  py: open ? 1 : 1.25,
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  color: active ? cream : textMuted,
  bgcolor: active
    ? `linear-gradient(135deg, ${sageGreenDark} 0%, ${sageGreenDeeper} 100%)`
    : "transparent",
  boxShadow: active ? `0 6px 20px ${alpha(sageGreenDeeper, 0.28)}` : "none",
  "&:hover": {
    bgcolor: active ? sageGreenDark : alpha(sageGreen, 0.12),
    transform: open ? "translateX(2px)" : "none",
  },
  "&.Mui-selected": {
    bgcolor: sageGreenDark,
    "&:hover": { bgcolor: sageGreenDark },
  },
  "& .MuiListItemIcon-root": {
    color: active ? cream : sageGreenDark,
    minWidth: "auto",
    justifyContent: "center",
    mb: open ? 0 : 0.5,
  },
  "& .MuiListItemText-root": {
    margin: 0,
    textAlign: "center",
  },
  "& .MuiListItemText-primary": {
    fontWeight: active ? 700 : 600,
    fontSize: open ? "0.9rem" : "0.62rem",
    lineHeight: 1.15,
    letterSpacing: open ? "0.01em" : "0",
    color: active ? cream : textOnLight,
    whiteSpace: "nowrap",
  },
});

const getMobileNavValue = (pathname) => {
  if (pathname === "/settings") return "/settings";
  if (pathname === "/analytics") return "/analytics";
  return false;
};

const Navbar = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(() => window.innerWidth >= theme.breakpoints.values.md);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleResize = () => {
      setOpen(window.innerWidth >= theme.breakpoints.values.md);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [theme.breakpoints.values.md]);

  const renderNavButton = (item) => {
    const active = isActive(item.path);
    const Icon = item.icon;

    return (
      <ListItemButton
        key={item.text}
        onClick={() => navigate(item.path)}
        selected={active}
        sx={navButtonSx(open, active)}
      >
        <ListItemIcon>
          <Icon sx={{ fontSize: open ? 22 : 24 }} />
        </ListItemIcon>
        <ListItemText primary={item.text} />
      </ListItemButton>
    );
  };

  const mobileNavValue = getMobileNavValue(location.pathname);

  return (
    <Box sx={{ display: "flex", fontFamily: fontBody }}>
      <CssBaseline />
      <AppBar position="fixed" open={open} isMobile={isMobile}>
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 }, px: { xs: 1, sm: 2 } }}>
          <Header
            user={props.user}
            setUser={props.setUser}
            handleDrawerOpen={handleDrawerOpen}
            open={open}
            isMobile={isMobile}
          />
        </Toolbar>
      </AppBar>

      {isMobile && (
        <Box
          component="nav"
          aria-label="Mobile navigation"
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.drawer,
            borderTop: `1px solid ${alpha(sageGreenDark, 0.12)}`,
            bgcolor: cream,
            boxShadow: `0 -4px 24px ${alpha(sageGreenDeeper, 0.1)}`,
            pb: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <BottomNavigation
            showLabels
            value={mobileNavValue}
            onChange={(_, newValue) => {
              if (newValue === "logout") {
                logout();
                return;
              }
              navigate(newValue);
            }}
            sx={{
              height: mobileBottomNavHeight,
              bgcolor: "transparent",
              "& .MuiBottomNavigationAction-root": {
                minWidth: 0,
                maxWidth: "none",
                flex: 1,
                py: 0.75,
                color: textMuted,
                transition: "color 0.2s ease",
                "&.Mui-selected": {
                  color: sageGreenDark,
                },
              },
              "& .MuiBottomNavigationAction-label": {
                fontFamily: fontBody,
                fontSize: "0.68rem",
                fontWeight: 600,
                mt: 0.25,
                "&.Mui-selected": {
                  fontSize: "0.68rem",
                  fontWeight: 700,
                },
              },
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <BottomNavigationAction
                  key={item.text}
                  label={item.text}
                  value={item.path}
                  icon={<Icon sx={{ fontSize: 24 }} />}
                />
              );
            })}
            <BottomNavigationAction
              label="Logout"
              value="logout"
              icon={<Logout sx={{ fontSize: 24 }} />}
              sx={{
                color: "#a63d3d",
                "&.Mui-selected": { color: "#a63d3d" },
                "& .MuiBottomNavigationAction-label": { color: "#a63d3d" },
              }}
            />
          </BottomNavigation>
        </Box>
      )}

      <Drawer
        variant="permanent"
        open={open}
        sx={{ display: { xs: "none", md: "block" } }}
      >
        <DrawerHeader
          sx={{
            justifyContent: open ? "space-between" : "center",
            flexDirection: open ? "row" : "column",
            gap: open ? 0 : 1,
            py: open ? undefined : 1.5,
          }}
        >
          {open ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                overflow: "hidden",
                flex: 1,
              }}
            >
              <Box
                component="img"
                src={carlLogo}
                alt="Carl Shoe Store"
                sx={{ width: 36, height: 36, objectFit: "contain" }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    color: textOnLight,
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                  }}
                  noWrap
                >
                  Carl Shoe Store
                </Typography>
                <Typography
                  sx={{
                    fontFamily: fontDisplay,
                    fontStyle: "italic",
                    fontSize: "0.68rem",
                    color: textMuted,
                    lineHeight: 1.2,
                  }}
                  noWrap
                >
                  Admin
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box
              component="img"
              src={carlLogo}
              alt="Carl Shoe Store"
              sx={{ width: 40, height: 40, objectFit: "contain", mx: "auto" }}
            />
          )}
          {open && (
            <IconButton
              onClick={handleDrawerClose}
              size="small"
              sx={{
                color: sageGreenDark,
                bgcolor: alpha(sageGreen, 0.1),
                "&:hover": { bgcolor: alpha(sageGreen, 0.18) },
              }}
            >
              {theme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          )}
        </DrawerHeader>

        <Box sx={{ px: open ? 0.5 : 0.25, pt: 2, pb: 1 }}>
          <List disablePadding>{navItems.map(renderNavButton)}</List>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ p: 1, pb: 2 }}>
          <ListItemButton
            onClick={logout}
            sx={{
              ...navButtonSx(open, false),
              flexDirection: open ? "row" : "row",
              minHeight: open ? 48 : 48,
              py: open ? 1 : 1,
              color: "#a63d3d",
              border: `1px solid ${alpha("#a63d3d", 0.2)}`,
              bgcolor: alpha("#a63d3d", 0.06),
              "&:hover": { bgcolor: alpha("#a63d3d", 0.12) },
              "& .MuiListItemIcon-root": { color: "#a63d3d", mb: 0 },
              "& .MuiListItemText-primary": { color: "#a63d3d" },
            }}
          >
            <ListItemIcon>
              <Logout sx={{ fontSize: open ? 22 : 24 }} />
            </ListItemIcon>
            {open && (
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ fontWeight: 700 }}
              />
            )}
          </ListItemButton>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Navbar;
