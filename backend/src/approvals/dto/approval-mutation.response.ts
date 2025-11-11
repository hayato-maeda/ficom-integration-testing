import { Field, ObjectType } from '@nestjs/graphql';
import { BaseResponse } from '../../common/dto/base-response.dto';
import { Approval } from '../models/approval.model';

/**
 * 承認Mutationレスポンス
 * createApproval, deleteApprovalの戻り値
 */
@ObjectType()
export class ApprovalMutationResponse extends BaseResponse {
  /** 承認データ、失敗時はnull */
  @Field(() => Approval, { nullable: true })
  data: Approval | null;
}
