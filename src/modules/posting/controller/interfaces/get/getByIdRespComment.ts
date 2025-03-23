export interface PostingGetByIdRespComment {
  id: string;
  writerId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  comments: PostingGetByIdRespComment[];
}
