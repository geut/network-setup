/**
 * @typedef { import("./network").Node } Node
 */

const assert = require('nanocustomassert')
const { NanoresourcePromise } = require('nanoresource-promise/emitter2')

class Peer extends NanoresourcePromise {
  /**
   * @constructor
   * @param {Node} node
   * @param {object} [opts]
   */
  constructor (node, opts) {
    assert(node && node.id !== undefined, 'node.id required')

    super(opts)

    /** @type {Node} */
    this.ref = node
  }

  /**
   * @type {*}
   */
  get id () {
    return this.ref.id
  }
}

module.exports = Peer
