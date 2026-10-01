// Phone layout starts below Tailwind's `sm` breakpoint
export const mobileQuery = () => window.matchMedia("(max-width: 639px)");

export const isMobile = () => mobileQuery().matches;
