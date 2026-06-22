import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Avatar,
  Chip,
  CircularProgress,
  InputAdornment,
  IconButton,
  Snackbar,
  Stack,
  Divider,
  alpha,
} from "@mui/material";
import {
  PersonOutline,
  EmailOutlined,
  PhoneOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  PhotoCameraOutlined,
  SaveOutlined,
  ShieldOutlined,
} from "@mui/icons-material";
import {
  sageGreen,
  sageGreenDark,
  sageGreenDeeper,
  cream,
  accentOrange,
  textOnLight,
  textMuted,
  fontBody,
  fontDisplay,
} from "../constants/brandColors";
import { mobileMainPaddingBottom } from "../constants/layout";

const PASSWORD_LOGOUT_DELAY_SEC = 5;

const buildImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return path.startsWith("/") ? path : `/${path}`;
};

const formatRole = (role) => {
  if (!role) return "Admin";
  return role
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    bgcolor: alpha(cream, 0.6),
    fontFamily: fontBody,
    transition: "all 0.2s ease",
    "& fieldset": { borderColor: alpha(sageGreenDark, 0.18) },
    "&:hover fieldset": { borderColor: alpha(sageGreen, 0.45) },
    "&.Mui-focused fieldset": {
      borderColor: sageGreenDark,
      borderWidth: 2,
    },
    "&.Mui-focused": {
      bgcolor: "#fff",
      boxShadow: `0 0 0 4px ${alpha(sageGreen, 0.12)}`,
    },
  },
  "& .MuiInputLabel-root": {
    fontFamily: fontBody,
    color: textMuted,
    "&.Mui-focused": { color: sageGreenDark },
  },
};

