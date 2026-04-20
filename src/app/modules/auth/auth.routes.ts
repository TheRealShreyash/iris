import { Router } from "express";
import type { Request, Response } from "express";
import AuthController from "./auth.controller";
import validate from "../../common/middlewares/validate.middlware";
import { tokenRequestModel, userSigninPayloadModel } from "./auth.models";
import {
  authenticate,
  restrictToAuthenticatedUser,
} from "../../common/middlewares/authenticate.middleware";

const authRouter = Router();

authRouter.get("/certs", AuthController.handleCerts);

authRouter.get("/authenticate", AuthController.handleAuthenticate);

authRouter.post(
  "/authenticate/sign-in",
  validate(userSigninPayloadModel),
  AuthController.handleSignin,
);

authRouter.post(
  "/token",
  validate(tokenRequestModel),
  AuthController.handleToken,
);

authRouter.get(
  "/userinfo",
  authenticate(),
  restrictToAuthenticatedUser(),
  AuthController.handleUserinfo,
);

export default authRouter;
