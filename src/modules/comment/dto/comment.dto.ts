export type CommentDto = {
  id: string;
  writerId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  comments: CommentDto[];
};
