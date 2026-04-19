import type { Request, Response } from "express";
import ApiResponse from "../../common/utils/api-response";
import { clientExists, getJwks } from "./auth.services";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

class AuthController {
  static async handleCerts(_: Request, res: Response) {
    try {
      const jwks = await getJwks();
      res.status(200).json(jwks);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  static async handleAuthenticate(req: Request, res: Response) {
    try {
      const result = await clientExists(req.query.clientId as string);
      if (result) {
        res.sendFile(`${__dirname}/public/login.html`);
      }
    } catch (error) {
      res.sendFile(`${__dirname}/public/error.html`);
    }
  }
}

export default AuthController;
