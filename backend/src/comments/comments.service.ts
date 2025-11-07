import { ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCommentInput } from "./dto/create-comment.input";
import { UpdateCommentInput } from "./dto/update-comment.input";
import { Comment } from "./models/comment.model";

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * コメントを作成
   */
  async create(userId: number, createCommentInput: CreateCommentInput): Promise<Comment> {
    const { content, featureId, testId, testCaseId } = createCommentInput;

    // TestCaseの存在確認
    const testCase = await this.prismaService.testCase.findUnique({
      where: {
        featureId_testId_id: {
          featureId,
          testId,
          id: testCaseId,
        },
      },
    });

    if (!testCase) {
      this.logger.warn({ message: "TestCase not found", featureId, testId, testCaseId });
      throw new NotFoundException("TestCase not found");
    }

    const comment = await this.prismaService.comment.create({
      data: {
        content,
        featureId,
        testId,
        testCaseId,
        userId,
      },
      include: {
        user: true,
        testCase: {
          include: {
            createdBy: true,
          },
        },
      },
    });

    this.logger.log({ message: "Comment created", commentId: comment.id });
    return comment;
  }

  /**
   * TestCaseに紐づくコメント一覧を取得
   */
  async findByTestCase(featureId: number, testId: number, testCaseId: number): Promise<Comment[]> {
    const comments = await this.prismaService.comment.findMany({
      where: {
        featureId,
        testId,
        testCaseId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    this.logger.log({ message: "Comments fetched", count: comments.length, featureId, testId, testCaseId });
    return comments;
  }

  /**
   * コメントを1件取得
   */
  async findOne(id: number): Promise<Comment> {
    const comment = await this.prismaService.comment.findUnique({
      where: { id },
      include: {
        user: true,
        testCase: {
          include: {
            createdBy: true,
          },
        },
      },
    });

    if (!comment) {
      this.logger.warn({ message: "Comment not found", commentId: id });
      throw new NotFoundException("Comment not found");
    }

    return comment;
  }

  /**
   * コメントを更新（自分のコメントのみ）
   */
  async update(userId: number, updateCommentInput: UpdateCommentInput): Promise<Comment> {
    const { id, content } = updateCommentInput;

    // コメントの存在確認と権限チェック
    const comment = await this.prismaService.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      this.logger.warn({ message: "Comment not found", commentId: id });
      throw new NotFoundException("Comment not found");
    }

    if (comment.userId !== userId) {
      this.logger.warn({ message: "Forbidden: User is not the owner", commentId: id, userId });
      throw new ForbiddenException("You can only update your own comments");
    }

    const updatedComment = await this.prismaService.comment.update({
      where: { id },
      data: { content },
      include: {
        user: true,
        testCase: {
          include: {
            createdBy: true,
          },
        },
      },
    });

    this.logger.log({ message: "Comment updated", commentId: id });
    return updatedComment;
  }

  /**
   * コメントを削除（自分のコメントのみ）
   */
  async remove(id: number, userId: number): Promise<Comment> {
    // コメントの存在確認と権限チェック
    const comment = await this.prismaService.comment.findUnique({
      where: { id },
      include: {
        user: true,
        testCase: {
          include: {
            createdBy: true,
          },
        },
      },
    });

    if (!comment) {
      this.logger.warn({ message: "Comment not found", commentId: id });
      throw new NotFoundException("Comment not found");
    }

    if (comment.userId !== userId) {
      this.logger.warn({ message: "Forbidden: User is not the owner", commentId: id, userId });
      throw new ForbiddenException("You can only delete your own comments");
    }

    await this.prismaService.comment.delete({
      where: { id },
    });

    this.logger.log({ message: "Comment deleted", commentId: id });
    return comment;
  }
}
