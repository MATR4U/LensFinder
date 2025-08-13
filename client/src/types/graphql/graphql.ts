/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
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
};

export type Camera = {
  __typename?: 'Camera';
  brand?: Maybe<Scalars['String']['output']>;
  ibis?: Maybe<Scalars['Boolean']['output']>;
  mount?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  price_chf?: Maybe<Scalars['Float']['output']>;
  sensor?: Maybe<Sensor>;
  source_url?: Maybe<Scalars['String']['output']>;
  weight_g?: Maybe<Scalars['Float']['output']>;
};

export type Lens = {
  __typename?: 'Lens';
  aperture_max?: Maybe<Scalars['Float']['output']>;
  aperture_min?: Maybe<Scalars['Float']['output']>;
  brand?: Maybe<Scalars['String']['output']>;
  coverage?: Maybe<Scalars['String']['output']>;
  distortion_pct?: Maybe<Scalars['Float']['output']>;
  focal_max_mm?: Maybe<Scalars['Float']['output']>;
  focal_min_mm?: Maybe<Scalars['Float']['output']>;
  focus_breathing_score?: Maybe<Scalars['Float']['output']>;
  is_macro?: Maybe<Scalars['Boolean']['output']>;
  mount?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  ois?: Maybe<Scalars['Boolean']['output']>;
  price_chf?: Maybe<Scalars['Float']['output']>;
  source_url?: Maybe<Scalars['String']['output']>;
  weather_sealed?: Maybe<Scalars['Boolean']['output']>;
  weight_g?: Maybe<Scalars['Float']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  report?: Maybe<Report>;
};


export type MutationReportArgs = {
  cameraName: Scalars['String']['input'];
  goal: Scalars['String']['input'];
  top: Array<ReportItemInput>;
};

export type Query = {
  __typename?: 'Query';
  cameras?: Maybe<Array<Maybe<Camera>>>;
  lenses?: Maybe<Array<Maybe<Lens>>>;
  price?: Maybe<Scalars['String']['output']>;
};


export type QueryPriceArgs = {
  url: Scalars['String']['input'];
};

export type Report = {
  __typename?: 'Report';
  cameraName?: Maybe<Scalars['String']['output']>;
  goal?: Maybe<Scalars['String']['output']>;
  items?: Maybe<Array<Maybe<ReportItem>>>;
  summary?: Maybe<Scalars['String']['output']>;
  verdicts?: Maybe<Array<Maybe<ReportVerdict>>>;
};

export type ReportItem = {
  __typename?: 'ReportItem';
  name?: Maybe<Scalars['String']['output']>;
  price_chf?: Maybe<Scalars['Float']['output']>;
  rank?: Maybe<Scalars['Float']['output']>;
  score?: Maybe<Scalars['Float']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  weight_g?: Maybe<Scalars['Float']['output']>;
};

export type ReportItemInput = {
  name: Scalars['String']['input'];
  price_chf: Scalars['Float']['input'];
  total: Scalars['Float']['input'];
  type: Scalars['String']['input'];
  weight_g: Scalars['Float']['input'];
};

