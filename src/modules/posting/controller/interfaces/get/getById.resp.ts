export interface PostingGetByIdResp {
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
}
