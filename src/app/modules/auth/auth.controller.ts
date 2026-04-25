import type { Request, Response } from "express";
import ApiResponse from "../../common/utils/api-response";
import {
  clientExists,
  getClientMetadata,
  getJwks,
  getTokens,
  logout,
  refreshTokens,
  signin,
  signup,
} from "./auth.services";
import { join } from "node:path";
import type { AuthenticatedRequest } from "../../common/utils/interfaces";
import type { RefreshTokenPayload } from "./auth.models";
import ApiError from "../../common/utils/api-error";

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

  static async handleAuthenticateSignup(req: Request, res: Response) {
    try {
      const result = await clientExists(req.query.clientId as string);
      if (result) {
        res.sendFile(join(AuthController.PUBLIC_DIR, "signup.html"));
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

  static async handleSignup(req: Request, res: Response) {
    try {
      const result = await signup(req.body);

      ApiResponse.created(res, "User was created successfully", {
        id: result?.id,
      });
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  static async handleToken(req: Request, res: Response) {
    try {
      const { accessToken, refreshToken } = await getTokens(req.body);

      ApiResponse.ok(res, "Tokens generated", {
        accessToken,
        refreshToken,
      });
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  static async handleRefreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body as RefreshTokenPayload;

      const tokens = await refreshTokens(refreshToken);

      ApiResponse.ok(res, "Tokens refreshed successfully", {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  static async handleUserinfo(req: AuthenticatedRequest, res: Response) {
    try {
      ApiResponse.ok(res, "User fetched successfully", req.user);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  static async handleLogout(req: AuthenticatedRequest, res: Response) {
    try {
      await logout(req.user.sub);

      ApiResponse.ok(res, "Logged out successfully");
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  static async handleGetClientMetadata(req: Request, res: Response) {
    try {
      const { name, applicationUrl } = await getClientMetadata(
        req.query.clientId as any,
      );

      ApiResponse.ok(res, "Client data fetched successfully", {
        name,
        applicationUrl,
      });
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }
}

export default AuthController;
