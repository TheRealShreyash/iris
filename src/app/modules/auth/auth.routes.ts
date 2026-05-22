import { Router } from "express";
import AuthController from "./auth.controller.js";
import validate from "../../common/middlewares/validate.middlware.js";
import {
  emailVerificationModel,
  refreshTokenModel,
  tokenRequestModel,
  userSigninPayloadModel,
  userSignupPayloadModel,
} from "./auth.models.js";
import {
  authenticate,
  restrictToAuthenticatedUser,
} from "../../common/middlewares/authenticate.middleware.js";

const authRouter = Router();

authRouter.get("/certs", AuthController.handleCerts);

authRouter.get("/authenticate", AuthController.handleAuthenticate);
authRouter.get("/authenticate/signup", AuthController.handleAuthenticateSignup);

authRouter.post(
  "/authenticate/sign-in",
  validate(userSigninPayloadModel),
  AuthController.handleSignin,
);

authRouter.post(
  "/authenticate/sign-up",
  validate(userSignupPayloadModel),
  AuthController.handleSignup,
);

authRouter.get("/client-metadata", AuthController.handleGetClientMetadata);

authRouter.post(
  "/logout",
  authenticate(),
  restrictToAuthenticatedUser(),
  AuthController.handleLogout,
);

authRouter.post(
  "/token",
  validate(tokenRequestModel),
  AuthController.handleToken,
);

authRouter.post(
  "/refresh-token",
  validate(refreshTokenModel),
  AuthController.handleRefreshToken,
);

authRouter.get(
  "/userinfo",
  authenticate(),
  restrictToAuthenticatedUser(),
  AuthController.handleUserinfo,
);

authRouter.post(
  "/resend-verification",
  authenticate(),
  restrictToAuthenticatedUser(),
  validate(emailVerificationModel),
  AuthController.handleResendVerificationEmail,
);

authRouter.get("/verify-email", AuthController.handleVerifyEmail);

export default authRouter;
