export type PostingDto = {
  id: string;
  title: string;
  content: string;
  writerId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GetPageResultDto = {
  postings: PostingDto[];
  lastCursor: string | null;
};
