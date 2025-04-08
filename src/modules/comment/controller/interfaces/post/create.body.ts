export interface CreateCommentBody {
  content: string;
  parentId: string | undefined;
  postingId: string;
}
