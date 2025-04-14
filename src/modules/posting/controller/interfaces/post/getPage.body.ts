export interface GetPageBody {
  keyword?: string;
  limit: number;
  sortBy: {
    key: "createdAt" | "updatedAt" | "title";
    orderBy: "ASC" | "DESC";
  }[];
  cursor: string | null;
}
