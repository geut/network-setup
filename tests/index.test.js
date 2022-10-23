const { test } = require('uvu')
const assert = require('uvu/assert')
const { spy } = require('tinyspy')
const { NetworkSetup, Peer, Connection } = require('..')

test('basic', async () => {
  const onPeer = spy()
  const onConnection = spy()

  const setup = new NetworkSetup({
    onPeer (node) {
      onPeer()

      const peer = new Peer(node)
      peer.name = node.id
      return peer
    },
    onConnection
  })

  const network = await setup.complete(3)

  const [, fromPeer, toPeer] = onConnection.calls[0]

  assert.equal(fromPeer.id, fromPeer.name)
  assert.equal(toPeer.id, toPeer.name)

  assert.is(network.peers.length, 3)
  assert.is(network.connections.length, 3)
  assert.is(onPeer.callCount, 3)
})

test('resource live', async () => {
  const peerFn = {
    open: spy(),
    close: spy()
  }

  const connectionFn = {
    open: spy(),
    close: spy()
  }

  const setup = new NetworkSetup({
    onPeer (node) {
      return new Peer(node, peerFn)
    },
    onConnection (link) {
      return new Connection(link, connectionFn)
    }
  })

  const network = await setup.complete(3)

  assert.equal(network.peers.map(p => p.id), [0, 1, 2])
  assert.is(network.connections.length, 3)

  let connections = network.getConnectionsFromPeer(0)
  assert.is(connections.length, 2)

  await network.deleteConnection(connections[0])
  connections = network.getConnectionsFromPeer(0)
  assert.is(connections.length, 1)

  await connections[0].close()
  assert.is(network.getConnectionsFromPeer(0).length, 0)

  assert.is(network.peers.length, 3)
  await network.deletePeer(0)
  assert.is(network.peers.length, 2)

  assert.is(network.connections.length, 1)
  await network.deletePeer(1)
  assert.is(network.peers.length, 1)
  assert.is(network.connections.length, 0)

  assert.is(peerFn.open.callCount, 3)
  assert.is(peerFn.close.callCount, 2)
  assert.is(connectionFn.open.callCount, 3)
  assert.is(connectionFn.close.callCount, 3)
})

test('change id', async () => {
  const setup = new NetworkSetup({
    onPeer (node) {},
    onConnection (_, fromPeer, toPeer) {},
    onId (id) {
      return id + 'changed'
    }
  })

  const network = await setup.complete(2)
  assert.equal(network.peers.map(p => p.id), ['0changed', '1changed'])
  assert.equal(network.connections.map(c => ({ fromId: c.fromId, toId: c.toId })), [{ fromId: '0changed', toId: '1changed' }])
})

test.run()
