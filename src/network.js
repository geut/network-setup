/**
 * @typedef Node
 * @prop {*} id
 * @prop {*} data
 */

/**
 * @typedef Link
 * @prop {string} id
 * @prop {*} fromId
 * @prop {*} toId
 * @prop {*} data
 */

/**
 * @callback OnPeer
 * @param {Node} node
 * @returns {Promise<Peer>}
 */

/**
 * @callback OnConnection
 * @param {Link} link
 * @param {Peer} fromPeer
 * @param {Peer} toPeer
 * @returns {Promise<Connection>}
 */

/**
 * @callback OnId
 * @param {*} id
 * @returns {*}
 */

const { EventEmitter } = require('events')
const createGraph = require('ngraph.graph')
const assert = require('nanocustomassert')

const Peer = require('./peer')
const Connection = require('./connection')

class Network extends EventEmitter {
  /**
   * @constructor
   * @param {object} opts
   * @param {OnPeer} opts.onPeer
   * @param {OnConnection} opts.onConnection
   */
  constructor (opts = {}) {
    super()

    const { onPeer, onConnection, onId = (id) => id } = opts

    assert(typeof onPeer === 'function', 'onPeer is required')
    assert(typeof onConnection === 'function', 'onConnection is required')

    this.graph = createGraph({ multigraph: true })
    this._onPeer = onPeer
    this._onConnection = onConnection
    this._onId = onId

    this.graph.on('changed', (changes) => {
      changes.forEach(change => {
        const { changeType, node, link } = change

        if (changeType === 'add') {
          let data
          if (node) {
            data = node.data = this._onPeer(node) || new Peer(node)
            assert(data instanceof Peer, 'onPeer needs to return a Peer instance')
          } else {
            data = link.data = this._onConnection(link, this.getPeer(link.fromId), this.getPeer(link.toId)) || new Connection(link)
            assert(data instanceof Connection, 'onConnection needs to return a Connection instance')
          }

          data.open().catch(err => {
            queueMicrotask(() => {
              this.emit('error', err)
            })
          })

          data.on('closed', () => {
            if (node) {
              this.graph.removeNode(node.id)
            } else {
              this.graph.removeLink(link)
            }
          })

          return
        }

        if (changeType === 'remove') {
          (node || link).data.close().catch(err => {
            queueMicrotask(() => {
              this.emit('error', err)
            })
          })
        }
      })
    })
  }

  /**
   * @type {Array<Peer>}
   */
  get peers () {
    const peers = []
    this.graph.forEachNode(function (node) {
      peers.push(node.data)
    })
    return peers
  }

  /**
   * @type {Array<Connection>}
   */
  get connections () {
    const connections = []
    this.graph.forEachLink(function (link) {
      connections.push(link.data)
    })
    return connections
  }

  /**
   * @param {*} peerId
   * @returns {Peer|undefined}
   */
  getPeer (peerId) {
    const peer = this.graph.getNode(this._onId(peerId))
    return peer && peer.data
  }

  /**
   * @param {*} peerId
   * @returns {Array<Connection>}
   */
  getConnectionsFromPeer (peerId) {
    const connections = []
    this.graph.forEachLinkedNode(this._onId(peerId), function (_, link) {
      connections.push(link.data)
    })
    return connections
  }

  /**
   * @param {*} peerId
   * @param {*} [data]
   * @returns {Promise<Peer>}
   */
  async addPeer (peerId, data = {}) {
    const node = this.graph.addNode(this._onId(peerId), data)
    await node.data.open()
    return node.data
  }

  /**
   * @param {*} peerId
   * @returns {Promise}
   */
  async deletePeer (peerId) {
    const node = this.graph.getNode(this._onId(peerId))
    if (!node) return

    return node.data.close()
  }

  /**
   * @param {*} fromId
   * @param {*} toId
   * @param {*} [data]
   * @returns {Promise<Connection>}
   */
  async addConnection (fromId, toId, data = {}) {
    const link = this.graph.addLink(this._onId(fromId), this._onId(toId), data)
    await link.data.open()
    return link.data
  }

  /**
   * @param {Connection} connection
   * @returns {Promise}
   */
  async deleteConnection (connection) {
    return connection.close()
  }
}

module.exports = Network
