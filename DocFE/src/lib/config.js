export const config = {
  links: {
    home: import.meta.env.VITE_HOME_LINK || "/",
    dashboard: import.meta.env.VITE_DASHBOARD_LINK || "/dashboard",
    features: import.meta.env.VITE_FEATURES_LINK || "#features",
    howItWorks: import.meta.env.VITE_HOW_IT_WORKS_LINK || "#how-it-works",
    security: import.meta.env.VITE_SECURITY_LINK || "#security",
    demo: import.meta.env.VITE_DEMO_LINK || "#demo",
    signup: import.meta.env.VITE_SIGNUP_LINK || "/signup",
    signin: import.meta.env.VITE_SIGNIN_LINK || "/login",
  },
  images: {
    heroBg: "/images/landing.jpg",
    featuresBg: "/images/Features.jpg",
    howItWorksBg: "/images/howit.jpg",
    securityBg: "/images/security.jpg",
    dashboardBg: "/images/dashboard.jpg",
  },
};