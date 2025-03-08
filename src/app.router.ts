import express, { Router } from "express";

export class AppRouter {
  private static router: Router;
  private constructor() {}

  static getInstance() {
    if (!AppRouter.router) {
      AppRouter.router = express.Router();
    }
    return AppRouter.router;
  }
}
