import { CommentDao } from "../dao/comment.dao";
import {
  CommentDto,
  CreateParamsDto,
  DeleteParamsDto,
  GetCommentsParamsDto,
  GetReplyCommentsParamsDto,
  UpdateParamsDto,
} from "../dto/comment.dto";

export class CommentService {
  private readonly commentDao: CommentDao;

  constructor() {
    this.commentDao = new CommentDao();
  }

  async getComments(params: GetCommentsParamsDto): Promise<CommentDto[]> {
    const result = await this.commentDao.getByPostingId(params);
    return result.map((result) => ({
      id: result.id,
      writerId: result.user.userId,
      content: result.content,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    }));
  }

  async getReplyComments(
    params: GetReplyCommentsParamsDto
  ): Promise<CommentDto[]> {
    const result = await this.commentDao.getByParentId(params);
    return result.map((result) => ({
      id: result.id,
      writerId: result.user.userId,
      content: result.content,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    }));
  }

  async create(params: CreateParamsDto) {
    await this.commentDao.create(params);
  }

  async update(params: UpdateParamsDto) {
    await this.commentDao.update(params);
  }

  async delete(params: DeleteParamsDto) {
    await this.commentDao.delete(params);
  }
}
