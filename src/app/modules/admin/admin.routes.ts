import { Router } from "express";
import type { Request, Response } from "express";
import { join } from "node:path";
import AdminController from "./admin.controller.js";
import validate from "../../common/middlewares/validate.middlware.js";
import { clientRegisterPayloadModel } from "./admin.models.js";

const PUBLIC_DIR = join(process.cwd(), "public");

const adminRouter = Router();

adminRouter.get("/register", (_: Request, res: Response) => {
  res.sendFile(join(PUBLIC_DIR, "register-client.html"));
});

adminRouter.post(
  "/register-client",
  validate(clientRegisterPayloadModel),
  AdminController.handleRegisterClient,
);

export default adminRouter;
