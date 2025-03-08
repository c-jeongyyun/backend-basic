import { Result, ValidationError } from "express-validator";

export class CustomValidationError extends Error {
  name: string;

  constructor(errors: Result<ValidationError>) {
    const message = errors.array().reduce((msg, error) => {
      if (error.type === "field") {
        msg += `${error.type}(${error.path}): ${error.msg}\n`;
      } else {
        msg += `${error.type}: ${error.msg}\n`;
      }
      return msg;
    }, "");
    super(message);
    this.name = this.constructor.name;
  }
}
