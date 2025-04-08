export type CommentDto = {
  id: string;
  writerId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateParamsDto = {
  userId: string;
  content: string;
  postingId: string;
  parentId: string | undefined;
};

export type UpdateParamsDto = {
  id: string;
  userId: string;
  content: string;
};

export type DeleteParamsDto = {
  id: string;
  userId: string;
  postingId: string;
};

export type GetCommentsParamsDto = {
  postingId: string;
};

export type GetReplyCommentsParamsDto = {
  parentId: string;
};
