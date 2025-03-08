import { CustomValidationError } from "errors/validation.error";
import {
  Handler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { validationResult } from "express-validator";

export const validatePipe = async (
  req: Request<unknown>,
  res: Response,
  next: NextFunction
) => {
  const validationErrors = validationResult(req as Request);
  try {
    if (!validationErrors.isEmpty()) {
      throw new CustomValidationError(validationErrors);
    } else {
      return next();
    }
  } catch (err) {
    return next(err);
  }
};
