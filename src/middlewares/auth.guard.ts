import jwt from "jsonwebtoken";
import { Handler, NextFunction, Request, Response } from "express";
import createError from "http-errors";

// 인증 guard - 해당 서버가 인증한 사용자인지만 검사한다.
export const authGuard: Handler = (
  req: Request<unknown>,
  res: Response,
  next: NextFunction
) => {
  // 1. 쿠키 접근
  const accessToken: string = req.cookies?.accessToken;

  if (!accessToken || typeof accessToken !== "string") {
    // unauthorized 에러
    return next(createError(401));
  }

  // 2. access token 검증
  try {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!);
    next();
  } catch (err) {
    return next(createError(401));
  }
};
