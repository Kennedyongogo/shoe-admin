import { Box, Typography, Stack, alpha } from "@mui/material";
import { StorefrontOutlined, SettingsOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
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

const QuickCard = ({ title, description, icon, onClick, accent }) => (
  <Box
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === "Enter" && onClick()}
    sx={{
      p: { xs: 2.5, sm: 3 },
      borderRadius: "20px",
      bgcolor: "#fff",
      border: `1px solid ${alpha(sageGreenDark, 0.1)}`,
      boxShadow: `0 8px 32px ${alpha(sageGreenDeeper, 0.06)}`,
      cursor: "pointer",
      transition: "all 0.25s ease",
      "&:hover": {
        transform: "translateY(-3px)",
        boxShadow: `0 14px 40px ${alpha(sageGreenDeeper, 0.12)}`,
        borderColor: alpha(accent, 0.35),
      },
    }}
  >
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: alpha(accent, 0.12),
        color: accent,
        mb: 2,
      }}
    >
      {icon}
    </Box>
    <Typography sx={{ fontWeight: 800, color: textOnLight, fontSize: "1.05rem", mb: 0.5 }}>
      {title}
    </Typography>
    <Typography sx={{ color: textMuted, fontSize: "0.88rem", lineHeight: 1.5 }}>
      {description}
    </Typography>
  </Box>
);

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const firstName = user?.full_name?.split(" ")?.[0] || "there";

  return (
    <Box sx={{ fontFamily: fontBody, maxWidth: 960, mx: "auto", width: "100%" }}>
      <Box
        sx={{
          mb: { xs: 3, md: 4 },
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: "24px",
          background: `linear-gradient(135deg, ${sageGreenDark} 0%, ${sageGreenDeeper} 100%)`,
          color: cream,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            bgcolor: alpha("#fff", 0.06),
          }}
        />
        <Typography
          sx={{
            fontFamily: fontDisplay,
            fontWeight: 700,
            fontSize: { xs: "1.65rem", sm: "2rem" },
            lineHeight: 1.2,
            position: "relative",
          }}
        >
          Welcome back, {firstName}
        </Typography>
        <Typography
          sx={{
            mt: 1,
            opacity: 0.88,
            fontSize: { xs: "0.9rem", sm: "1rem" },
            maxWidth: 480,
            position: "relative",
          }}
        >
          Carl Shoe Store admin — manage your store from one place.
        </Typography>
      </Box>

      <Stack spacing={2}>
        <Typography sx={{ fontWeight: 700, color: textOnLight, fontSize: "0.95rem" }}>
          Quick actions
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: { xs: 2, sm: 2.5 },
          }}
        >
          <QuickCard
            title="Store overview"
            description="Dashboard and analytics will live here as you build out the admin portal."
            icon={<StorefrontOutlined />}
            accent={sageGreen}
            onClick={() => {}}
          />
          <QuickCard
            title="Account settings"
            description="Update your profile, photo, and password."
            icon={<SettingsOutlined />}
            accent={accentOrange}
            onClick={() => navigate("/settings")}
          />
        </Box>
      </Stack>
    </Box>
  );
}
