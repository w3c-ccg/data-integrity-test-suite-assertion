/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 */
export class Visitor {
  /**
   * A Visitor traverses nodes in a graph.
   *
   * @param {object} options - Options for the Class.
   * @param {Function<boolean>} options.condition - The condition a node must
   * pass to be included in the accumulator.
   * @param {Array} options.accumulator - An accumulator to store matching
   * nodes in.
   * @param {Array<string>} options.props - The props to recur on.
   */
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

