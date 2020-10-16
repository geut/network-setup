const { NetworkSetup } = require('..')

test('basic', async () => {
  expect.assertions(9)

  const onPeer = jest.fn()

  const setup = new NetworkSetup({
    onPeer (peerId) {
      onPeer()

      return {
        extended: {
          name: peerId
        }
      }
    },
    onConnection (fromPeer, toPeer) {
      expect(fromPeer.id).toBe(fromPeer.extended.name)
      expect(toPeer.id).toBe(toPeer.extended.name)
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
    onPeer () {
      return peerFn
    },
    onConnection () {
      return connectionFn
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
