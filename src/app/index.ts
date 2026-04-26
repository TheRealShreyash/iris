import express from "express";
import ApiResponse from "./common/utils/api-response";
import authRouter from "./modules/auth/auth.routes";
import adminRouter from "./modules/admin/admin.routes";

export function createApplication() {
  const app = express();
  const ISSUER = process.env.ISSUER || "http://localhost:8080";

  app.use(express.json());
  app.use("/auth", authRouter);
  app.use("/admin", adminRouter);

  app.get("/", (_, res) => {
    ApiResponse.ok(res, "Welcome to Iris.");
  });

  app.get("/.well-known/openid-configuration", (_, res) => {
    return res.status(200).json({
      issuer: ISSUER,
      authorization_endpoint: `${ISSUER}/auth/authenticate`,
      token_endpoint: `${ISSUER}/auth/token`,
      userinfo_endpoint: `${ISSUER}/auth/userinfo`,
      jwks_uri: `${ISSUER}/auth/certs`,
      response_types_supported: ["code"],
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["RS256"],
      scopes_supported: ["openid", "profile", "email"],
      claims_supported: [
        "iss",
        "sub",
        "email",
        "emailVerified",
        "family_name",
        "given_name",
        "name",
        "picture",
      ],
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
