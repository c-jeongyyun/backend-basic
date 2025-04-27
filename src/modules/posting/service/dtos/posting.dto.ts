export type PostingDto = {
  id: string;
  title: string;
  content: string;
  writerId: string;
  createdAt: Date;
  updatedAt: Date;
  files: {
    id: string;
    postingId: string;
    filename: string;
    mimetype: string;
    fileSize: number;
    uploadAt: Date;
  }[];
};
export type PostingSummaryDto = {
  id: string;
  title: string;
  writerId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GetPageResultDto = {
  postings: PostingSummaryDto[];
  lastCursor: string | null;
};
