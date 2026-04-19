import type { Request, Response } from "express";
import ApiResponse from "../../common/utils/api-response";
import { getJwks } from "./auth.services";

class AuthController {
  static async handleCerts(_: Request, res: Response) {
    try {
      const jwks = await getJwks();
      res.status(200).json(jwks);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }
}

export default AuthController;
