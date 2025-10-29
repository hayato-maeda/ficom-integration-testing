import { useMutation, useQuery, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { fetcher } from '@/lib/graphql-client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
};

export type AssignTagInput = {
  tagId: Scalars['Int']['input'];
  testCaseId: Scalars['Int']['input'];
};

export type AuthResponse = {
  __typename?: 'AuthResponse';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
  user: User;
};

export type CreateTagInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateTestCaseInput = {
  actualResult?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  expectedResult: Scalars['String']['input'];
  steps: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type File = {
  __typename?: 'File';
  createdAt: Scalars['DateTime']['output'];
  filename: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  mimeType: Scalars['String']['output'];
  path: Scalars['String']['output'];
  size: Scalars['Int']['output'];
  testCase: TestCase;
  testCaseId: Scalars['Int']['output'];
  uploadedBy: Scalars['Int']['output'];
  uploader: User;
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  assignTag: Scalars['Boolean']['output'];
  createTag: Tag;
  createTestCase: TestCase;
  deleteTag: Tag;
  deleteTestCase: TestCase;
  login: AuthResponse;
  refreshToken: AuthResponse;
  signUp: AuthResponse;
  unassignTag: Scalars['Boolean']['output'];
  updateTag: Tag;
  updateTestCase: TestCase;
};


export type MutationAssignTagArgs = {
  assignTagInput: AssignTagInput;
};


export type MutationCreateTagArgs = {
  createTagInput: CreateTagInput;
};


export type MutationCreateTestCaseArgs = {
  createTestCaseInput: CreateTestCaseInput;
};


export type MutationDeleteTagArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteTestCaseArgs = {
  id: Scalars['Int']['input'];
};


export type MutationLoginArgs = {
  loginInput: LoginInput;
};


export type MutationRefreshTokenArgs = {
  refreshTokenInput: RefreshTokenInput;
};


export type MutationSignUpArgs = {
  signUpInput: SignUpInput;
};


export type MutationUnassignTagArgs = {
  tagId: Scalars['Int']['input'];
  testCaseId: Scalars['Int']['input'];
};


export type MutationUpdateTagArgs = {
  updateTagInput: UpdateTagInput;
};


export type MutationUpdateTestCaseArgs = {
  updateTestCaseInput: UpdateTestCaseInput;
};

export type Query = {
  __typename?: 'Query';
  file: File;
  files: Array<File>;
  filesByTestCase: Array<File>;
  me: User;
  tag: Tag;
  tags: Array<Tag>;
  tagsByTestCase: Array<Tag>;
  testCase: TestCase;
  testCases: Array<TestCase>;
};


export type QueryFileArgs = {
  id: Scalars['Int']['input'];
};


export type QueryFilesByTestCaseArgs = {
  testCaseId: Scalars['Int']['input'];
};


export type QueryTagArgs = {
  id: Scalars['Int']['input'];
};


export type QueryTagsByTestCaseArgs = {
  testCaseId: Scalars['Int']['input'];
};


export type QueryTestCaseArgs = {
  id: Scalars['Int']['input'];
};

export type RefreshTokenInput = {
  oldAccessToken: Scalars['String']['input'];
  refreshToken: Scalars['String']['input'];
};

export type SignUpInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Tag = {
  __typename?: 'Tag';
  color?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type TestCase = {
  __typename?: 'TestCase';
  actualResult?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  createdBy: User;
  createdById: Scalars['Int']['output'];
  description?: Maybe<Scalars['String']['output']>;
  expectedResult: Scalars['String']['output'];
  files?: Maybe<Array<File>>;
  id: Scalars['Int']['output'];
  status: Scalars['String']['output'];
  steps: Scalars['String']['output'];
  tags?: Maybe<Array<Tag>>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type UpdateTagInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTestCaseInput = {
  actualResult?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  expectedResult?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
  steps?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type LoginMutationVariables = Exact<{
  loginInput: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthResponse', accessToken: string, refreshToken: string, user: { __typename?: 'User', id: number, email: string, name: string, createdAt: string, updatedAt: string } } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: number, email: string, name: string, createdAt: string, updatedAt: string } };

export type SignUpMutationVariables = Exact<{
  signUpInput: SignUpInput;
}>;


export type SignUpMutation = { __typename?: 'Mutation', signUp: { __typename?: 'AuthResponse', accessToken: string, refreshToken: string, user: { __typename?: 'User', id: number, email: string, name: string, createdAt: string, updatedAt: string } } };



export const LoginDocument = `
    mutation Login($loginInput: LoginInput!) {
  login(loginInput: $loginInput) {
    accessToken
    refreshToken
    user {
      id
      email
      name
      createdAt
      updatedAt
    }
  }
}
    `;

export const useLoginMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<LoginMutation, TError, LoginMutationVariables, TContext>) => {
    
    return useMutation<LoginMutation, TError, LoginMutationVariables, TContext>(
      {
    mutationKey: ['Login'],
    mutationFn: (variables?: LoginMutationVariables) => fetcher<LoginMutation, LoginMutationVariables>(LoginDocument, variables)(),
    ...options
  }
    )};


useLoginMutation.fetcher = (variables: LoginMutationVariables, options?: RequestInit['headers']) => fetcher<LoginMutation, LoginMutationVariables>(LoginDocument, variables, options);

export const MeDocument = `
    query Me {
  me {
    id
    email
    name
    createdAt
    updatedAt
  }
}
    `;

export const useMeQuery = <
      TData = MeQuery,
      TError = unknown
    >(
      variables?: MeQueryVariables,
      options?: Omit<UseQueryOptions<MeQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<MeQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<MeQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['Me'] : ['Me', variables],
    queryFn: fetcher<MeQuery, MeQueryVariables>(MeDocument, variables),
    ...options
  }
    )};

useMeQuery.getKey = (variables?: MeQueryVariables) => variables === undefined ? ['Me'] : ['Me', variables];


useMeQuery.fetcher = (variables?: MeQueryVariables, options?: RequestInit['headers']) => fetcher<MeQuery, MeQueryVariables>(MeDocument, variables, options);

export const SignUpDocument = `
    mutation SignUp($signUpInput: SignUpInput!) {
  signUp(signUpInput: $signUpInput) {
    accessToken
    refreshToken
    user {
      id
      email
      name
      createdAt
      updatedAt
    }
  }
}
    `;

export const useSignUpMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<SignUpMutation, TError, SignUpMutationVariables, TContext>) => {
    
    return useMutation<SignUpMutation, TError, SignUpMutationVariables, TContext>(
      {
    mutationKey: ['SignUp'],
    mutationFn: (variables?: SignUpMutationVariables) => fetcher<SignUpMutation, SignUpMutationVariables>(SignUpDocument, variables)(),
    ...options
  }
    )};


useSignUpMutation.fetcher = (variables: SignUpMutationVariables, options?: RequestInit['headers']) => fetcher<SignUpMutation, SignUpMutationVariables>(SignUpDocument, variables, options);
