/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 */
import {parse, TextNode} from 'node-html-parser';
import {readFile} from 'node:fs/promises';

class Visitor {
  constructor({condition, accumulator}) {
    this.condition = condition;
    this.accumulator = accumulator;
  }
  visit({nodes}) {
    for(const node of nodes) {
      if(this.condition(node)) {
        this.accumulator.push(node);
      }
      this.visit({nodes: node.childNodes});
    }
  }
}

export async function checkSpecText({specUrl, suiteLog}) {
  const specUrls = Array.isArray(specUrl) ? specUrl : [specUrl];
  const accumulator = [];
  const visitor = new Visitor({
    condition: textNodeWithMust,
    accumulator
  });
  for(const url of specUrls) {
    await parseSpec({url, visitor});
  }
  if(suiteLog) {
    const log = JSON.parse(await readFile(suiteLog));
  }
  //console.log(accumulator);
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

}

async function parseSpec({url, visitor}) {
  const response = await fetch(url);
  const html = await response.text();
  const spec = parse(html);
  return visitor.visit({nodes: spec.childNodes});
}
