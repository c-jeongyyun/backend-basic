import { FileService } from "../service/file.service";
import { Request, Response } from "express";
import fsPromises from "fs/promises";
import fs from "fs";
import { AppRouter } from "app.router";
import { validatePipe } from "middlewares/validate.pipe";
import { FileGetByIdParams } from "./interfaces/get/getById.params";
import { FileGetByIdResp } from "./interfaces/get/getById.resp";
import { authGuard } from "middlewares/auth.guard";
import {
  getCurrentUserPipe,
  RequestWithUserInfo,
} from "middlewares/getCurrentUser.pipe";

import { body, param } from "express-validator";
import { FileDeleteParams } from "./interfaces/delete/delete.params";
import { FileDeleteBody } from "./interfaces/delete/delete.body";
import multer from "multer";

export const addFileRoutes = () => {
  const router = AppRouter.getInstance();
  const baseUrl = "/api/files";
  const upload = multer({ dest: "uploads/" });

  // auth guard 등록
  router.use(baseUrl, authGuard);

  // TODO 스트리밍으로 다운 받아야 함
  router.get(
    `${baseUrl}/:id`,
    validatePipe,
    async (
      req: Request<FileGetByIdParams>,
      res: Response<FileGetByIdResp>,
      next
    ) => {
      try {
        const fileId = req.params.id;

        const fileService = new FileService();
        const result = await fileService.getById({ id: fileId });

        const readableStream = fs.createReadStream(result.url, {
          highWaterMark: 1024 * 1024,
        }); // 1MB});
        res.setHeader("Content-Type", result.mimetype);
        readableStream.pipe(res);

        // res.sendStatus(200);
      } catch (err) {
        return next(err);
      }
    }
  );

  router.post(
    baseUrl,
    upload.array("files", 5), // 5개까지 업로드 가능
    body("postingId").isString().notEmpty(),
    validatePipe,
    getCurrentUserPipe,
    async (req: any, res, next) => {
      console.log("req.files", req.files);
      console.log("req.body", req.body);
      const uploadedFiles: Express.Multer.File[] = req.files;

      try {
        const fileService = new FileService();

        await fileService.create({
          postingId: req.body.postingId,
          files: req.files.map((file: any) => ({
            url: file.path,
            filename: file.originalname,
            mimetype: file.mimetype,
            fileSize: file.size,
          })),
        });

        res.sendStatus(201);
      } catch (err) {
        // 파일업로드 실패 시 upload된 파일 삭제
        if (uploadedFiles) {
          await Promise.all(
            uploadedFiles.map((file) =>
              fsPromises.unlink(file.path).catch((e) => {
                console.error(`파일 삭제 실패: ${file.path}`, e);
              })
            )
          );
        }
        return next(err);
      }
    }
  );

  router.delete(
    `${baseUrl}/:id`,
    param("id").isString().notEmpty(),
    body("postingId").isString().notEmpty(),
    validatePipe,
    getCurrentUserPipe,
    async (
      req: RequestWithUserInfo<FileDeleteParams, FileDeleteBody>,
      res: Response
    ) => {
      const fileService = new FileService();
      const body = req.body;
      const params = req.params;

      await fileService.delete({
        id: params.id,
        postingId: body.postingId,
        userId: body.userInfo.id,
      });

      res.send(200);
    }
  );
};
