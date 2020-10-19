const { NetworkSetup, Peer, Connection } = require('..')

test('basic', async () => {
  expect.assertions(9)

  const onPeer = jest.fn()

  const setup = new NetworkSetup({
    onPeer (node) {
      onPeer()

      const peer = new Peer(node)
      peer.name = node.id
      return peer
    },
    onConnection (_, fromPeer, toPeer) {
      expect(fromPeer.id).toBe(fromPeer.name)
      expect(toPeer.id).toBe(toPeer.name)
    }
  })

  const network = await setup.complete(3)

  expect(network.peers.length).toBe(3)
  expect(network.connections.length).toBe(3)
  expect(onPeer).toHaveBeenCalledTimes(3)
})

test('resource live', async () => {
  const peerFn = {
    open: jest.fn(),
    close: jest.fn()
  }

  const connectionFn = {
    open: jest.fn(),
    close: jest.fn()
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

  expect(network.peers.map(p => p.id)).toEqual([0, 1, 2])
  expect(network.connections.length).toBe(3)

  let connections = network.getConnectionsFromPeer(0)
  expect(connections.length).toBe(2)

  await network.deleteConnection(connections[0])
  connections = network.getConnectionsFromPeer(0)
  expect(connections.length).toBe(1)

  await connections[0].close()
  expect(network.getConnectionsFromPeer(0).length).toBe(0)

  expect(network.peers.length).toBe(3)
  await network.deletePeer(0)
  expect(network.peers.length).toBe(2)

  expect(network.connections.length).toBe(1)
  await network.deletePeer(1)
  expect(network.peers.length).toBe(1)
  expect(network.connections.length).toBe(0)

  expect(peerFn.open).toHaveBeenCalledTimes(3)
  expect(peerFn.close).toHaveBeenCalledTimes(2)
  expect(connectionFn.open).toHaveBeenCalledTimes(3)
  expect(connectionFn.close).toHaveBeenCalledTimes(3)
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
  expect(network.peers.map(p => p.id)).toEqual(['0changed', '1changed'])
  expect(network.connections.map(c => ({ fromId: c.fromId, toId: c.toId }))).toEqual([{ fromId: '0changed', toId: '1changed' }])
})
