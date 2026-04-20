import ApiResponse from "../../common/utils/api-response";
import type { Request, Response } from "express";
import { registerClient } from "./admin.services";

class AdminController {
  static async handleRegisterClient(req: Request, res: Response) {
    try {
      const result = await registerClient(req.body);
      ApiResponse.ok(res, "Client registered successfully", {
        clientId: result?.clientId,
        clientSecret: result?.clientSecret,
      });
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }
}

export default AdminController;
