import { ApiError } from "./errorHandler.js";
/** Takes an object and trims strings, drops undefined, rejects blank strings, keeps null and non-strings. */
export function normalize<T extends object>(data: T): Partial<T> {
  if (typeof data !== "object" || data === null) {
    throw new ApiError(400, "Input must be a non-null object");
  }
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed === "") {
        throw new ApiError(422, `${key} cannot be empty`);
      }
      out[key] = trimmed;
    } else {
      out[key] = value;
    }
  }
  return out as Partial<T>;
}
