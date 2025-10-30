import { Field, ObjectType } from '@nestjs/graphql';
import { BaseResponse } from '../../common/dto/base-response.dto';
import { Tag } from '../models/tag.model';

/**
 * タグMutationレスポンス
 * createTag, updateTag, deleteTagの戻り値
 */
@ObjectType()
export class TagMutationResponse extends BaseResponse {
  /** タグデータ、失敗時はnull */
  @Field(() => Tag, { nullable: true })
  data: Tag | null;
}

/**
 * タグ割り当てMutationレスポンス
 * assignTag, unassignTagの戻り値
 */
@ObjectType()
export class TagAssignMutationResponse extends BaseResponse {
  /** 成功時はtrue、失敗時はnull */
  @Field(() => Boolean, { nullable: true })
  data: boolean | null;
}
