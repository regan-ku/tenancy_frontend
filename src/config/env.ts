// Ensure you have a .env.local file in the frontend root with NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

const env = {
  // Backend API Base URL
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",

  // App Environment
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_DEV: process.env.NODE_ENV === "development",

  // Frontend URLs (for redirects)
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

// Freeze the object so it cannot be accidentally modified at runtime
export default Object.freeze(env);
