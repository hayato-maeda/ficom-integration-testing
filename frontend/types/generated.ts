import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
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

export type AuthMutationResponse = {
  __typename?: 'AuthMutationResponse';
  data?: Maybe<AuthResponse>;
  isValid: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
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
  assignTag: TagAssignMutationResponse;
  createTag: TagMutationResponse;
  createTestCase: TestCaseMutationResponse;
  deleteTag: TagMutationResponse;
  deleteTestCase: TestCaseMutationResponse;
  login: AuthMutationResponse;
  refreshToken: AuthMutationResponse;
  signUp: AuthMutationResponse;
  unassignTag: TagAssignMutationResponse;
  updateTag: TagMutationResponse;
  updateTestCase: TestCaseMutationResponse;
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
  tag?: Maybe<Tag>;
  tags: Array<Tag>;
  tagsByTestCase: Array<Tag>;
  testCase?: Maybe<TestCase>;
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

export type TagAssignMutationResponse = {
  __typename?: 'TagAssignMutationResponse';
  data?: Maybe<Scalars['Boolean']['output']>;
  isValid: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
};

export type TagMutationResponse = {
  __typename?: 'TagMutationResponse';
  data?: Maybe<Tag>;
  isValid: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
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

export type TestCaseMutationResponse = {
  __typename?: 'TestCaseMutationResponse';
  data?: Maybe<TestCase>;
  isValid: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
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
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & { login: (
    { __typename?: 'AuthMutationResponse' }
    & Pick<AuthMutationResponse, 'isValid' | 'message'>
    & { data?: Maybe<(
      { __typename?: 'AuthResponse' }
      & Pick<AuthResponse, 'accessToken' | 'refreshToken'>
      & { user: (
        { __typename?: 'User' }
        & Pick<
          User,
          | 'id'
          | 'email'
          | 'name'
          | 'createdAt'
          | 'updatedAt'
        >
      ) }
    )> }
  ) }
);

export type SignupMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;


export type SignupMutation = (
  { __typename?: 'Mutation' }
  & { signUp: (
    { __typename?: 'AuthMutationResponse' }
    & Pick<AuthMutationResponse, 'isValid' | 'message'>
    & { data?: Maybe<(
      { __typename?: 'AuthResponse' }
      & Pick<AuthResponse, 'accessToken' | 'refreshToken'>
      & { user: (
        { __typename?: 'User' }
        & Pick<
          User,
          | 'id'
          | 'email'
          | 'name'
          | 'createdAt'
          | 'updatedAt'
        >
      ) }
    )> }
  ) }
);

export type RefreshTokenMutationVariables = Exact<{
  refreshToken: Scalars['String']['input'];
  oldAccessToken: Scalars['String']['input'];
}>;


export type RefreshTokenMutation = (
  { __typename?: 'Mutation' }
  & { refreshToken: (
    { __typename?: 'AuthMutationResponse' }
    & Pick<AuthMutationResponse, 'isValid' | 'message'>
    & { data?: Maybe<(
      { __typename?: 'AuthResponse' }
      & Pick<AuthResponse, 'accessToken' | 'refreshToken'>
      & { user: (
        { __typename?: 'User' }
        & Pick<
          User,
          | 'id'
          | 'email'
          | 'name'
          | 'createdAt'
          | 'updatedAt'
        >
      ) }
    )> }
  ) }
);

export type GetTagsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTagsQuery = (
  { __typename?: 'Query' }
  & { tags: Array<(
    { __typename?: 'Tag' }
    & Pick<
      Tag,
      | 'id'
      | 'name'
      | 'color'
      | 'createdAt'
    >
  )> }
);

export type GetTagQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetTagQuery = (
  { __typename?: 'Query' }
  & { tag?: Maybe<(
    { __typename?: 'Tag' }
    & Pick<
      Tag,
      | 'id'
      | 'name'
      | 'color'
      | 'createdAt'
    >
  )> }
);

export type CreateTagMutationVariables = Exact<{
  name: Scalars['String']['input'];
  color?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateTagMutation = (
  { __typename?: 'Mutation' }
  & { createTag: (
    { __typename?: 'TagMutationResponse' }
    & Pick<TagMutationResponse, 'isValid' | 'message'>
    & { data?: Maybe<(
      { __typename?: 'Tag' }
      & Pick<
        Tag,
        | 'id'
        | 'name'
        | 'color'
        | 'createdAt'
      >
    )> }
  ) }
);

export type UpdateTagMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  color?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateTagMutation = (
  { __typename?: 'Mutation' }
  & { updateTag: (
    { __typename?: 'TagMutationResponse' }
    & Pick<TagMutationResponse, 'isValid' | 'message'>
    & { data?: Maybe<(
      { __typename?: 'Tag' }
      & Pick<
        Tag,
        | 'id'
        | 'name'
        | 'color'
        | 'createdAt'
      >
    )> }
  ) }
);

export type DeleteTagMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteTagMutation = (
  { __typename?: 'Mutation' }
  & { deleteTag: (
    { __typename?: 'TagMutationResponse' }
    & Pick<TagMutationResponse, 'isValid' | 'message'>
    & { data?: Maybe<(
      { __typename?: 'Tag' }
      & Pick<Tag, 'id'>
    )> }
  ) }
);

export type AssignTagMutationVariables = Exact<{
  tagId: Scalars['Int']['input'];
  testCaseId: Scalars['Int']['input'];
}>;


export type AssignTagMutation = (
  { __typename?: 'Mutation' }
  & { assignTag: (
    { __typename?: 'TagAssignMutationResponse' }
    & Pick<TagAssignMutationResponse, 'isValid' | 'message' | 'data'>
  ) }
);

export type UnassignTagMutationVariables = Exact<{
  tagId: Scalars['Int']['input'];
  testCaseId: Scalars['Int']['input'];
}>;


export type UnassignTagMutation = (
  { __typename?: 'Mutation' }
  & { unassignTag: (
    { __typename?: 'TagAssignMutationResponse' }
    & Pick<TagAssignMutationResponse, 'isValid' | 'message' | 'data'>
  ) }
);

export type GetTestCasesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTestCasesQuery = (
  { __typename?: 'Query' }
  & { testCases: Array<(
    { __typename?: 'TestCase' }
    & Pick<
      TestCase,
      | 'id'
      | 'title'
      | 'description'
      | 'steps'
      | 'expectedResult'
      | 'actualResult'
      | 'status'
      | 'createdAt'
      | 'updatedAt'
    >
    & {
      createdBy: (
        { __typename?: 'User' }
        & Pick<User, 'id' | 'name' | 'email'>
      ),
      tags?: Maybe<Array<(
        { __typename?: 'Tag' }
        & Pick<Tag, 'id' | 'name' | 'color'>
      )>>,
    }
  )> }
);

export type GetTestCaseQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetTestCaseQuery = (
  { __typename?: 'Query' }
  & { testCase?: Maybe<(
    { __typename?: 'TestCase' }
    & Pick<
      TestCase,
      | 'id'
      | 'title'
      | 'description'
      | 'steps'
      | 'expectedResult'
      | 'actualResult'
      | 'status'
      | 'createdAt'
      | 'updatedAt'
    >
    & {
      createdBy: (
        { __typename?: 'User' }
        & Pick<User, 'id' | 'name' | 'email'>
      ),
      tags?: Maybe<Array<(
        { __typename?: 'Tag' }
        & Pick<Tag, 'id' | 'name' | 'color'>
      )>>,
    }
  )> }
);

export type CreateTestCaseMutationVariables = Exact<{
  title: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  steps: Scalars['String']['input'];
  expectedResult: Scalars['String']['input'];
  actualResult?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateTestCaseMutation = (
  { __typename?: 'Mutation' }
  & { createTestCase: (
    { __typename?: 'TestCaseMutationResponse' }
    & Pick<TestCaseMutationResponse, 'isValid' | 'message'>
    & { data?: Maybe<(
      { __typename?: 'TestCase' }
      & Pick<
        TestCase,
        | 'id'
        | 'title'
        | 'description'
        | 'steps'
        | 'expectedResult'
        | 'actualResult'
        | 'status'
        | 'createdAt'
      >
    )> }
  ) }
);

export type UpdateTestCaseMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  steps?: InputMaybe<Scalars['String']['input']>;
  expectedResult?: InputMaybe<Scalars['String']['input']>;
  actualResult?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateTestCaseMutation = (
  { __typename?: 'Mutation' }
  & { updateTestCase: (
    { __typename?: 'TestCaseMutationResponse' }
    & Pick<TestCaseMutationResponse, 'isValid' | 'message'>
    & { data?: Maybe<(
      { __typename?: 'TestCase' }
      & Pick<
        TestCase,
        | 'id'
        | 'title'
        | 'description'
        | 'steps'
        | 'expectedResult'
        | 'actualResult'
        | 'status'
        | 'updatedAt'
      >
    )> }
  ) }
);

export type DeleteTestCaseMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type DeleteTestCaseMutation = (
  { __typename?: 'Mutation' }
  & { deleteTestCase: (
    { __typename?: 'TestCaseMutationResponse' }
    & Pick<TestCaseMutationResponse, 'isValid' | 'message'>
    & { data?: Maybe<(
      { __typename?: 'TestCase' }
      & Pick<TestCase, 'id'>
    )> }
  ) }
);


export const LoginDocument = gql`
    mutation Login($email: String!, $password: String!) {
  login(loginInput: {email: $email, password: $password}) {
    isValid
    message
    data {
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
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const SignupDocument = gql`
    mutation Signup($email: String!, $password: String!, $name: String!) {
  signUp(signUpInput: {email: $email, password: $password, name: $name}) {
    isValid
    message
    data {
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
}
    `;
export type SignupMutationFn = Apollo.MutationFunction<SignupMutation, SignupMutationVariables>;

/**
 * __useSignupMutation__
 *
 * To run a mutation, you first call `useSignupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signupMutation, { data, loading, error }] = useSignupMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useSignupMutation(baseOptions?: Apollo.MutationHookOptions<SignupMutation, SignupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SignupMutation, SignupMutationVariables>(SignupDocument, options);
      }
export type SignupMutationHookResult = ReturnType<typeof useSignupMutation>;
export type SignupMutationResult = Apollo.MutationResult<SignupMutation>;
export type SignupMutationOptions = Apollo.BaseMutationOptions<SignupMutation, SignupMutationVariables>;
export const RefreshTokenDocument = gql`
    mutation RefreshToken($refreshToken: String!, $oldAccessToken: String!) {
  refreshToken(
    refreshTokenInput: {refreshToken: $refreshToken, oldAccessToken: $oldAccessToken}
  ) {
    isValid
    message
    data {
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
}
    `;
export type RefreshTokenMutationFn = Apollo.MutationFunction<RefreshTokenMutation, RefreshTokenMutationVariables>;

/**
 * __useRefreshTokenMutation__
 *
 * To run a mutation, you first call `useRefreshTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRefreshTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [refreshTokenMutation, { data, loading, error }] = useRefreshTokenMutation({
 *   variables: {
 *      refreshToken: // value for 'refreshToken'
 *      oldAccessToken: // value for 'oldAccessToken'
 *   },
 * });
 */
export function useRefreshTokenMutation(baseOptions?: Apollo.MutationHookOptions<RefreshTokenMutation, RefreshTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RefreshTokenMutation, RefreshTokenMutationVariables>(RefreshTokenDocument, options);
      }
export type RefreshTokenMutationHookResult = ReturnType<typeof useRefreshTokenMutation>;
export type RefreshTokenMutationResult = Apollo.MutationResult<RefreshTokenMutation>;
export type RefreshTokenMutationOptions = Apollo.BaseMutationOptions<RefreshTokenMutation, RefreshTokenMutationVariables>;
export const GetTagsDocument = gql`
    query GetTags {
  tags {
    id
    name
    color
    createdAt
  }
}
    `;

/**
 * __useGetTagsQuery__
 *
 * To run a query within a React component, call `useGetTagsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTagsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTagsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTagsQuery(baseOptions?: Apollo.QueryHookOptions<GetTagsQuery, GetTagsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTagsQuery, GetTagsQueryVariables>(GetTagsDocument, options);
      }
export function useGetTagsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTagsQuery, GetTagsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTagsQuery, GetTagsQueryVariables>(GetTagsDocument, options);
        }
export function useGetTagsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTagsQuery, GetTagsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTagsQuery, GetTagsQueryVariables>(GetTagsDocument, options);
        }
export type GetTagsQueryHookResult = ReturnType<typeof useGetTagsQuery>;
export type GetTagsLazyQueryHookResult = ReturnType<typeof useGetTagsLazyQuery>;
export type GetTagsSuspenseQueryHookResult = ReturnType<typeof useGetTagsSuspenseQuery>;
export type GetTagsQueryResult = Apollo.QueryResult<GetTagsQuery, GetTagsQueryVariables>;
export const GetTagDocument = gql`
    query GetTag($id: Int!) {
  tag(id: $id) {
    id
    name
    color
    createdAt
  }
}
    `;

/**
 * __useGetTagQuery__
 *
 * To run a query within a React component, call `useGetTagQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTagQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTagQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTagQuery(baseOptions: Apollo.QueryHookOptions<GetTagQuery, GetTagQueryVariables> & ({ variables: GetTagQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTagQuery, GetTagQueryVariables>(GetTagDocument, options);
      }
export function useGetTagLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTagQuery, GetTagQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTagQuery, GetTagQueryVariables>(GetTagDocument, options);
        }
export function useGetTagSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTagQuery, GetTagQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTagQuery, GetTagQueryVariables>(GetTagDocument, options);
        }
export type GetTagQueryHookResult = ReturnType<typeof useGetTagQuery>;
export type GetTagLazyQueryHookResult = ReturnType<typeof useGetTagLazyQuery>;
export type GetTagSuspenseQueryHookResult = ReturnType<typeof useGetTagSuspenseQuery>;
export type GetTagQueryResult = Apollo.QueryResult<GetTagQuery, GetTagQueryVariables>;
export const CreateTagDocument = gql`
    mutation CreateTag($name: String!, $color: String) {
  createTag(createTagInput: {name: $name, color: $color}) {
    isValid
    message
    data {
      id
      name
      color
      createdAt
    }
  }
}
    `;
export type CreateTagMutationFn = Apollo.MutationFunction<CreateTagMutation, CreateTagMutationVariables>;

/**
 * __useCreateTagMutation__
 *
 * To run a mutation, you first call `useCreateTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTagMutation, { data, loading, error }] = useCreateTagMutation({
 *   variables: {
 *      name: // value for 'name'
 *      color: // value for 'color'
 *   },
 * });
 */
export function useCreateTagMutation(baseOptions?: Apollo.MutationHookOptions<CreateTagMutation, CreateTagMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTagMutation, CreateTagMutationVariables>(CreateTagDocument, options);
      }
export type CreateTagMutationHookResult = ReturnType<typeof useCreateTagMutation>;
export type CreateTagMutationResult = Apollo.MutationResult<CreateTagMutation>;
export type CreateTagMutationOptions = Apollo.BaseMutationOptions<CreateTagMutation, CreateTagMutationVariables>;
export const UpdateTagDocument = gql`
    mutation UpdateTag($id: Int!, $name: String, $color: String) {
  updateTag(updateTagInput: {id: $id, name: $name, color: $color}) {
    isValid
    message
    data {
      id
      name
      color
      createdAt
    }
  }
}
    `;
export type UpdateTagMutationFn = Apollo.MutationFunction<UpdateTagMutation, UpdateTagMutationVariables>;

/**
 * __useUpdateTagMutation__
 *
 * To run a mutation, you first call `useUpdateTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTagMutation, { data, loading, error }] = useUpdateTagMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      color: // value for 'color'
 *   },
 * });
 */
export function useUpdateTagMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTagMutation, UpdateTagMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTagMutation, UpdateTagMutationVariables>(UpdateTagDocument, options);
      }
export type UpdateTagMutationHookResult = ReturnType<typeof useUpdateTagMutation>;
export type UpdateTagMutationResult = Apollo.MutationResult<UpdateTagMutation>;
export type UpdateTagMutationOptions = Apollo.BaseMutationOptions<UpdateTagMutation, UpdateTagMutationVariables>;
export const DeleteTagDocument = gql`
    mutation DeleteTag($id: Int!) {
  deleteTag(id: $id) {
    isValid
    message
    data {
      id
    }
  }
}
    `;
export type DeleteTagMutationFn = Apollo.MutationFunction<DeleteTagMutation, DeleteTagMutationVariables>;

/**
 * __useDeleteTagMutation__
 *
 * To run a mutation, you first call `useDeleteTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTagMutation, { data, loading, error }] = useDeleteTagMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteTagMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTagMutation, DeleteTagMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTagMutation, DeleteTagMutationVariables>(DeleteTagDocument, options);
      }
export type DeleteTagMutationHookResult = ReturnType<typeof useDeleteTagMutation>;
export type DeleteTagMutationResult = Apollo.MutationResult<DeleteTagMutation>;
export type DeleteTagMutationOptions = Apollo.BaseMutationOptions<DeleteTagMutation, DeleteTagMutationVariables>;
export const AssignTagDocument = gql`
    mutation AssignTag($tagId: Int!, $testCaseId: Int!) {
  assignTag(assignTagInput: {tagId: $tagId, testCaseId: $testCaseId}) {
    isValid
    message
    data
  }
}
    `;
export type AssignTagMutationFn = Apollo.MutationFunction<AssignTagMutation, AssignTagMutationVariables>;

/**
 * __useAssignTagMutation__
 *
 * To run a mutation, you first call `useAssignTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignTagMutation, { data, loading, error }] = useAssignTagMutation({
 *   variables: {
 *      tagId: // value for 'tagId'
 *      testCaseId: // value for 'testCaseId'
 *   },
 * });
 */
export function useAssignTagMutation(baseOptions?: Apollo.MutationHookOptions<AssignTagMutation, AssignTagMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AssignTagMutation, AssignTagMutationVariables>(AssignTagDocument, options);
      }
export type AssignTagMutationHookResult = ReturnType<typeof useAssignTagMutation>;
export type AssignTagMutationResult = Apollo.MutationResult<AssignTagMutation>;
export type AssignTagMutationOptions = Apollo.BaseMutationOptions<AssignTagMutation, AssignTagMutationVariables>;
export const UnassignTagDocument = gql`
    mutation UnassignTag($tagId: Int!, $testCaseId: Int!) {
  unassignTag(tagId: $tagId, testCaseId: $testCaseId) {
    isValid
    message
    data
  }
}
    `;
export type UnassignTagMutationFn = Apollo.MutationFunction<UnassignTagMutation, UnassignTagMutationVariables>;

/**
 * __useUnassignTagMutation__
 *
 * To run a mutation, you first call `useUnassignTagMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnassignTagMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unassignTagMutation, { data, loading, error }] = useUnassignTagMutation({
 *   variables: {
 *      tagId: // value for 'tagId'
 *      testCaseId: // value for 'testCaseId'
 *   },
 * });
 */
export function useUnassignTagMutation(baseOptions?: Apollo.MutationHookOptions<UnassignTagMutation, UnassignTagMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnassignTagMutation, UnassignTagMutationVariables>(UnassignTagDocument, options);
      }
export type UnassignTagMutationHookResult = ReturnType<typeof useUnassignTagMutation>;
export type UnassignTagMutationResult = Apollo.MutationResult<UnassignTagMutation>;
export type UnassignTagMutationOptions = Apollo.BaseMutationOptions<UnassignTagMutation, UnassignTagMutationVariables>;
export const GetTestCasesDocument = gql`
    query GetTestCases {
  testCases {
    id
    title
    description
    steps
    expectedResult
    actualResult
    status
    createdBy {
      id
      name
      email
    }
    tags {
      id
      name
      color
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetTestCasesQuery__
 *
 * To run a query within a React component, call `useGetTestCasesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTestCasesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTestCasesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTestCasesQuery(baseOptions?: Apollo.QueryHookOptions<GetTestCasesQuery, GetTestCasesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTestCasesQuery, GetTestCasesQueryVariables>(GetTestCasesDocument, options);
      }
export function useGetTestCasesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTestCasesQuery, GetTestCasesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTestCasesQuery, GetTestCasesQueryVariables>(GetTestCasesDocument, options);
        }
export function useGetTestCasesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTestCasesQuery, GetTestCasesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTestCasesQuery, GetTestCasesQueryVariables>(GetTestCasesDocument, options);
        }
export type GetTestCasesQueryHookResult = ReturnType<typeof useGetTestCasesQuery>;
export type GetTestCasesLazyQueryHookResult = ReturnType<typeof useGetTestCasesLazyQuery>;
export type GetTestCasesSuspenseQueryHookResult = ReturnType<typeof useGetTestCasesSuspenseQuery>;
export type GetTestCasesQueryResult = Apollo.QueryResult<GetTestCasesQuery, GetTestCasesQueryVariables>;
export const GetTestCaseDocument = gql`
    query GetTestCase($id: Int!) {
  testCase(id: $id) {
    id
    title
    description
    steps
    expectedResult
    actualResult
    status
    createdBy {
      id
      name
      email
    }
    tags {
      id
      name
      color
    }
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetTestCaseQuery__
 *
 * To run a query within a React component, call `useGetTestCaseQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTestCaseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTestCaseQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetTestCaseQuery(baseOptions: Apollo.QueryHookOptions<GetTestCaseQuery, GetTestCaseQueryVariables> & ({ variables: GetTestCaseQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTestCaseQuery, GetTestCaseQueryVariables>(GetTestCaseDocument, options);
      }
export function useGetTestCaseLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTestCaseQuery, GetTestCaseQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTestCaseQuery, GetTestCaseQueryVariables>(GetTestCaseDocument, options);
        }
export function useGetTestCaseSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTestCaseQuery, GetTestCaseQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTestCaseQuery, GetTestCaseQueryVariables>(GetTestCaseDocument, options);
        }
export type GetTestCaseQueryHookResult = ReturnType<typeof useGetTestCaseQuery>;
export type GetTestCaseLazyQueryHookResult = ReturnType<typeof useGetTestCaseLazyQuery>;
export type GetTestCaseSuspenseQueryHookResult = ReturnType<typeof useGetTestCaseSuspenseQuery>;
export type GetTestCaseQueryResult = Apollo.QueryResult<GetTestCaseQuery, GetTestCaseQueryVariables>;
export const CreateTestCaseDocument = gql`
    mutation CreateTestCase($title: String!, $description: String, $steps: String!, $expectedResult: String!, $actualResult: String) {
  createTestCase(
    createTestCaseInput: {title: $title, description: $description, steps: $steps, expectedResult: $expectedResult, actualResult: $actualResult}
  ) {
    isValid
    message
    data {
      id
      title
      description
      steps
      expectedResult
      actualResult
      status
      createdAt
    }
  }
}
    `;
export type CreateTestCaseMutationFn = Apollo.MutationFunction<CreateTestCaseMutation, CreateTestCaseMutationVariables>;

/**
 * __useCreateTestCaseMutation__
 *
 * To run a mutation, you first call `useCreateTestCaseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTestCaseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTestCaseMutation, { data, loading, error }] = useCreateTestCaseMutation({
 *   variables: {
 *      title: // value for 'title'
 *      description: // value for 'description'
 *      steps: // value for 'steps'
 *      expectedResult: // value for 'expectedResult'
 *      actualResult: // value for 'actualResult'
 *   },
 * });
 */
export function useCreateTestCaseMutation(baseOptions?: Apollo.MutationHookOptions<CreateTestCaseMutation, CreateTestCaseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTestCaseMutation, CreateTestCaseMutationVariables>(CreateTestCaseDocument, options);
      }
export type CreateTestCaseMutationHookResult = ReturnType<typeof useCreateTestCaseMutation>;
export type CreateTestCaseMutationResult = Apollo.MutationResult<CreateTestCaseMutation>;
export type CreateTestCaseMutationOptions = Apollo.BaseMutationOptions<CreateTestCaseMutation, CreateTestCaseMutationVariables>;
export const UpdateTestCaseDocument = gql`
    mutation UpdateTestCase($id: Int!, $title: String, $description: String, $steps: String, $expectedResult: String, $actualResult: String, $status: String) {
  updateTestCase(
    updateTestCaseInput: {id: $id, title: $title, description: $description, steps: $steps, expectedResult: $expectedResult, actualResult: $actualResult, status: $status}
  ) {
    isValid
    message
    data {
      id
      title
      description
      steps
      expectedResult
      actualResult
      status
      updatedAt
    }
  }
}
    `;
export type UpdateTestCaseMutationFn = Apollo.MutationFunction<UpdateTestCaseMutation, UpdateTestCaseMutationVariables>;

/**
 * __useUpdateTestCaseMutation__
 *
 * To run a mutation, you first call `useUpdateTestCaseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTestCaseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTestCaseMutation, { data, loading, error }] = useUpdateTestCaseMutation({
 *   variables: {
 *      id: // value for 'id'
 *      title: // value for 'title'
 *      description: // value for 'description'
 *      steps: // value for 'steps'
 *      expectedResult: // value for 'expectedResult'
 *      actualResult: // value for 'actualResult'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useUpdateTestCaseMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTestCaseMutation, UpdateTestCaseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTestCaseMutation, UpdateTestCaseMutationVariables>(UpdateTestCaseDocument, options);
      }
export type UpdateTestCaseMutationHookResult = ReturnType<typeof useUpdateTestCaseMutation>;
export type UpdateTestCaseMutationResult = Apollo.MutationResult<UpdateTestCaseMutation>;
export type UpdateTestCaseMutationOptions = Apollo.BaseMutationOptions<UpdateTestCaseMutation, UpdateTestCaseMutationVariables>;
export const DeleteTestCaseDocument = gql`
    mutation DeleteTestCase($id: Int!) {
  deleteTestCase(id: $id) {
    isValid
    message
    data {
      id
    }
  }
}
    `;
export type DeleteTestCaseMutationFn = Apollo.MutationFunction<DeleteTestCaseMutation, DeleteTestCaseMutationVariables>;

/**
 * __useDeleteTestCaseMutation__
 *
 * To run a mutation, you first call `useDeleteTestCaseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTestCaseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTestCaseMutation, { data, loading, error }] = useDeleteTestCaseMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteTestCaseMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTestCaseMutation, DeleteTestCaseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTestCaseMutation, DeleteTestCaseMutationVariables>(DeleteTestCaseDocument, options);
      }
export type DeleteTestCaseMutationHookResult = ReturnType<typeof useDeleteTestCaseMutation>;
export type DeleteTestCaseMutationResult = Apollo.MutationResult<DeleteTestCaseMutation>;
export type DeleteTestCaseMutationOptions = Apollo.BaseMutationOptions<DeleteTestCaseMutation, DeleteTestCaseMutationVariables>;