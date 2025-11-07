import { join } from 'node:path';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SessionMiddleware } from './auth/middleware/session.middleware';
import { pinoLoggerConfig } from './common/logger/pino-logger.config';
// import { LoggerModule } from './common/logger/logger.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { CommentsModule } from './comments/comments.module';
import { FeaturesModule } from './features/features.module';
import { FilesModule } from './files/files.module';
import { PrismaModule } from './prisma/prisma.module';
import { TagsModule } from './tags/tags.module';
import { TestCasesModule } from './test-cases/test-cases.module';
import { TestsModule } from './tests/tests.module';

const isProduction = process.env.NODE_ENV === 'production';
const isNotProduction = !isProduction;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      sortSchema: true,
      playground: false,
      introspection: isNotProduction,
      plugins: [
        isProduction
          ? ApolloServerPluginLandingPageProductionDefault({ footer: false })
          : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
      ],
    }),
    LoggerModule.forRoot(pinoLoggerConfig()),
    PrismaModule,
    AuthModule,
    TestCasesModule,
    TagsModule,
    FeaturesModule,
    TestsModule,
    FilesModule,
    ApprovalsModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // すべてのルートにセッションミドルウェアを適用
    consumer.apply(SessionMiddleware).forRoutes('*');
  }
}
