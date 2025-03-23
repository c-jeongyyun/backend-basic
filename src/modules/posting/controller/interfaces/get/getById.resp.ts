import { PostingGetByIdRespComment } from "./getByIdRespComment";

export interface PostingGetByIdResp {
  id: string;
  title: string;
  content: string;
  writerId: string;
  createdAt: Date;
  updatedAt: Date;
  comments: PostingGetByIdRespComment[];
}
