import express from "express";
import ApiResponse from "./common/utils/api-response";

export function createApplication() {
  const app = express();

  app.use(express.json());

  app.get("/", (_, res) => {
    ApiResponse.ok(res, "Welcome to iris.");
  });

  app.get("/.well-known/openid-configuration", (_, res) => {
    return res.status(200).json({
      issuer: process.env.AUTH_BASE_URL || "http://localhost:8080",
      authorization_endpoint:
        `${process.env.AUTH_BASE_URL}/auth/login` ||
        "http://localhost:8080/auth/login",
      jwks_uri:
        `${process.env.AUTH_BASE_URL}/certs` ||
        "http://localhost:8080/auth/certs",
    });
  });

  return app;
}
