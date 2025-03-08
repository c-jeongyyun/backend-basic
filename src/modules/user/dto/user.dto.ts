export type UserDto = {
  id: string;
  userId: string;
  password: string;
};

export type UserInfoForTokenDto = Omit<UserDto, "password">;
