import type { Config } from "tailwindcss";

/**
 * Design tokens extracted from the uploaded design source:
 * theevent-1.0.0 (TheEvent, BootstrapMade) — assets/css/main.css
 * Colors, fonts, radii and shadows below map 1:1 to the source.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#ffffff", // --background-color
        ink: "#2f3138", // --default-color
        heading: "#0e1b4d", // --heading-color
        accent: "#f82249", // --accent-color
        surface: "#ffffff", // --surface-color
        contrast: "#ffffff", // --contrast-color
        light: "#f2f2f3", // .light-background
        dark: "#000820", // .dark-background
        "dark-surface": "#001553", // .dark-background surface
        "scrolled-nav": "rgba(1, 8, 33, 0.82)",
        success: "#059652",
        danger: "#df1529",
      },
      fontFamily: {
        sans: ["Roboto", "system-ui", "-apple-system", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["Raleway", "sans-serif"], // headings + nav (Raleway)
      },
      borderRadius: {
        pill: "50px", // source CTA button radius
      },
      boxShadow: {
        card: "0 3px 20px -2px rgba(0, 0, 0, 0.1)", // source .pricing-item shadow
        "card-hover": "0 18px 40px -12px rgba(14, 27, 77, 0.22)",
        dropdown: "0px 0px 30px rgba(0, 0, 0, 0.1)",
        "scrolled-nav": "0px 0 18px rgba(0, 0, 0, 0.1)",
      },
      maxWidth: {
        wrap: "1200px", // source Bootstrap container
      },
    },
  },
  plugins: [],
};
export default config;
