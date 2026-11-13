import { ApiError } from "../utils/errorHandler.js";
import sanitizeHtml from "sanitize-html";
import { ZodError } from "zod";
export const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                // files: req.files,
                // file: req.file,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const errors = error.issues.map((err) => ({
                    field: err.path.join("."),
                    message: err.message,
                }));
                next(new ApiError(422, "Validation Error", errors));
            }
            else {
                next(error);
            }
        }
    };
};
export const sanitizeBodyMiddleware = (req, _res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method) || req.body == null) {
        next();
        return;
    }
    req.body = sanitizeValue(req.body);
    next();
};
const BLOCKED_PROTOCOL = /^\s*(javascript|data|vbscript|file):/i;
function sanitizeValue(value, path = "body") {
    if (typeof value === "string") {
        const cleaned = sanitizeHtml(value.trim(), {
            allowedTags: [],
            allowedAttributes: {},
            disallowedTagsMode: "discard",
        });
        if (BLOCKED_PROTOCOL.test(cleaned)) {
            console.warn(`Blocked suspicious protocol in field ${path}: ${cleaned}`);
            return "";
        }
        return cleaned;
    }
    if (Array.isArray(value)) {
        return value.map((item, index) => sanitizeValue(item, `${path}[${index}]`));
    }
    if (value !== null && typeof value === "object") {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [
            key,
            sanitizeValue(item, `${path}.${key}`),
        ]));
    }
    return value;
}
