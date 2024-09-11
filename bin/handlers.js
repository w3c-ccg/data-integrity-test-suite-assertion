/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 */
import {parse, TextNode} from 'node-html-parser';
import {readFile} from 'node:fs/promises';

class Visitor {
  constructor({condition, accumulator, props}) {
    this.condition = condition;
    this.accumulator = accumulator;
    this.props = props;
  }
  visit({nodes}) {
    for(const node of nodes) {
      if(this.condition(node)) {
        this.accumulator.push(node);
      }
      for(const prop of this.props) {
        if(node[prop]) {
          this.visit({nodes: node[prop]});
        }
      }
    }
  }
}

export async function checkSpecText({specUrl, suiteLog}) {
  const specUrls = Array.isArray(specUrl) ? specUrl : [specUrl];
  const nodes = [];
  const specVisitor = new Visitor({
    condition: textNodeWithMust,
    accumulator: nodes,
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
  //console.log(accumulator);
  if(log) {
    testVisitor.visit({nodes: log.suites});
    testVisitor.visit({nodes: log.tests});
  }
  const testTitles = new Set(tests.map(test => test?.title));
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
