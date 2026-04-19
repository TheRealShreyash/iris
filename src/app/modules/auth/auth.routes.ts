import { Router } from "express";
import type { Request, Response } from "express";
import AuthController from "./auth.controller";


const authRouter = Router();

authRouter.get("/certs", AuthController.handleCerts);

authRouter.get("/authenticate", AuthController.handleAuthenticate)

export default authRouter;
