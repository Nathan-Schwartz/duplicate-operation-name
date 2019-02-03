/*
  GRAPHQL
*/
declare module 'graphql-tag/parser' {
  import { Source, ParseOptions, DocumentNode } from 'graphql';
  // XXX figure out how to directly export this method
  function parse(
      source: Source | string,
      options?: ParseOptions,
  ): DocumentNode;
}

declare module 'graphql-tag/printer' {
  function print(ast: any): string;
}

declare module 'deep-assign' {
  function deepAssign(...objects: any[]): any;
  export = deepAssign;
}
