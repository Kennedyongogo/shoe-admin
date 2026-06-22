import SvgIcon from "@mui/material/SvgIcon";

/** Sneaker icon — Material Icons has no dedicated shoe glyph. */
export default function ShoeIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M13.5 5.5c1.09 0 2 .91 2 2s-.91 2-2 2-2-.91-2-2 .91-2 2-2zm4 5L20 11v4h-2v-2.5l-1-.35V14H7v-1.85l-1 .35V15H4v-4l2.5-.5c.83-1.67 2.63-3 4.79-3.35L13.5 4h2l2.21 3.15c2.16.35 3.96 1.68 4.79 3.35zM12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
    </SvgIcon>
  );
}