export type ReportVerdict = {
  __typename?: 'ReportVerdict';
  label?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type Sensor = {
  __typename?: 'Sensor';
  coc_mm?: Maybe<Scalars['Float']['output']>;
  crop?: Maybe<Scalars['Float']['output']>;
  height_mm?: Maybe<Scalars['Float']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  width_mm?: Maybe<Scalars['Float']['output']>;
};

export type GetCamerasQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCamerasQuery = { __typename?: 'Query', cameras?: Array<{ __typename?: 'Camera', name?: string | null, brand?: string | null, mount?: string | null, ibis?: boolean | null, price_chf?: number | null, weight_g?: number | null, source_url?: string | null, sensor?: { __typename?: 'Sensor', name?: string | null, width_mm?: number | null, height_mm?: number | null, coc_mm?: number | null, crop?: number | null } | null } | null> | null };

export type GetLensesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLensesQuery = { __typename?: 'Query', lenses?: Array<{ __typename?: 'Lens', name?: string | null, brand?: string | null, mount?: string | null, coverage?: string | null, focal_min_mm?: number | null, focal_max_mm?: number | null, aperture_min?: number | null, aperture_max?: number | null, weight_g?: number | null, ois?: boolean | null, price_chf?: number | null, weather_sealed?: boolean | null, is_macro?: boolean | null, distortion_pct?: number | null, focus_breathing_score?: number | null, source_url?: string | null } | null> | null };

export type CreateReportMutationVariables = Exact<{
  cameraName: Scalars['String']['input'];
  goal: Scalars['String']['input'];
  top: Array<ReportItemInput> | ReportItemInput;
}>;


export type CreateReportMutation = { __typename?: 'Mutation', report?: { __typename?: 'Report', cameraName?: string | null, goal?: string | null, summary?: string | null, items?: Array<{ __typename?: 'ReportItem', rank?: number | null, name?: string | null, score?: number | null, type?: string | null, weight_g?: number | null, price_chf?: number | null } | null> | null, verdicts?: Array<{ __typename?: 'ReportVerdict', label?: string | null, name?: string | null } | null> | null } | null };


export const GetCamerasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCameras"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cameras"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"mount"}},{"kind":"Field","name":{"kind":"Name","value":"sensor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"width_mm"}},{"kind":"Field","name":{"kind":"Name","value":"height_mm"}},{"kind":"Field","name":{"kind":"Name","value":"coc_mm"}},{"kind":"Field","name":{"kind":"Name","value":"crop"}}]}},{"kind":"Field","name":{"kind":"Name","value":"ibis"}},{"kind":"Field","name":{"kind":"Name","value":"price_chf"}},{"kind":"Field","name":{"kind":"Name","value":"weight_g"}},{"kind":"Field","name":{"kind":"Name","value":"source_url"}}]}}]}}]} as unknown as DocumentNode<GetCamerasQuery, GetCamerasQueryVariables>;
export const GetLensesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lenses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"brand"}},{"kind":"Field","name":{"kind":"Name","value":"mount"}},{"kind":"Field","name":{"kind":"Name","value":"coverage"}},{"kind":"Field","name":{"kind":"Name","value":"focal_min_mm"}},{"kind":"Field","name":{"kind":"Name","value":"focal_max_mm"}},{"kind":"Field","name":{"kind":"Name","value":"aperture_min"}},{"kind":"Field","name":{"kind":"Name","value":"aperture_max"}},{"kind":"Field","name":{"kind":"Name","value":"weight_g"}},{"kind":"Field","name":{"kind":"Name","value":"ois"}},{"kind":"Field","name":{"kind":"Name","value":"price_chf"}},{"kind":"Field","name":{"kind":"Name","value":"weather_sealed"}},{"kind":"Field","name":{"kind":"Name","value":"is_macro"}},{"kind":"Field","name":{"kind":"Name","value":"distortion_pct"}},{"kind":"Field","name":{"kind":"Name","value":"focus_breathing_score"}},{"kind":"Field","name":{"kind":"Name","value":"source_url"}}]}}]}}]} as unknown as DocumentNode<GetLensesQuery, GetLensesQueryVariables>;
export const CreateReportDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateReport"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cameraName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"goal"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"top"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReportItemInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"report"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"cameraName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cameraName"}}},{"kind":"Argument","name":{"kind":"Name","value":"goal"},"value":{"kind":"Variable","name":{"kind":"Name","value":"goal"}}},{"kind":"Argument","name":{"kind":"Name","value":"top"},"value":{"kind":"Variable","name":{"kind":"Name","value":"top"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cameraName"}},{"kind":"Field","name":{"kind":"Name","value":"goal"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rank"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"weight_g"}},{"kind":"Field","name":{"kind":"Name","value":"price_chf"}}]}},{"kind":"Field","name":{"kind":"Name","value":"verdicts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"summary"}}]}}]}}]} as unknown as DocumentNode<CreateReportMutation, CreateReportMutationVariables>;