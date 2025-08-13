/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
const documents = {
    "query GetCameras {\n  cameras {\n    name\n    brand\n    mount\n    sensor {\n      name\n      width_mm\n      height_mm\n      coc_mm\n      crop\n    }\n    ibis\n    price_chf\n    weight_g\n    source_url\n  }\n}\n\nquery GetLenses {\n  lenses {\n    name\n    brand\n    mount\n    coverage\n    focal_min_mm\n    focal_max_mm\n    aperture_min\n    aperture_max\n    weight_g\n    ois\n    price_chf\n    weather_sealed\n    is_macro\n    distortion_pct\n    focus_breathing_score\n    source_url\n  }\n}\n\nmutation CreateReport($cameraName: String!, $goal: String!, $top: [ReportItemInput!]!) {\n  report(cameraName: $cameraName, goal: $goal, top: $top) {\n    cameraName\n    goal\n    items {\n      rank\n      name\n      score\n      type\n      weight_g\n      price_chf\n    }\n    verdicts {\n      label\n      name\n    }\n    summary\n  }\n}": types.GetCamerasDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query GetCameras {\n  cameras {\n    name\n    brand\n    mount\n    sensor {\n      name\n      width_mm\n      height_mm\n      coc_mm\n      crop\n    }\n    ibis\n    price_chf\n    weight_g\n    source_url\n  }\n}\n\nquery GetLenses {\n  lenses {\n    name\n    brand\n    mount\n    coverage\n    focal_min_mm\n    focal_max_mm\n    aperture_min\n    aperture_max\n    weight_g\n    ois\n    price_chf\n    weather_sealed\n    is_macro\n    distortion_pct\n    focus_breathing_score\n    source_url\n  }\n}\n\nmutation CreateReport($cameraName: String!, $goal: String!, $top: [ReportItemInput!]!) {\n  report(cameraName: $cameraName, goal: $goal, top: $top) {\n    cameraName\n    goal\n    items {\n      rank\n      name\n      score\n      type\n      weight_g\n      price_chf\n    }\n    verdicts {\n      label\n      name\n    }\n    summary\n  }\n}"): (typeof documents)["query GetCameras {\n  cameras {\n    name\n    brand\n    mount\n    sensor {\n      name\n      width_mm\n      height_mm\n      coc_mm\n      crop\n    }\n    ibis\n    price_chf\n    weight_g\n    source_url\n  }\n}\n\nquery GetLenses {\n  lenses {\n    name\n    brand\n    mount\n    coverage\n    focal_min_mm\n    focal_max_mm\n    aperture_min\n    aperture_max\n    weight_g\n    ois\n    price_chf\n    weather_sealed\n    is_macro\n    distortion_pct\n    focus_breathing_score\n    source_url\n  }\n}\n\nmutation CreateReport($cameraName: String!, $goal: String!, $top: [ReportItemInput!]!) {\n  report(cameraName: $cameraName, goal: $goal, top: $top) {\n    cameraName\n    goal\n    items {\n      rank\n      name\n      score\n      type\n      weight_g\n      price_chf\n    }\n    verdicts {\n      label\n      name\n    }\n    summary\n  }\n}"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;