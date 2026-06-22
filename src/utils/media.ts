// frontend/src/utils/media.ts
import env from "@/config/env"; // Adjust path if your env file is located elsewhere

/**
 * Converts a relative Django media URL into a full absolute URL.
 */
export const getMediaUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;

  // If it's already a full URL (e.g., http://... or https://...), return it as is
  if (path.startsWith("http")) return path;

  try {
    // Extracts 'http://localhost:8000' from 'http://localhost:8000/api/v1'
    const apiUrl = new URL(env.API_URL);
    return `${apiUrl.origin}${path}`;
  } catch (error) {
    // Fallback in case env.API_URL is not a valid full URL
    return `http://localhost:8000${path}`;
  }
};
