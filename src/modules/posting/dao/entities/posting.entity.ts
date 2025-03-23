import { CommentEntity } from "modules/comment/entity/comment.entity";

export type PostingEntity = {
  id: string;
  title: string;
  content: string;
  writerId: string;
  createdAt: Date;
  updatedAt: Date;
  comments: CommentEntity[];
  //   files:File[]
};
