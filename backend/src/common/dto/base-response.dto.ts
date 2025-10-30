import { Field, ObjectType } from '@nestjs/graphql';

/**
 * 基本レスポンス型
 * すべてのMutationで使用する共通のレスポンス構造
 */
@ObjectType({ isAbstract: true })
export abstract class BaseResponse {
  /** 処理が正常ならtrue、異常ならfalse */
  @Field(() => Boolean)
  isValid: boolean;

  /** サーバーからクライアント側に伝えたい内容 */
  @Field(() => String)
  message: string;
}
