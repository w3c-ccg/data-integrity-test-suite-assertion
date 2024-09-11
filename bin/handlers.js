/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 */
import {parse, TextNode} from 'node-html-parser';
import {readFile} from 'node:fs/promises';
import {Visitor} from './Visitor.js';

export async function checkSpecText({specUrl, suiteLog}) {
  const specUrls = Array.isArray(specUrl) ? specUrl : [specUrl];
  const statements = [];
  const specVisitor = new Visitor({
    condition: textNodeWithMust,
    accumulator: statements,
    props: ['childNodes']
  });
  const tests = [];
  const testVisitor = new Visitor({
    condition: testWithTitle,
    accumulator: tests,
    props: ['suites', 'tests']
  });
  for(const url of specUrls) {
    await parseSpec({url, visitor: specVisitor});
  }
  let log;
  if(suiteLog) {
    log = JSON.parse(await readFile(suiteLog));
  }
  if(log) {
    testVisitor.visit({nodes: log.suites});
    testVisitor.visit({nodes: log.tests});
  }
  const testTitles = new Set(tests.map(test => test?.title));
  const normStatements = new Set(statements.map(s => s.text));
  console.log(`Test Title Count ${testTitles.size}`);
  console.log(`Normative Statement Count ${normStatements.size}`);
}

// the condition for the spec
function textNodeWithMust(node) {
  if(node instanceof TextNode) {
    const {text} = node;
    if(text.includes('MUST')) {
      return true;
    }
  }
  return false;
}

// the condition for the test results
function testWithTitle(node) {
  if(node?.type === 'test') {
    return true;
  }
  return false;
}

async function parseSpec({url, visitor}) {
  const response = await fetch(url);
  const html = await response.text();
  const spec = parse(html);
  return visitor.visit({nodes: spec.childNodes});
}
