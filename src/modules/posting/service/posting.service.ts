import { PostingDto } from "./dtos/posting.dto";
import { PostingDao } from "../dao/posting.dao";

export class PostingService {
  private readonly postingDao: PostingDao;

  constructor() {
    this.postingDao = new PostingDao();
  }

  async getById(params: GetByIdParams): Promise<PostingDto> {
    const result = await this.postingDao.getById(params);
    return {
      id: result.id,
      title: result.title,
      content: result.content,
      writerId: result.user.userId,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  async getPage() {
    // await this.postingDao.getPage();
  }

  async create(params: CreateParams) {
    await this.postingDao.create(params);
  }

  async update(params: UpdateParams) {
    // TODO 원래는 여기서 권한 검사해줘야함... 지금은 저장할 때 userId, postingId 일치하는 것 찾도록 야매처리 함
    await this.postingDao.update(params);
  }

  async delete(params: DeleteParams) {
    // TODO 원래는 여기서 권한 검사해줘야함... 지금은 저장할 때 userId, postingId 일치하는 것 찾도록 야매처리 함
    await this.postingDao.delete(params);
  }
}

export type GetByIdParams = { id: string };

export type CreateParams = {
  title: string;
  content: string;
  userId: string;
};

export type UpdateParams = {
  id: string;
  userId: string;
  title: string | undefined;
  content: string | undefined;
};

export type DeleteParams = {
  id: string;
  userId: string;
};
