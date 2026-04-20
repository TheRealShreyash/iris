import { Router } from "express";
import type { Request, Response } from "express";
import AuthController from "./auth.controller";
import validate from "../../common/middlewares/validate.middlware";
import { userSigninPayloadModel } from "./auth.models";


const authRouter = Router();

authRouter.get("/certs", AuthController.handleCerts);

authRouter.get("/authenticate", AuthController.handleAuthenticate)

authRouter.post("/authenticate/sign-in", validate(userSigninPayloadModel), AuthController.handleSignin)

export default authRouter;
