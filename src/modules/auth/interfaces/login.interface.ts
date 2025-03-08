export interface LoginPayload {
  userId: string;
  password: string;
}

export interface LoginResp {
  accessToken: string;
  refreshToken: string;
}