const SectionCard = ({ title, subtitle, icon, children, accent = sageGreenDark }) => (
  <Box
    sx={{
      borderRadius: "20px",
      overflow: "hidden",
      bgcolor: "#fff",
      border: `1px solid ${alpha(sageGreenDark, 0.1)}`,
      boxShadow: `0 8px 32px ${alpha(sageGreenDeeper, 0.06)}`,
    }}
  >
    <Box
      sx={{
        px: { xs: 2.5, sm: 3 },
        py: 2.5,
        background: `linear-gradient(135deg, ${alpha(accent, 0.12)} 0%, ${alpha(cream, 0.9)} 100%)`,
        borderBottom: `1px solid ${alpha(sageGreenDark, 0.08)}`,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(accent, 0.15),
            color: accent,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography
            sx={{ fontWeight: 800, fontSize: "1.1rem", color: textOnLight, lineHeight: 1.2 }}
          >
            {title}
          </Typography>
          <Typography sx={{ fontSize: "0.82rem", color: textMuted, mt: 0.25 }}>
            {subtitle}
          </Typography>
        </Box>
      </Stack>
    </Box>
    <Box sx={{ p: { xs: 2.5, sm: 3 } }}>{children}</Box>
  </Box>
);

export default function Settings({ user, setUser }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const logoutTimerRef = useRef(null);

  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "",
    profile_image: "",
    last_login: null,
  });
  const [profileFile, setProfileFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [pendingLogout, setPendingLogout] = useState(false);

  const token = () => localStorage.getItem("token");

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token()}` },
        });
        const data = await response.json();

        if (data.success && data.data) {
          setProfile({
            full_name: data.data.full_name || "",
            email: data.data.email || "",
            phone: data.data.phone || "",
            role: data.data.role || "",
            profile_image: data.data.profile_image || "",
            last_login: data.data.last_login || null,
          });
          setPreviewUrl(buildImageUrl(data.data.profile_image));
        }
      } catch {
        showMessage("Could not load profile", "error");
      } finally {
        setLoadingProfile(false);
      }
    };

    if (user?.id) fetchProfile();
    else setLoadingProfile(false);
  }, [user?.id]);

  useEffect(() => {
    return () => {
      if (profileFile && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [profileFile, previewUrl]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showMessage("Please choose an image file", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showMessage("Image must be under 5 MB", "error");
      return;
    }
    setProfileFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleProfileSave = async () => {
    if (!profile.full_name.trim()) {
      showMessage("Full name is required", "error");
      return;
    }

    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append("full_name", profile.full_name.trim());
      formData.append("phone", profile.phone.trim());
      if (profileFile) formData.append("profile_image", profileFile);

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token()}` },
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        const updated = data.data;
        setProfile((prev) => ({
          ...prev,
          full_name: updated.full_name,
          phone: updated.phone || "",
          profile_image: updated.profile_image || "",
        }));
        setPreviewUrl(buildImageUrl(updated.profile_image));
        setProfileFile(null);

        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        const merged = { ...stored, ...updated };
        localStorage.setItem("user", JSON.stringify(merged));
        setUser?.(merged);

        showMessage("Profile updated successfully");
      } else {
        showMessage(data.message || "Failed to update profile", "error");
      }
    } catch {
      showMessage("Failed to update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      showMessage("Please fill in all password fields", "error");
      return;
    }
    if (newPassword.length < 6) {
      showMessage("New password must be at least 6 characters", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showMessage("New passwords do not match", "error");
      return;
    }

    setSavingPassword(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPendingLogout(true);
        showMessage(
          `Password updated successfully. For your security, you will be signed out in ${PASSWORD_LOGOUT_DELAY_SEC} seconds. Please sign in again with your new password.`,
          "success"
        );
        logoutTimerRef.current = setTimeout(() => {
          localStorage.clear();
          setUser?.(null);
          navigate("/");
        }, PASSWORD_LOGOUT_DELAY_SEC * 1000);
      } else {
        showMessage(data.message || "Failed to update password", "error");
      }
    } catch {
      showMessage("Failed to update password", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const togglePassword = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (loadingProfile) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress sx={{ color: sageGreenDark }} />
      </Box>
    );
  }

  return (
    <Box sx={{ fontFamily: fontBody, width: "100%" }}>
      <Box sx={{ mb: { xs: 2.5, md: 3 } }}>
        <Typography
          sx={{
            fontFamily: fontDisplay,
            fontWeight: 700,
            fontSize: { xs: "1.5rem", sm: "1.85rem" },
            color: textOnLight,
            lineHeight: 1.15,
          }}
        >
          Settings
        </Typography>
        <Typography sx={{ color: textMuted, mt: 0.5, fontSize: { xs: "0.875rem", sm: "0.95rem" } }}>
          Manage your profile and account security
        </Typography>
      </Box>

      <Stack spacing={{ xs: 2.5, md: 3 }} sx={{ width: "100%" }}>
        <SectionCard
          title="Profile"
          subtitle="Your personal information"
          icon={<PersonOutline />}
        >
          <Stack spacing={2.5}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={previewUrl || undefined}
                  alt={profile.full_name}
                  sx={{
                    width: 88,
                    height: 88,
                    border: `3px solid ${cream}`,
                    boxShadow: `0 8px 24px ${alpha(sageGreenDeeper, 0.15)}`,
                    bgcolor: sageGreenDark,
                    fontSize: "1.75rem",
                    fontWeight: 700,
                  }}
                >
                  {profile.full_name?.charAt(0)?.toUpperCase() || "A"}
                </Avatar>
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    bgcolor: accentOrange,
                    color: "#fff",
                    border: `2px solid ${cream}`,
                    width: 34,
                    height: 34,
                    "&:hover": { bgcolor: "#b8744f" },
                  }}
                >
                  <PhotoCameraOutlined sx={{ fontSize: 18 }} />
                </IconButton>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePhotoSelect}
                />
              </Box>
              <Chip
                label={formatRole(profile.role)}
                size="small"
                sx={{
                  bgcolor: alpha(sageGreen, 0.12),
                  color: sageGreenDark,
                  fontWeight: 700,
                  fontSize: "0.72rem",
                }}
              />
            </Box>

            <Divider sx={{ borderColor: alpha(sageGreenDark, 0.08) }} />

            <TextField
              fullWidth
              label="Full name"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutline sx={{ color: sageGreen, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Email"
              value={profile.email}
              disabled
              sx={{
                ...fieldSx,
                "& .MuiOutlinedInput-root.Mui-disabled": {
                  bgcolor: alpha(sageGreen, 0.06),
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined sx={{ color: textMuted, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              helperText="Email cannot be changed here"
            />

            <TextField
              fullWidth
              label="Phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="Optional"
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneOutlined sx={{ color: sageGreen, fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              onClick={handleProfileSave}
              disabled={savingProfile}
              startIcon={savingProfile ? <CircularProgress size={18} color="inherit" /> : <SaveOutlined />}
              fullWidth
              sx={{
                borderRadius: "14px",
                py: 1.35,
                fontWeight: 700,
                textTransform: "none",
                fontFamily: fontBody,
                bgcolor: sageGreenDark,
                boxShadow: `0 6px 20px ${alpha(sageGreenDeeper, 0.25)}`,
                "&:hover": { bgcolor: sageGreenDeeper },
              }}
            >
              {savingProfile ? "Saving…" : "Save profile"}
            </Button>
          </Stack>
        </SectionCard>

        <SectionCard
          title="Security"
          subtitle="Update your password"
          icon={<ShieldOutlined />}
          accent="#a63d3d"
        >
          <Box component="form" onSubmit={handlePasswordSave}>
            <Stack spacing={2.5}>
              <Alert
                severity="info"
                sx={{
                  borderRadius: "12px",
                  bgcolor: alpha(sageGreen, 0.08),
                  color: textOnLight,
                  "& .MuiAlert-icon": { color: sageGreenDark },
                }}
              >
                Use a strong password you do not use elsewhere.
              </Alert>

              {[
                { key: "current", label: "Current password", value: currentPassword, set: setCurrentPassword },
                { key: "new", label: "New password", value: newPassword, set: setNewPassword },
                { key: "confirm", label: "Confirm new password", value: confirmPassword, set: setConfirmPassword },
              ].map(({ key, label, value, set }) => (
                <TextField
                  key={key}
                  fullWidth
                  label={label}
                  type={showPasswords[key] ? "text" : "password"}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  autoComplete={key === "current" ? "current-password" : "new-password"}
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: sageGreen, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() => togglePassword(key)}
                          aria-label={showPasswords[key] ? "Hide password" : "Show password"}
                        >
                          {showPasswords[key] ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              ))}

              <Button
                type="submit"
                variant="contained"
                disabled={savingPassword || pendingLogout}
                startIcon={
                  savingPassword ? <CircularProgress size={18} color="inherit" /> : <LockOutlined />
                }
                fullWidth
                sx={{
                  borderRadius: "14px",
                  py: 1.35,
                  fontWeight: 700,
                  textTransform: "none",
                  fontFamily: fontBody,
                  bgcolor: "#a63d3d",
                  boxShadow: `0 6px 20px ${alpha("#a63d3d", 0.25)}`,
                  "&:hover": { bgcolor: "#8f3333" },
                }}
              >
                {savingPassword ? "Updating…" : pendingLogout ? "Signing out…" : "Update password"}
              </Button>
            </Stack>
          </Box>
        </SectionCard>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={pendingLogout ? null : 4000}
        onClose={(_, reason) => {
          if (pendingLogout && reason === "clickaway") return;
          setSnackbar((s) => ({ ...s, open: false }));
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: { xs: mobileMainPaddingBottom, md: 2 } }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={
            pendingLogout
              ? undefined
              : () => setSnackbar((s) => ({ ...s, open: false }))
          }
          sx={{ borderRadius: "12px", fontFamily: fontBody, width: "100%", maxWidth: 420 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
