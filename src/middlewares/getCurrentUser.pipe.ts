import { NextFunction, Request, Response } from "express";
import { AuthService } from "modules/auth/auth.service";
import { UserDto } from "modules/user/dto/user.dto";

export type RequestWithUserInfo<
  Params = Record<string, string>,
  Req = any
> = Request<
  Params,
  {
    userInfo: UserDto;
  } & Req
>;

export const getCurrentUserPipe = async (
  req: RequestWithUserInfo<unknown>,
  res: Response,
  next: NextFunction
  // ): Promise<UserDto> => {
) => {
  const accessToken = req.cookies.accessToken;

  const authService = new AuthService();
  const userInfo = await authService.verifyAccessToken(accessToken);

  req.body.userInfo = userInfo;
  return next();
};
