// This file implements the extractgql CLI tool.

import fs = require('fs');
import path = require('path');

import {
  parse,
  DocumentNode,
  OperationDefinitionNode,
  FragmentDefinitionNode,
  print,
  DefinitionNode,
  separateOperations,
} from 'graphql';

import {
  getOperationDefinitions,
  getFragmentNames,
  isFragmentDefinition,
  isOperationDefinition,
} from './extractFromAST';

import {
  findTaggedTemplateLiteralsInJS,
  eliminateInterpolations,
} from './extractFromJS';

import {
  getQueryKey,
  sortFragmentsByName,
  applyQueryTransformers,
  TransformedQueryWithId,
  QueryTransformer,
} from './common';

import _ = require('lodash');

export type ExtractGQLOptions = {
  inputFilePath: string,
  extensions: string[],
  literalTag: string,
};

export class ExtractGQL {
  public inputFilePath: string;

  // Starting point for monotonically increasing query ids.
  public queryId: number = 0;

  // The file extension to load queries from
  public extensions: string[];

  public duplicateOperationNames: string[];

  // The template literal tag for GraphQL queries in JS code
  public literalTag: string;

  // Given a file path, this returns the extension of the file within the
  // file path.
  public static getFileExtension(filePath: string): string {
    const pieces = path.basename(filePath).split('.');
    if (pieces.length <= 1) {
      return '';
    }
    return pieces[pieces.length - 1];
  }

  // Reads a file into a string.
  public static readFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error('error reading gql file', err);
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  // Checks if a given path points to a directory.
  public static isDirectory(path2: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      fs.stat(path2, (err, stats) => {
        if (err) {
          reject(err);
        } else {
          resolve(stats.isDirectory());
        }
      });
    });
  }

  constructor({
    inputFilePath,
    extensions,
    literalTag,
  }: ExtractGQLOptions) {
    this.inputFilePath = inputFilePath;
    this.extensions = extensions;
    this.literalTag = literalTag;
  }

  // Creates an OutputMap from an array of GraphQL documents read as strings.
  public checkForDuplicateOperations(docString: string): void {
    if (!docString) {
      console.log('\n\nNo queries found.');
      return;
    }

    const doc = parse(docString);

    const names = doc.definitions.map((element) => {
      // @ts-ignore
      return element.name && element.name.value;
    });

    const counts = names
      .filter(Boolean)
      .reduce((acc, cur) => {
        acc[cur] = acc[cur] ? acc[cur] + 1 : 1;
        return acc;
      }, {});

    const duplicates = [];

    for (const key of Object.keys(counts)) {
      if (counts[key] > 1) {
        duplicates.push({ name: key, count: counts[key] });
      }
    }

    if (duplicates.length > 0) {
      throw new Error(`Found duplicate operation names:\n ${duplicates.map(cur => `  ${cur.count} x ${cur.name}\n` )}`);
    } else {
      console.log('\nNo duplicates found!');
    }
  }

  public readGraphQLFile(graphQLFile: string): Promise<string> {
    return ExtractGQL.readFile(graphQLFile);
  }

  public readInputFile(inputFile: string): Promise<string> {
    return Promise.resolve().then(() => {
      const extension = ExtractGQL.getFileExtension(inputFile);

      if (this.extensions.some(cur => cur === extension)) {
        if (['js', 'jsx', 'ts', 'tsx'].some(cur => cur === extension)) {
          // Read from a JS file
          return ExtractGQL.readFile(inputFile).then((result) => {
            const literalContents = findTaggedTemplateLiteralsInJS(result, this.literalTag);
            const noInterps = literalContents.map(eliminateInterpolations);
            const joined = noInterps.join('\n');
            return joined;
          });
        } else if (extension === 'graphql') {
          return this.readGraphQLFile(inputFile);
        }
      }
      return '';
    });
  }

  // Processes an input path, which may be a path to a GraphQL file
  // or a directory containing GraphQL files. Creates an OutputMap
  // instance from these files.
  public processInputPath(inputPath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.readInputPath(inputPath).then((docString: string) => {
        try {
          this.checkForDuplicateOperations(docString);
          resolve();
        } catch (e) {
          reject(e);
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }

  public readInputPath(inputPath: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      ExtractGQL.isDirectory(inputPath).then((isDirectory) => {
        if (isDirectory) {
          console.log(`Crawling ${inputPath}`);
          // Recurse over the files within this directory.
          fs.readdir(inputPath, (err, items) => {
            if (err) {
              reject(err);
            }
            const promises: Promise<string>[] = items.map((item) => {
              return this.readInputPath(path.resolve(inputPath, item));
            });

            Promise.all(promises).then((queryStrings: string[]) => {
              resolve(queryStrings.reduce((x, y) => x + y, ''));
            });
          });
        } else {
          this.readInputFile(inputPath).then((result: string) => {
            resolve(result);
          }).catch((err) => {
            console.log(`Error occurred in processing path ${inputPath}: `);
            console.log(err.message);
            reject(err);
          });
        }
      });
    });
  }

  // Extracts GraphQL queries from this.inputFilePath and produces
  // an output JSON file in this.outputFilePath.
  public extract() {
    return this.processInputPath(this.inputFilePath);
  }
}

// Type for the argument structure provided by the "yargs" library.
export interface YArgsv {
  _: string[];
  [ key: string ]: any;
}

// Main driving method for the command line tool
export const main = (argv: YArgsv) => {
  // These are the unhypenated arguments that yargs does not process
  // further.
  const args: string[] = argv._;
  let inputFilePath: string;
  let outputFilePath: string;

  if (args.length < 1) {
    console.log('Usage: duplicate-operation-name <input_path> [--graphql] [--js] [--ts]');
  } else {
    inputFilePath = path.resolve(args[0]);
  }

  const options: ExtractGQLOptions = {
    inputFilePath,
    extensions: [],
    literalTag: 'gql',
  };

  if (argv['js']) {
    options.extensions.push('js', 'jsx');
  }

  if (argv['graphql']) {
    options.extensions.push('graphql');
  }

  if (argv['ts']) {
    options.extensions.push('ts', 'tsx');
  }

  if (argv['literalTag']) {
    options.literalTag = argv['literalTag'];
  }

  if (options.extensions.length === 0) {
    throw new Error('Must specify --js, --graphql, --ts, or both.');
  }

  return new ExtractGQL(options).extract();
};
