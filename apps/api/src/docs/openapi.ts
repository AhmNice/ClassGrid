import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./registry.js";
import "@/model/authentication/auth.docs.js";
import config from "@/config/config.js";
const generator = new OpenApiGeneratorV3(registry.definitions);
export const openApiDocument = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "ClassGrid API",
    version: "1.0.0",
    description: "API documentation for ClassGrid",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ],
  tags: [
    {
      name: "Authentication",
      description: "Endpoints related to user authentication and management",
    },
  ],
});

openApiDocument.components = {
  ...(openApiDocument.components ?? {}),
  securitySchemes: {
    ...(openApiDocument.components?.securitySchemes ?? {}),
    bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    cookieAuth: {
      type: "apiKey",
      in: "cookie",
      name: config.ACCESS_TOKEN_NAME,
    },
  },
};
