import express from "express";
import config from "./config/config.js";
import cors from "cors";
import morgan from "morgan";
import helmetMiddleware from "./utils/helmet.js";
import { errorHandler } from "./utils/errorHandler.js";
import cookieParser from "cookie-parser";
import router from "./routes/index.route.js";
import { swaggerMiddleware } from "./docs/swagger.js";
const app = express();

app.use(morgan("dev"));

const origin = config.CORS_ORIGIN || "http://localhost:3000";
const allowedOrigins = [
  origin,
  "http://localhost:5173",
  "http://localhost:3000",
];
app.use(helmetMiddleware);
app.use(
  cors({
    origin: function (requestOrigin, callback) {
      if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
      } else {
        console.log(`Origin ${requestOrigin} not allowed by CORS`);
        callback(new Error(`Origin ${requestOrigin} not allowed by CORS`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Request-Id",
      "X-Idempotency-Key",
    ],
    credentials: true,
  }),
);
app.use(
  express.json({
    verify: (req, res, buf) => {
      (req as any).rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1", router);
app.use("/api-docs", ...swaggerMiddleware);
app.use(errorHandler);

export default app;
