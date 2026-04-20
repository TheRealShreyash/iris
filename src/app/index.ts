import express from "express";
import ApiResponse from "./common/utils/api-response";
import authRouter from "./modules/auth/auth.routes";
import adminRouter from "./modules/admin/admin.routes";

export function createApplication() {
  const app = express();

  app.use(express.json());
  app.use("/auth", authRouter);
  app.use("/admin", adminRouter);

  app.get("/", (_, res) => {
    ApiResponse.ok(res, "Welcome to Iris.");
  });

  app.get("/.well-known/openid-configuration", (_, res) => {
    return res.status(200).json({
      issuer: process.env.ISSUER || "http://localhost:8080",
      authorization_endpoint:
        `${process.env.ISSUER}/auth/authenticate` ||
        "http://localhost:8080/auth/authenticate",
      token_endpoint:
        `${process.env.ISSUER}/auth/token` ||
        "http://localhost:8080/auth/token",
      userinfo_endpoint:
        `${process.env.ISSUER}/auth/userinfo` ||
        "http://localhost:8080/auth/userinfo",
      jwks_uri:
        `${process.env.ISSUER}/auth/certs` ||
        "http://localhost:8080/auth/certs",
    });
  });

  // temporary code
  // callback url for testing
  app.get("/callback", (req, res) => {
    res.json({
      code: req.query.code,
      state: req.query.state,
    });
  });

  return app;
}
