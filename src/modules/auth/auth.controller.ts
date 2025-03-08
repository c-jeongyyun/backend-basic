import { AuthService } from "./auth.service";
import { Request, Response, Router } from "express";
import { LoginPayload, LoginResp } from "./interfaces/login.interface";
import { SignUpPayload } from "./interfaces/signUp.interface";
import { RefreshPayload, RefreshResp } from "./interfaces/refresh.interface";
import { AppRouter } from "app.router";
import { body } from "express-validator";
import { validatePipe } from "middlewares/validate.pipe";

export const addAuthRoutes = () => {
  const router = AppRouter.getInstance();

  router.post(
    "/api/auth/login",
    body("userId").isString().notEmpty(),
    body("password").isString().notEmpty(),
    validatePipe,
    async (req: Request<LoginPayload>, res: Response<LoginResp>, next) => {
      try {
        const authService = new AuthService();
        const result = await authService.login(
          req.body.userId,
          req.body.password
        );

        res.cookie("accessToken", result.accessToken, {
          httpOnly: true,
          secure: true,
        });

        res.cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: true,
        });

        res.sendStatus(200);
      } catch (err) {
        console.log(err);
        return next(err);
      }
    }
  );

  router.post(
    "/api/auth/sign-up",
    body("userId").isString().notEmpty(),
    body("password").isString().notEmpty(),
    validatePipe,
    async (req: Request<SignUpPayload>, res: Response<boolean>) => {
      const authService = new AuthService();

      const result = await authService.signUp(
        req.body.userId,
        req.body.password
      );

      res.send(result);
    }
  );

  // TODO cookie로 받고 주도록 변경
  router.post(
    "/api/auth/refresh",
    validatePipe,
    async (req: Request<void>, res: Response<RefreshResp>) => {
      const refreshToken: string = req.cookies.refreshToken;
      const authService = new AuthService();
      const result = await authService.reissueAccessToken(refreshToken);

      res.cookie("accessToken", result);
      res.sendStatus(200);
    }
  );
};
