export type CommentEntity = {
  id: string;
  content: string;
  user: {
    id: string;
    userId: string;
  };
  createdAt: Date;
  updatedAt: Date;
  postingId: string;
  parentId: string | undefined;
};
