import { UserDao } from "modules/user/user.dao";
import * as crypto from "node:crypto";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { UserInfoForTokenDto } from "modules/user/dto/user.dto";

export class AuthService {
  private userDao: UserDao;

  constructor() {
    this.userDao = new UserDao();
  }

  private verifyRefreshToken(refreshToken: string): UserInfoForTokenDto {
    const verifiedResult = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as UserInfoForTokenDto;
    return verifiedResult;
  }

  private issueAccessToken(user: UserInfoForTokenDto) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: "1h",
    });
  }

  private issueRefreshToken(user: UserInfoForTokenDto) {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: "30d",
    });
  }

  // 중복된 아이디인지 검사
  private async checkIsIdDuplicated(userId: string) {
    const user = await this.userDao.findUserById({ userId });
    return !!user;
  }

  private hashPassword(password: string) {
    const secret = process.env.PW_SALT!;
    const hashedPassword = crypto
      .createHmac("sha256", secret)
      .update(password)
      .digest("base64");
    return hashedPassword;
  }

  /* 로그인 */
  async login(userId: string, password: string): Promise<LoginResult> {
    // 1. 해당 userId 가지고 있는 사람 조회
    const user = await this.userDao.findUserById({ userId });

    if (!user) {
      throw new Error("Login Failed");
    }

    // 2. password가 동일한지 확인
    const isEqualPassword = user.password === this.hashPassword(password);

    if (!isEqualPassword) {
      throw new Error("Login Failed");
    }

    // 3. jwt 토큰 발급
    const userInfoForToken: UserInfoForTokenDto = {
      id: user.id,
      userId: user.userId,
    };
    const accessToken = this.issueAccessToken(userInfoForToken);
    const refreshToken = this.issueRefreshToken(userInfoForToken);

    return { accessToken, refreshToken };
  }

  /* 회원가입 */
  async signUp(userId: string, password: string) {
    // 1. 이미 존재하는 회원인지 확인
    const isAlreadyExistingUser = await this.checkIsIdDuplicated(userId);
    if (isAlreadyExistingUser) {
      throw new Error("이미 존재하는 회원입니다.");
    }

    // 2. 신규 회원이라면
    const hashedPassword = this.hashPassword(password);
    await this.userDao.addUser({ userId, password: hashedPassword });
    return true;
  }

  /* access token 재발급 */
  reissueAccessToken(refreshToken: string) {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);

      return this.issueAccessToken({
        id: decoded.id,
        userId: decoded.userId,
      });
    } catch (e) {
      console.error("Reissue Access Token Failed");
      throw e;
    }
  }
}

type LoginResult = {
  accessToken: string;
  refreshToken: string;
};
