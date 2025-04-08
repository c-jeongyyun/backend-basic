import { CommentDto } from "modules/comment/dto/comment.dto";

export type PostingDto = {
  id: string;
  title: string;
  content: string;
  writerId: string;
  createdAt: Date;
  updatedAt: Date;
};
