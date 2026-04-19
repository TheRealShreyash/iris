import { Router } from "express";
import AuthController from "./auth.controller";

const authRouter = Router();

authRouter.get("/certs", AuthController.handleCerts);

export default authRouter;
