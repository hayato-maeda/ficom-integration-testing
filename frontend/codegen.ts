import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: '../backend/schema.gql',
  documents: 'src/graphql/**/*.graphql',
  generates: {
    'src/types/generated/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        {
          'typescript-react-query': {
            fetcher: '@/lib/graphql-client#fetcher',
            reactQueryVersion: 5,
            addInfiniteQuery: false,
            exposeQueryKeys: true,
            exposeFetcher: true,
          },
        },
      ],
      config: {
        skipTypename: false,
        withHooks: false,
        withHOC: false,
        withComponent: false,
        scalars: {
          DateTime: 'string',
        },
      },
    },
  },
};

export default config;
