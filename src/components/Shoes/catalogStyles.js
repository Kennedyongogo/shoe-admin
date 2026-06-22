import { alpha } from "@mui/material";
import {
  sageGreen,
  sageGreenDark,
  cream,
  textMuted,
  fontBody,
} from "../../constants/brandColors";

export const fieldSx = {
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

export const primaryButtonSx = {
  borderRadius: "14px",
  py: 1.25,
  px: 2.5,
  fontWeight: 700,
  textTransform: "none",
  fontFamily: fontBody,
};

export const cardShellSx = {
  borderRadius: "20px",
  overflow: "hidden",
  bgcolor: "#fff",
  border: `1px solid ${alpha(sageGreenDark, 0.1)}`,
  boxShadow: `0 8px 28px ${alpha(sageGreenDark, 0.07)}`,
  transition: "all 0.25s ease",
  display: "flex",
  flexDirection: "column",
  height: "100%",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 16px 40px ${alpha(sageGreenDark, 0.12)}`,
  },
};
