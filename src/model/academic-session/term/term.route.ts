import express from "express";
import { sanitizeBodyMiddleware, validate } from "@/middleware/validation.js";
import { protect } from "@/middleware/protection.js";
import { termController } from "./term.controller.js";
import {
  createTermReqSchema,
  termListReqSchema,
  termIdReqSchema,
  updateTermReqSchema,
} from "./term.schema.js";

const termRouter = express.Router({ mergeParams: true });
termRouter.use(protect);
termRouter.get("/", validate(termListReqSchema), termController.getTerms);
termRouter.post(
  "/",
  sanitizeBodyMiddleware,
  validate(createTermReqSchema),
  termController.createTerm,
);
termRouter.get("/:termId", validate(termIdReqSchema), termController.getTerm);
termRouter.post(
  "/:termId/activate",
  validate(termIdReqSchema),
  termController.activateTerm,
);
termRouter.patch(
  "/:termId",
  sanitizeBodyMiddleware,
  validate(updateTermReqSchema),
  termController.updateTerm,
);
termRouter.delete(
  "/:termId",
  validate(termIdReqSchema),
  termController.deleteTerm,
);

export default termRouter;
