import { ApiError } from "./errorHandler.js";

/**
 * Recursively normalizes objects or arrays:
 * - Trims strings and rejects blank strings.
 * - Drops undefined values.
 * - Preserves arrays as arrays and maps normalization over their items.
 */
export function normalize<T>(data: T): T {
  if (data === null || typeof data !== "object") {
    return data;
  }

  // If it's an array, map normalization recursively over each element
  if (Array.isArray(data)) {
    return data.map((item) => normalize(item)) as unknown as T;
  }

  // Otherwise, handle as a plain object
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed === "") {
        throw new ApiError(422, `${key} cannot be empty`);
      }
      out[key] = trimmed;
    } else if (typeof value === "object" && value !== null) {
      out[key] = normalize(value);
    } else {
      out[key] = value;
    }
  }

  return out as T;
}