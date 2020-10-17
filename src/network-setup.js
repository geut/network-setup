/**
 * @typedef { import("./network").OnPeer } OnPeer
 * @typedef { import("./network").OnConnection } OnConnection
 */

const generator = require('ngraph.generators')

const Network = require('./network')

class NetworkSetup {
  /**
   * @constructor
   * @param {object} opts
   * @param {OnPeer} opts.onPeer
   * @param {OnConnection} opts.onConnection
   */
  constructor (opts = {}) {
    const { onPeer, onConnection } = opts
    this._onPeer = onPeer
    this._onConnection = onConnection
  }

  /**
   * Generate a network from a graph.
   *
   * @param {NGraph} graph
   * @returns {Promise<Network>}
   */
  async generateFromGraph (graph) {
    const network = new Network({ onPeer: this._onPeer, onConnection: this._onConnection })

    const peers = []
    graph.forEachNode(node => {
      peers.push(network.addPeer(node.id, node.data))
    })
    await Promise.all(peers)

    const connections = []
    graph.forEachLink(link => {
      connections.push(network.addConnection(link.fromId, link.toId, link.data))
    })
    await Promise.all(connections)

    return network
  }

  /**
   * Ladder graph is a graph in form of ladder.
   *
   * @param {number} steps Steps in the ladder
   * @returns {Promise<Network>}
   */
  async ladder (steps) {
    return this.generateFromGraph(generator.ladder(steps))
  }

  /**
   * Circular ladder with n steps.
   *
   * @param {number} steps Steps in the ladder
   * @returns {Promise<Network>}
   */
  async circularLadder (steps) {
    return this.generateFromGraph(generator.circularLadder(steps))
  }

  /**
   * Complete graph Kn.
   *
   * @param {number} n Nodes in the complete graph
   * @returns {Promise<Network>}
   */
  async complete (n) {
    return this.generateFromGraph(generator.complete(n))
  }

  /**
   * Complete bipartite graph K n,m. Each node in the
   * first partition is connected to all nodes in the second partition.
   *
   * @param {number} n Nodes in the first graph partition
   * @param {number} m Nodes in the second graph partition
   * @returns {Promise<Network>}
   */
  async completeBipartite (n, m) {
    return this.generateFromGraph(generator.completeBipartite(n, m))
  }

  /**
   * Path graph with n steps.
   *
   * @param {number} n Nodes in the path
   * @returns {Promise<Network>}
   */
  async path (n) {
    return this.generateFromGraph(generator.path(n))
  }

  /**
   * Grid graph with n rows and m columns.
   *
   * @param {number} n Rows in the graph
   * @param {number} m Columns in the graph
   * @returns {Promise<Network>}
   */
  async grid (n, m) {
    return this.generateFromGraph(generator.grid(n, m))
  }

  /**
   * 3D grid with n rows and m columns and z levels.
   *
   * @param {number} n Rows in the graph
   * @param {number} m Columns in the graph
   * @param {number} z Levels in the graph
   * @returns {Promise<Network>}
   */
  async grid3 (n, m, z) {
    return this.generateFromGraph(generator.grid3(n, m, z))
  }

  /**
   * Balanced binary tree with n levels.
   *
   * @param {number} n Levels in the binary tree
   * @returns {Promise<Network>}
   */
  async balancedBinTree (n) {
    return this.generateFromGraph(generator.balancedBinTree(n))
  }

  /**
   * Graph with no links.
   *
   * @param {number} n Nodes in the graph
   * @returns {Promise<Network>}
   */
  async noLinks (n) {
    return this.generateFromGraph(generator.noLinks(n))
  }

  /**
   * A circular graph with cliques instead of individual nodes.
   *
   * @param {number} cliqueCount Cliques inside circle
   * @param {number} cliqueSize Nodes inside each clique
   * @returns {Promise<Network>}
   */
  async cliqueCircle (cliqueCount, cliqueSize) {
    return this.generateFromGraph(generator.cliqueCircle(cliqueCount, cliqueSize))
  }

  /**
   * Watts-Strogatz small-world graph.
   *
   * @param {Number} n Nodes
   * @param {Number} k Each node is connected to k nearest neighbors in ring topology
   * @param {Number} p The probability of rewiring each edge
   * @returns {Promise<Network>}
   */
  async wattsStrogatz (n, k, p) {
    return this.generateFromGraph(generator.wattsStrogatz(n, k, p))
  }
}

module.exports = NetworkSetup
