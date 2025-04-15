import fs from "fs/promises";
import { FileDao } from "../dao/file.dao";

export class FileService {
  private readonly fileDao: FileDao;
  constructor() {
    this.fileDao = new FileDao();
  }

  async getById(params: GetByIdParams): Promise<GetByIdResult> {
    return this.fileDao.getById(params);
  }

  async create(params: CreateParams) {
    await this.fileDao.create({
      postingId: params.postingId,
      files: params.files,
    });
  }

  async delete(params: DeleteParams) {
    const file = await this.fileDao.getById({ id: params.id });
    if (!file) {
      throw new Error("File not found");
    }

    try {
      await this.fileDao.delete(params);
      await fs.unlink(file.url);
    } catch (err) {
      console.error("File deletion failed", err);
      throw new Error("File deletion failed");
    }
  }
}

type GetByIdParams = { id: string };
type GetByIdResult = {
  id: string;
  postingId: string;
  url: string;
  filename: string;
  mimetype: string;
  fileSize: number;
  uploadAt: Date;
};

type CreateParams = {
  postingId: string;
  files: {
    url: string;
    filename: string;
    fileSize: number;
    mimetype: string;
  }[];
};
type DeleteParams = { id: string; postingId: string; userId: string };
