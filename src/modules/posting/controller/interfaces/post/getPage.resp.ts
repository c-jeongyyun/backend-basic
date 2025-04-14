import { GetPageRespPosting } from "./getPageRespPosting";

export interface GetPageResp {
  postings: GetPageRespPosting[];
  lastCursor: string | null;
}
