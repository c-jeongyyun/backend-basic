import { addAuthRoutes } from "modules/auth/auth.controller";
import "dotenv/config";

import express, { NextFunction } from "express";
import { Request, Response } from "express";
import { AppRouter } from "app.router";

import cookieParser from "cookie-parser";
import { addPostingRoutes } from "modules/posting/controller/posting.controller";
import { addCommentRoutes } from "modules/comment/controller/comment.controller";
import { addFileRoutes } from "modules/file/controller/file.controller";

const port = 8080;

const main = async (port: number) => {
  const app = express();
  const router = AppRouter.getInstance();
  app.listen(port, () => {
    console.log(`server listening on port http://localhost:${port}`);
  });

  // TODO Middleware 구조화 필요
  app.use(express.json());

  app.use(cookieParser());

  // TODO 에러처리 이상함. 정상화필요 (첫번째 인자가 err가 아닌듯.. 쨌든 뭔가 이상함)
  // app.use((err: Error, req: Request, res: Response) => {
  //   console.log(err);
  //   throw err;
  // });

  app.get("/", (res, req) => {
    console.log("hello");
    req.send("hello");
  });

  // TODO 구조화할 방법 생각해보기 - addAuthRoutes ->  app.use(router); 순서가 유지되어야 하기 때문
  addAuthRoutes();
  addPostingRoutes();
  addCommentRoutes();
  addFileRoutes();

  app.use(router);

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.sendStatus(500).send("Something broke!");
  });
};

await main(port);
