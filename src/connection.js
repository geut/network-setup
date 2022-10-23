/**
 * @typedef { import("./network").Link } Link
 */

const assert = require('nanocustomassert')
const { NanoresourcePromise } = require('nanoresource-promise/emitter2')

class Connection extends NanoresourcePromise {
  /**
   * @constructor
   * @param {Link} link
   * @param {object} [opts]
   */
  constructor (link, opts) {
    assert(link, 'link is required')
    assert(link.id !== undefined, 'link.id is required')
    assert(link.fromId !== undefined, 'link.fromId is required')
    assert(link.toId !== undefined, 'link.toId is required')

    super(opts)

    /** @type {object} */
    this.ref = link
  }

  /**
   * @type {string}
   */
  get id () {
    return this.ref.id
  }

  /**
   * @type {*}
   */
  get fromId () {
    return this.ref.fromId
  }

  /**
   * @type {*}
   */
  get toId () {
    return this.ref.toId
  }
}

module.exports = Connection
