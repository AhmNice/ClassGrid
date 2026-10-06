import { registry } from "@/docs/registry.js";
import { CreateUserSchema, userSchema } from "./auth.schema.js";

registry.registerPath({
  method: "post",
  path: "/api/v1/register",
  tags: ["Authentication"],
  description: "Register a new user",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: CreateUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User created successfully",
      content: {
        "application/json": {
          schema: userSchema,
        },
      },
    },
  },
});
