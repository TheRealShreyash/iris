import type { Request, Response } from "express";
import ApiResponse from "../../common/utils/api-response";
import { clientExists, getJwks, signin } from "./auth.services";
import { join } from "node:path";

class AuthController {
  private static PUBLIC_DIR = join(process.cwd(), "public");
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
        res.sendFile(join(AuthController.PUBLIC_DIR, "login.html"));
      }
    } catch (error) {
      res.sendFile(join(AuthController.PUBLIC_DIR, "error.html"));
    }
  }

  static async handleSignin(req: Request, res: Response) {
    try {
      const { code, redirectUri } = await signin(req.body);

      const url = new URL(redirectUri);
      url.searchParams.append("code", code);

      if (req.body.state) {
        url.searchParams.append("state", req.body.state);
      }

      res.redirect(url.toString());
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }
}

export default AuthController;
