import { Router } from "express";
import type { Request, Response } from "express";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import AdminController from "./admin.controller";
import validate from "../../common/middlewares/validate.middlware";
import { clientRegisterPayloadModel } from "./admin.models";

const __dirname = dirname(fileURLToPath(import.meta.url));

const adminRouter = Router();

adminRouter.get("/register", (_: Request, res: Response) => {
  res.sendFile(`${__dirname}/public/register-client.html`);
});

adminRouter.post(
  "/register-client",
  validate(clientRegisterPayloadModel),
  AdminController.handleRegisterClient,
);

export default adminRouter;
