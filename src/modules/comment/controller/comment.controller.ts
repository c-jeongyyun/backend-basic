import { CommentService } from "../service/comment.service";
import { Request, Response } from "express";

import { AppRouter } from "app.router";
import { validatePipe } from "middlewares/validate.pipe";
import { GetReplyCommentsParams } from "./interfaces/get/getReplyComments.params";
import { GetReplyCommentsResp } from "./interfaces/get/getReplyComments.resp";
import { authGuard } from "middlewares/auth.guard";
import {
  getCurrentUserPipe,
  RequestWithUserInfo,
} from "middlewares/getCurrentUser.pipe";
import { CreateCommentBody } from "./interfaces/post/create.body";
import { body, param } from "express-validator";
import { UpdateCommentBody } from "./interfaces/patch/update.body";
import { DeleteCommentParams } from "./interfaces/delete/delete.params";
import { UpdateCommentParams } from "./interfaces/patch/update.params";
import { GetCommentsParams } from "./interfaces/get/getComments.params";
import { GetCommentsResp } from "./interfaces/get/getComments.resp";

export const addCommentRoutes = () => {
  const router = AppRouter.getInstance();
  const baseUrl = "/api/comments";

  // auth guard 등록
  router.use(baseUrl, authGuard);

  router.get(
    `${baseUrl}/:postingId`,
    param("postingId").isString(),
    validatePipe,
    async (
      req: Request<GetCommentsParams>,
      res: Response<GetCommentsResp>,
      next
    ) => {
      try {
        const postingId = req.params.postingId;

        const commentService = new CommentService();
        const result = await commentService.getComments({
          postingId: postingId,
        });

        res.send({ comments: result });
      } catch (err) {
        return next(err);
      }
    }
  );

  router.get(
    `${baseUrl}/replies/:parentId`,
    validatePipe,
    param("parentId").isString(),
    async (
      req: Request<GetReplyCommentsParams>,
      res: Response<GetReplyCommentsResp>,
      next
    ) => {
      try {
        const parentId = req.params.parentId;

        const commentService = new CommentService();
        const result = await commentService.getReplyComments({
          parentId,
        });

        res.send({ comments: result });
      } catch (err) {
        return next(err);
      }
    }
  );

  router.post(
    baseUrl,
    body("content").isString().notEmpty(),
    body("postingId").isString().notEmpty(),
    validatePipe,
    getCurrentUserPipe,
    async (req: RequestWithUserInfo<CreateCommentBody>, res, next) => {
      const commentService = new CommentService();
      await commentService.create({
        userId: req.body.userInfo.id,
        postingId: req.body.postingId,
        parentId: req.body.parentId,
        content: req.body.content,
      });

      res.send(201);
    }
  );

  router.patch(
    `${baseUrl}/:id`,
    param("id").isString().notEmpty(),
    body("content").optional().isString(),
    validatePipe,
    getCurrentUserPipe,
    async (
      req: RequestWithUserInfo<UpdateCommentParams, UpdateCommentBody>,
      res: Response
    ) => {
      const commentService = new CommentService();
      const body = req.body;
      const params = req.params;

      await commentService.update({
        content: body.content,
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
      req: RequestWithUserInfo<DeleteCommentParams, undefined>,
      res: Response
    ) => {
      const commentService = new CommentService();
      const body = req.body;
      const params = req.params;

      await commentService.delete({
        id: params.id,
        userId: body.userInfo.id,
        postingId: body.postingId,
      });

      res.send(200);
    }
  );
};
