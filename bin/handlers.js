/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 */
import {parse, TextNode} from 'node-html-parser';
import {writeFile} from 'node:fs/promises';

export async function checkSpecText({specUrl, suiteLog}) {
  const specUrls = Array.isArray(specUrl) ? specUrl : [specUrl];
  for(const url of specUrls) {
    parseSpec(url);
  }
}

function visit(nodes) {
  for(const node of nodes) {
    if(node instanceof TextNode) {
      const {text} = node;
      if(text.includes('MUST')) {
        console.log(text);
      }
    }
    visit(node.childNodes);
  }
}

async function parseSpec(url) {
  const response = await fetch(url);
  const html = await response.text();
  const spec = parse(html);
  visit(spec.childNodes);
}
