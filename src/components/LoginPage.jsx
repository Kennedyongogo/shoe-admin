import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  EmailOutlined,
  LockOutlined,
  ArrowForward,
} from "@mui/icons-material";
import Swal from "sweetalert2";

const sageGreen = "#6E7F63";
const sageGreenDark = "#4F5D47";
const sageGreenDeeper = "#3D4638";
const cream = "#F0EBE0";
const creamSoft = "rgba(255, 252, 247, 0.94)";
const accentOrange = "#C9855C";
const textOnLight = "#2C3328";
const textMuted = "#5C6654";

const loginBackgroundImage = "/c1n3ma-shoes-3952048_1920.jpg";
const carlLogo = "/logo.png";

const fontBody = '"DM Sans", "Inter", sans-serif';
const fontDisplay = '"Playfair Display", Georgia, serif';

const iconAdornment = (Icon) => (
  <InputAdornment position="start">
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "rgba(110, 127, 99, 0.12)",
        color: sageGreenDark,
        transition: "all 0.25s ease",
      }}
    >
      <Icon sx={{ fontSize: 20 }} />
    </Box>
  </InputAdornment>
);

export default function LoginPage() {
  const navigate = useNavigate();

  const rfEmail = useRef();
  const rfPassword = useRef();
  const rsEmail = useRef();

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [body, updateBody] = useState({ email: null });
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const login = async (e) => {
    if (e) e.preventDefault();

    const d = { ...body };
    d.email = rfEmail.current?.value?.toLowerCase?.()?.trim() ?? "";
    d.password = rfPassword.current?.value ?? "";
    updateBody(d);

    if (!validateEmail(d.email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address",
        confirmButtonColor: sageGreenDark,
      });
      return;
    }

    if (!validatePassword(d.password)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Password",
        text: "Password must be at least 6 characters",
        confirmButtonColor: sageGreenDark,
      });
      return;
    }

    setLoading(true);
    Swal.fire({
      title: "Signing in...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: d.email, password: d.password }),
      });
      const data = await response.json();

      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.message,
          confirmButtonColor: sageGreenDark,
        });
      } else if (data.success) {
        const user = data.data.user;

        if (!["super-admin", "admin"].includes(user.role)) {
          Swal.fire({
            icon: "error",
            title: "Access Denied",
            text: "Admin privileges required to access this portal.",
            confirmButtonColor: sageGreenDark,
          });
          return;
        }

        Swal.fire({
          icon: "success",
          title: "Welcome back",
          text: data.message,
          timer: 1500,
          showConfirmButton: false,
        });
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("user", JSON.stringify(user));
        setTimeout(() => navigate("/analytics"), 1500);
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.message,
          confirmButtonColor: sageGreenDark,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Login failed. Please try again.",
        confirmButtonColor: sageGreenDark,
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    const d = { Email: rsEmail.current?.value?.toLowerCase?.()?.trim() ?? "" };

    if (!validateEmail(d.Email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address",
        confirmButtonColor: sageGreenDark,
      });
      return;
    }

    setResetLoading(true);
    Swal.fire({
      title: "Processing...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await fetch("/api/auth/forgot", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(d),
      });
      const data = await response.json();

      if (response.ok) {
        setOpenResetDialog(false);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: data.message,
          confirmButtonColor: sageGreenDark,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message,
          confirmButtonColor: sageGreenDark,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: sageGreenDark,
      });
    } finally {
      setResetLoading(false);
    }
  };

  const validateEmail = (email) =>
    String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]/.,;:\s@"]+(\.[^<>()[\]/.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );

  const validatePassword = (password) => password && password.length >= 6;

  const inputSx = (focused) => ({
    "& .MuiOutlinedInput-root": {
      borderRadius: "14px",
      bgcolor: "rgba(255, 255, 255, 0.85)",
      pl: 0.5,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: focused
        ? "0 0 0 4px rgba(110, 127, 99, 0.15), 0 8px 24px rgba(44, 51, 40, 0.08)"
        : "0 2px 8px rgba(44, 51, 40, 0.04)",
      "& fieldset": {
        borderColor: focused ? sageGreen : "rgba(79, 93, 71, 0.22)",
        borderWidth: focused ? "1.5px" : "1px",
      },
      "&:hover fieldset": {
        borderColor: sageGreen,
      },
      "&.Mui-focused fieldset": {
        borderColor: sageGreenDark,
        borderWidth: "1.5px",
      },
    },
    "& .MuiInputLabel-root": {
      color: textMuted,
      fontWeight: 500,
      fontSize: "0.9rem",
    },
    "& .MuiInputLabel-root.Mui-focused": { color: sageGreenDark },
    "& .MuiInputBase-input": {
      py: 1.6,
      pl: 1,
      color: textOnLight,
      fontWeight: 500,
      fontSize: "0.95rem",
      "&::placeholder": { color: "rgba(92, 102, 84, 0.55)", opacity: 1 },
    },
  });

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        height: "100vh",
        maxHeight: "100dvh",
        width: "100%",
        overflow: "hidden",
        fontFamily: fontBody,
        "@keyframes slowZoom": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.07)" },
        },
        "@keyframes fadeInUp": {
          "0%": { opacity: 0, transform: "translateY(28px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "@keyframes fadeIn": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "@keyframes floatLogo": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      }}
    >
      {/* Background */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
        }}
        aria-hidden
      >
        <Box
          sx={{
            position: "absolute",
            inset: "-4%",
            backgroundImage: `url(${loginBackgroundImage})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            bgcolor: sageGreenDeeper,
            animation: "slowZoom 30s ease-in-out infinite alternate",
            willChange: "transform",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.08) 0%,
              rgba(0, 0, 0, 0.02) 40%,
              rgba(0, 0, 0, 0.25) 100%
            )`,
          }}
        />
      </Box>

      {/* Content */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          maxHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: "clamp(16px, 4vw, 32px)",
          py: "clamp(20px, 3vh, 40px)",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        {/* Brand */}
        <Box
          sx={{
            textAlign: "center",
            mb: "clamp(12px, 2vh, 20px)",
            flexShrink: 0,
            animation: "fadeIn 0.8s ease-out",
          }}
        >
          <Box
            component="img"
            src={carlLogo}
            alt="Carl Shoe Store"
            sx={{
              display: "block",
              width: "clamp(120px, 22vw, 180px)",
              height: "auto",
              mx: "auto",
              mb: 1,
              filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.5))",
              animation: "floatLogo 5s ease-in-out infinite",
            }}
          />
          <Typography
            sx={{
              fontFamily: fontBody,
              fontSize: "clamp(1.1rem, 2vw + 0.4rem, 1.5rem)",
              fontWeight: 800,
              color: cream,
              letterSpacing: "-0.02em",
              textShadow: "0 2px 20px rgba(0,0,0,0.45)",
            }}
          >
            Carl Shoe Store
          </Typography>
          <Typography
            sx={{
              fontFamily: fontDisplay,
              fontStyle: "italic",
              color: "rgba(240, 235, 224, 0.88)",
              fontSize: "clamp(0.8rem, 1.2vw + 0.3rem, 1rem)",
              mt: 0.25,
              letterSpacing: "0.04em",
              textShadow: "0 1px 12px rgba(0,0,0,0.35)",
            }}
          >
            Step in Style
          </Typography>
        </Box>

        {/* Login card */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 420,
            flexShrink: 0,
            borderRadius: "24px",
            p: { xs: 2.5, sm: 3.5 },
            background: `linear-gradient(
              145deg,
              rgba(255, 252, 247, 0.97) 0%,
              rgba(240, 235, 224, 0.92) 100%
            )`,
            backdropFilter: "blur(20px) saturate(1.4)",
            WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            border: "1px solid rgba(255, 255, 255, 0.75)",
            boxShadow: `
              0 4px 6px rgba(44, 51, 40, 0.04),
              0 24px 48px rgba(44, 51, 40, 0.14),
              inset 0 1px 0 rgba(255, 255, 255, 0.9)
            `,
            animation: "fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both",
          }}
        >
          {/* Title */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 3,
            }}
          >
            <Divider
              sx={{
                flex: 1,
                borderColor: "rgba(79, 93, 71, 0.2)",
              }}
            />
            <Typography
              sx={{
                fontWeight: 700,
                color: textOnLight,
                fontSize: "0.8rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              Admin Login
            </Typography>
            <Divider
              sx={{
                flex: 1,
                borderColor: "rgba(79, 93, 71, 0.2)",
              }}
            />
          </Box>

          <form onSubmit={login}>
            <TextField
              inputRef={rfEmail}
              type="email"
              label="Email"
              placeholder="you@carlshoestore.com"
              fullWidth
              required
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              InputProps={{
                startAdornment: iconAdornment(EmailOutlined),
              }}
              sx={{ ...inputSx(emailFocused), mb: 2 }}
            />

            <TextField
              inputRef={rfPassword}
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Enter your password"
              fullWidth
              required
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              InputProps={{
                startAdornment: iconAdornment(LockOutlined),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      sx={{
                        mr: 0.5,
                        color: textMuted,
                        "&:hover": {
                          bgcolor: "rgba(110, 127, 99, 0.1)",
                          color: sageGreenDark,
                        },
                      }}
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ ...inputSx(passwordFocused), mb: 1 }}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 0.5 }}>
              <Typography
                component="button"
                type="button"
                onClick={() => setOpenResetDialog(true)}
                sx={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: accentOrange,
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  fontFamily: fontBody,
                  p: 0.5,
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "#a86d42",
                    bgcolor: "rgba(201, 133, 92, 0.08)",
                  },
                }}
              >
                Forgot password?
              </Typography>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              endIcon={
                loading ? (
                  <CircularProgress size={20} sx={{ color: cream }} />
                ) : (
                  <ArrowForward sx={{ fontSize: 20, transition: "transform 0.25s" }} />
                )
              }
              sx={{
                mt: 2.5,
                py: 1.6,
                borderRadius: "14px",
                background: `linear-gradient(135deg, ${sageGreenDark} 0%, ${sageGreenDeeper} 100%)`,
                color: cream,
                fontWeight: 700,
                fontSize: "0.95rem",
                letterSpacing: "0.02em",
                textTransform: "none",
                boxShadow: "0 8px 24px rgba(61, 70, 56, 0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  background: `linear-gradient(135deg, ${sageGreen} 0%, ${sageGreenDark} 100%)`,
                  boxShadow: "0 12px 32px rgba(61, 70, 56, 0.42)",
                  transform: "translateY(-2px)",
                  "& .MuiButton-endIcon": { transform: "translateX(4px)" },
                },
                "&:active": { transform: "translateY(0) scale(0.99)" },
                "&.Mui-disabled": {
                  background: sageGreenDark,
                  color: cream,
                  opacity: 0.75,
                },
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Box>

        {/* Footer */}
        <Typography
          sx={{
            mt: "clamp(16px, 2.5vh, 24px)",
            px: 2,
            py: 0.75,
            borderRadius: "999px",
            bgcolor: "rgba(0, 0, 0, 0.28)",
            backdropFilter: "blur(8px)",
            color: "rgba(240, 235, 224, 0.85)",
            fontSize: "0.68rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 500,
            textAlign: "center",
            flexShrink: 0,
            animation: "fadeIn 1s ease-out 0.4s both",
          }}
        >
          © {new Date().getFullYear()} Carl Shoe Store
        </Typography>
      </Box>

      {/* Reset dialog */}
      <Dialog
        open={openResetDialog}
        onClose={() => !resetLoading && setOpenResetDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            p: 0.5,
            bgcolor: cream,
            border: "1px solid rgba(79, 93, 71, 0.15)",
            boxShadow: "0 24px 48px rgba(44, 51, 40, 0.2)",
            fontFamily: fontBody,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: textOnLight,
            fontSize: "1.15rem",
            pb: 0.5,
          }}
        >
          Reset password
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2.5, color: textMuted, fontSize: "0.9rem" }}>
            Enter your email and we&apos;ll send you instructions to reset your
            password.
          </DialogContentText>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              reset();
            }}
          >
            <TextField
              inputRef={rsEmail}
              type="email"
              label="Email"
              placeholder="you@carlshoestore.com"
              fullWidth
              InputProps={{ startAdornment: iconAdornment(EmailOutlined) }}
              sx={{ ...inputSx(false), mb: 2 }}
            />
            <DialogActions sx={{ px: 0, gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setOpenResetDialog(false)}
                disabled={resetLoading}
                sx={{
                  borderRadius: "12px",
                  borderColor: "rgba(79, 93, 71, 0.35)",
                  color: sageGreenDark,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: sageGreenDark,
                    bgcolor: "rgba(110, 127, 99, 0.08)",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={resetLoading}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: sageGreenDark,
                  color: cream,
                  boxShadow: "0 4px 16px rgba(61, 70, 56, 0.25)",
                  "&:hover": { bgcolor: sageGreenDeeper },
                }}
              >
                {resetLoading ? (
                  <CircularProgress size={18} sx={{ color: cream }} />
                ) : (
                  "Send link"
                )}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
