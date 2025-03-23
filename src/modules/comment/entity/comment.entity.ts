export type CommentEntity = {
  id: string;
  writerId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  parentId?: string;
  comments: CommentEntity[];
};
