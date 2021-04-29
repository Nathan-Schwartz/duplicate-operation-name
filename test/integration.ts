import { resolve } from 'path';
import * as chai from 'chai';
const { expect, assert } = chai;

import {
  ExtractGQL,
} from '../src/ExtractGQL';

import {
  parse,
  print,
  OperationDefinitionNode,
  DocumentNode,
} from 'graphql';

import gql from 'graphql-tag';

const fixturesPath = resolve(__dirname, '..', '..', 'test', 'fixtures');

describe('ExtractGQL', () => {
  it('should be able to construct an instance', () => {
    return assert.doesNotThrow(() => {
      return new ExtractGQL({
        inputFilePath: resolve(fixturesPath, 'no_queries'),
        extensions: ['graphql', 'js'],
        literalTag: 'gql',
      });
    });
  });

  it(`should not throw if no queries are present`, () => {
    return assert.doesNotThrow(() => {
      return new ExtractGQL({
        inputFilePath: resolve(fixturesPath, 'no_queries'),
        extensions: ['graphql', 'js'],
        literalTag: 'gql',
      }).extract();
    });
  });

  generateTest({ extension: 'js', queryType: 'commented', outcome: 'single' });
  generateTest({ extension: 'ts', queryType: 'commented', outcome: 'single' });
  generateTest({ extension: 'graphql', queryType: 'commented', outcome: 'single' });

  // Variations of the test
  const outcomes = ['single', 'duplicate'];
  const queryTypes = ['fragment', 'query', 'mutation'];
  const extensions = ['graphql', 'js', 'ts', 'all'];

  for (const outcome of outcomes) {
    for (const queryType of queryTypes) {
      for (const extension of extensions) {
        generateTest({ extension, queryType, outcome });
      }
    }
  }
});

type TestBuilderInput = { queryType: string, outcome: string, extension: string };

function generateTest(data: TestBuilderInput): void {
  const { queryType, outcome, extension } = data;

  const shouldThrow = outcome === 'duplicate';
  it(`[${outcome}][${queryType}][${extension}] should ${shouldThrow ? '' : 'not '}throw`, () => {
    const method = shouldThrow ? 'throws' : 'doesNotThrow';

    const extensionMap: { [key: string]: Array<string> } = {
      all: ['graphql', 'js', 'jsx', 'ts', 'tsx'],
      js: ['js', 'jsx'],
      ts: ['ts', 'tsx'],
      graphql: ['graphql'],
    };

    const options = {
      inputFilePath: resolve(fixturesPath, `${outcome}_${queryType}_${extension}`) + '/',
      extensions: extensionMap[extension],
      literalTag: 'gql',
    };

    return new ExtractGQL(options)
      .extract()
      .then(
        () => {
          if (shouldThrow) {
            assert.fail('Was expected to throw');
          } else {
            expect(true).equal(true);
          }
        }, (e: Error) => {
          if (shouldThrow) {
            expect(true).equal(true);
          } else {
            console.error(e);
            assert.fail('Was expected to not throw');
          }
        },
      );
  });
}
