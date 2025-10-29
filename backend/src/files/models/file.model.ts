import { Field, Int, ObjectType } from '@nestjs/graphql';
import { TestCase } from '../../test-cases/models/test-case.model';
import { User } from '../../users/models/user.model';

/**
 * ファイルエンティティ
 * テストケースに添付されるファイルの情報を表します。
 */
@ObjectType()
export class File {
  /** ファイルID */
  @Field(() => Int)
  id: number;

  /** ファイル名 */
  @Field(() => String)
  filename: string;

  /** ファイルパス */
  @Field(() => String)
  path: string;

  /** MIMEタイプ */
  @Field(() => String)
  mimeType: string;

  /** ファイルサイズ（バイト） */
  @Field(() => Int)
  size: number;

  /** テストケースID */
  @Field(() => Int)
  testCaseId: number;

  /** アップロードユーザーID */
  @Field(() => Int)
  uploadedBy: number;

  /** テストケース */
  @Field(() => TestCase)
  testCase: TestCase;

  /** アップロードユーザー */
  @Field(() => User)
  uploader: User;

  /** 作成日時 */
  @Field(() => Date)
  createdAt: Date;
}
