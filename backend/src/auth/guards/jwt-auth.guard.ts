import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT 認証ガード
 * REST API リクエストに対する JWT 認証を行います。
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
