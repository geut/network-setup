const assert = require('nanocustomassert')
const { NanoresourcePromise } = require('nanoresource-promise/emitter')

/**
 * @typedef { import("./peer").Peer } Peer
 */

class Connection extends NanoresourcePromise {
  /**
   * @constructor
   * @param {Peer} fromPeer
   * @param {Peer} toPeer
   * @param {{ open: () => Promise, close: () => Promise, extended: object }} [data]
   */
  constructor (fromPeer, toPeer, data = {}) {
    assert(fromPeer, 'fromPeer is required')
    assert(toPeer, 'toPeer is required')

    const { open, close, extended } = data

    super({ open, close })

    /** @type Peer */
    this.fromPeer = fromPeer
    /** @type Peer */
    this.toPeer = toPeer
    /** @type {object} */
    this.extended = extended
  }
}

module.exports = Connection
