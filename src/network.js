const { EventEmitter } = require('events')
const createGraph = require('ngraph.graph')
const assert = require('nanocustomassert')

const Peer = require('./peer')
const Connection = require('./connection')

/**
 * @callback OnPeer
 * @param {*} peerId
 * @param {object} data
 * @returns {Promise<PeerData>}
 */

/**
 * @callback OnConnection
 * @param {Peer} fromPeer
 * @param {Peer} toPeer
 * @param {object} data
 * @returns {Promise<ConnectionData>}
 */

class Network extends EventEmitter {
  /**
   * @constructor
   * @param {object} opts
   * @param {OnPeer} opts.onPeer
   * @param {OnConnection} opts.onConnection
   */
  constructor (opts = {}) {
    super()

    const { onPeer, onConnection } = opts

    assert(typeof onPeer === 'function', 'onPeer is required')
    assert(typeof onConnection === 'function', 'onConnection is required')

    this.graph = createGraph({ multigraph: true })
    this._onPeer = onPeer
    this._onConnection = onConnection

    this.graph.on('changed', (changes) => {
      changes.forEach(change => {
        const { changeType, node, link } = change

        if (changeType === 'add') {
          let data
          if (node) {
            const peer = this._onPeer(node.id, node.data)
            data = node.data = peer instanceof Peer ? peer : new Peer(node.id, peer)
          } else {
            const fromPeer = this.getPeer(link.fromId)
            const toPeer = this.getPeer(link.toId)
            const conn = this._onConnection(fromPeer, toPeer, link.data)
            data = link.data = conn instanceof Connection ? conn : new Connection(fromPeer, toPeer, conn)
          }

          data.open().catch(err => {
            process.nextTick(() => {
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
            process.nextTick(() => {
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
    const peer = this.graph.getNode(peerId)
    return peer && peer.data
  }

  /**
   * @param {*} peerId
   * @returns {Array<Connection>}
   */
  getConnectionsFromPeer (peerId) {
    const connections = []
    this.graph.forEachLinkedNode(peerId, function (_, link) {
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
    const node = this.graph.addNode(peerId, data)
    await node.data.open()
    return node.data
  }

  /**
   * @param {*} peerId
   * @returns {Promise}
   */
  async deletePeer (peerId) {
    const node = this.graph.getNode(peerId)
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
    const link = this.graph.addLink(fromId, toId, data)
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
