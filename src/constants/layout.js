export const MOBILE_BOTTOM_NAV_HEIGHT = 72;

/** Space below scrollable main content on mobile (nav height + safe area + breathing room). */
export const mobileMainPaddingBottom = `calc(${MOBILE_BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px) + 32px)`;
