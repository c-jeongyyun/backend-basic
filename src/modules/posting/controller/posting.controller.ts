import { PostingService } from "../service/posting.service";
import { Request, Response } from "express";

import { AppRouter } from "app.router";
import { validatePipe } from "middlewares/validate.pipe";
import { PostingGetByIdParams } from "./interfaces/get/getById.params";
import { PostingGetByIdResp } from "./interfaces/get/getById.resp";
import { authGuard } from "middlewares/auth.guard";
import {
  getCurrentUserPipe,
  RequestWithUserInfo,
} from "middlewares/getCurrentUser.pipe";
import { PostingCreateBody } from "./interfaces/post/create.body";
import { body, param } from "express-validator";
import { PostingUpdateBody } from "./interfaces/patch/update.body";
import { PostingDeleteParams } from "./interfaces/delete/delete.params";
import { PostingUpdateParams } from "./interfaces/patch/update.params";

export const addPostingRoutes = () => {
  const router = AppRouter.getInstance();
  const baseUrl = "/api/postings";

  // auth guard 등록
  router.use(baseUrl, authGuard);

  router.get(
    `${baseUrl}/:id`,
    validatePipe,
    async (
      req: Request<PostingGetByIdParams>,
      res: Response<PostingGetByIdResp>,
      next
    ) => {
      try {
        const postingId = req.params.id;

        const postingService = new PostingService();
        const result = await postingService.getById({ id: postingId });

        // res.send(result);
        res.sendStatus(200);
      } catch (err) {
        return next(err);
      }
    }
  );

  router.post(
    baseUrl,
    body("title").isString().notEmpty(),
    body("content").isString().notEmpty(),
    validatePipe,
    getCurrentUserPipe,
    async (req: RequestWithUserInfo<PostingCreateBody>, res, next) => {
      const postingService = new PostingService();
      await postingService.create({
        userId: req.body.userInfo.id,
        title: req.body.title,
        content: req.body.content,
      });

      res.send(201);
    }
  );

  router.patch(
    `${baseUrl}/:id`,
    param("id").isString().notEmpty(),
    body("title").optional().isString(),
    body("content").optional().isString(),
    validatePipe,
    getCurrentUserPipe,
    async (
      req: RequestWithUserInfo<PostingUpdateParams, PostingUpdateBody>,
      res: Response
    ) => {
      const postingService = new PostingService();
      const body = req.body;
      const params = req.params;
      console.log("body", body);
      await postingService.update({
        content: body.content,
        title: body.title,
        userId: body.userInfo.id,
        id: params.id,
      });

      res.send(200);
    }
  );

  router.delete(
    `${baseUrl}/:id`,
    param("id").isString().notEmpty(),
    validatePipe,
    getCurrentUserPipe,
    async (
      req: RequestWithUserInfo<PostingDeleteParams, undefined>,
      res: Response
    ) => {
      const postingService = new PostingService();
      const body = req.body;
      const params = req.params;

      await postingService.delete({
        id: params.id,
        userId: body.userInfo.id,
      });

      res.send(200);
    }
  );
};
