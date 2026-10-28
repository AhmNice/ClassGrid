import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/errorHandler.js";
import sanitizeHtml from "sanitize-html";
import { ZodError } from "zod";

export const validate = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        // files: req.files,
        // file: req.file,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = (error as any).issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        next(new ApiError(422, "Validation Error", errors));
      } else {
        next(error);
      }
    }
  };
};

export const sanitizeBodyMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.body) {
    // The only schemes we actively want to nuke.
    const BLOCKED_PROTOCOL = /^\s*(javascript|data|vbscript|file):/i;

    Object.keys(req.body).forEach((key) => {
      const value = req.body[key];
      if (typeof value !== "string") return;

      const cleaned = sanitizeHtml(value.trim(), {
        allowedTags: [],
        allowedAttributes: {},
        disallowedTagsMode: "discard",
      });

      if (BLOCKED_PROTOCOL.test(cleaned)) {
        console.warn(`Blocked suspicious protocol in field ${key}: ${cleaned}`);
        req.body[key] = "";
        return;
      }

      req.body[key] = cleaned;
    });
  }
  next();
};
