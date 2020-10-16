const assert = require('nanocustomassert')
const { NanoresourcePromise } = require('nanoresource-promise/emitter')

class Peer extends NanoresourcePromise {
  /**
   * @constructor
   * @param {*} id
   * @param {{ open: () => Promise, close: () => Promise, extended: object }} [data]
   */
  constructor (id, data = {}) {
    assert(id !== undefined, 'id required')

    const { open, close, extended } = data
    super({ open, close })

    /** @type {*} */
    this.id = id
    /** @type {object} */
    this.extended = extended
  }
}

module.exports = Peer
