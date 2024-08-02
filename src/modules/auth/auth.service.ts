import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OAuth2Client } from 'google-auth-library';
import { assert } from 'console';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { AuthAfterSignInArgs } from './auth.interface';
import { AuthEventType } from './auth.types';
import { Types } from 'mongoose';
import { UserDocument } from '../user/user.schema';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  private authClient: OAuth2Client;

  constructor(
    private eventEmitter: EventEmitter2,
    private userService: UserService,
    private jwtService: JwtService,
  ) {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SITE_URL } = process.env;
    assert(GOOGLE_CLIENT_ID);
    assert(GOOGLE_CLIENT_SECRET);

    this.authClient = new OAuth2Client({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      redirectUri: SITE_URL,
    });
  }

  async signIn(args: { code?: string; idToken?: string }) {
    if (args.code) {
      try {
        this.logger.verbose(`signIn() getToken()`, args.code);
        const token = await this.authClient.getToken(args.code);
        if (!token.tokens.id_token) {
          throw new BadRequestException();
        }
        args.idToken ??= token.tokens.id_token;
      } catch (error) {
        console.log(error);
        this.logger.error(error);
        throw new BadRequestException(error.message || error);
      }
    }

    this.logger.verbose(`signIn() verifyIdToken()`);
    const result = await this.authClient.verifyIdToken({
      idToken: args.idToken,
    });

    const { email, name, picture } = result.getPayload();
    const user = await this.userService.upsert({
      email,
      name,
      photoUrl: picture,
    });

    // emit event
    const eventArgs: AuthAfterSignInArgs = { document: user };
    await this.eventEmitter.emitAsync(
      AuthEventType.beforeSignInAsync,
      eventArgs,
    );
    this.eventEmitter.emit(AuthEventType.beforeSignIn, eventArgs);

    // generate token
    return await this.createToken(user._id);
  }

  async createToken(user: Types.ObjectId | UserDocument) {
    if (user instanceof Types.ObjectId) {
      user = await this.userService.get(user);
    }

    const accessToken = this.jwtService.sign(
      {
        iss: process.env.SITE_URL,
        aud: 'accessToken',
        sub: user.id,
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
      },
      {
        secret: process.env.AUTH_SECRET,
        expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN,
      },
    );
    const refreshToken = this.jwtService.sign(
      {
        iss: process.env.SITE_URL,
        aud: 'refreshToken',
        sub: user.id,
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
      },
      {
        secret: process.env.AUTH_SECRET,
        expiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN,
      },
    );

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    const decoded = await this.verifyRefreshToken(refreshToken);
    const user = await this.userService.findByEmail(decoded.email);
    const accessToken = this.jwtService.sign(
      {
        iss: process.env.SITE_URL,
        aud: 'accessToken',
        sub: user.id,
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
      },
      {
        secret: process.env.AUTH_SECRET,
        expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRES_IN,
      },
    );

    return { accessToken };
  }

  async verifyAccessToken(token: string) {
    const decoded = await this.jwtService.verifyAsync(token, {
      secret: process.env.AUTH_SECRET,
    });
    if (!decoded.aud || decoded.aud !== 'accessToken' || !decoded.email) {
      this.logger.verbose(`verifyAccessToken() invalid aud ${decoded.aud}`);
      throw new UnauthorizedException();
    }
    return decoded;
  }

  async verifyRefreshToken(token: string) {
    const decoded = await this.jwtService.verifyAsync(token, {
      secret: process.env.AUTH_SECRET,
    });
    if (!decoded.aud || decoded.aud !== 'refreshToken' || !decoded.email) {
      this.logger.verbose(`verifyRefreshToken() invalid aud ${decoded.aud}`);
      throw new UnauthorizedException();
    }
    return decoded;
  }

  async getRedirectUrl(scope?: string[]) {
    return this.authClient.generateAuthUrl({
      access_type: 'offline',
      scope: scope || [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
    });
  }
}
