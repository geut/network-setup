# network-setup

[![Build Status](https://travis-ci.com/geut/network-setup.svg?branch=master)](https://travis-ci.com/geut/network-setup)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> Create network simulations to test your peers and connections using [ngraphs](https://github.com/anvaka/ngraph.graph)

## <a name="install"></a> Install

```
$ npm install @geut/network-setup
```


## <a name="usage"></a> Usage

```javascript
const { NetworkSetup } = require('@geut/network-setup')

// defines the generator
const setup = new NetworkSetup({
  onPeer(id, data) {
    // Creates a peer
    return {
      // open/close are hooks to execute operations inside of peer lifecycle
      async open() {},
      async close() {},
      extended: {} // `extended` is a place to extend the peer object
    }
  },
  onConnection(fromPeer, toPeer, data) {
    return {
      // open/close are hooks to execute operations inside of connection lifecycle
      async open() {},
      async close() {},
      extended: {} // `extended` is a place to extend the connection object
    }
  }
})

;(async () => {
  // Create a balanced binary tree with 3 levels
  const network = await setup.balancedBinTree(3)
})()
```

## <a name="issues"></a> Issues

:bug: If you found an issue we encourage you to report it on [github](https://github.com/geut/network-setup/issues). Please specify your OS and the actions to reproduce it.

## <a name="contribute"></a> Contributing

:busts_in_silhouette: Ideas and contributions to the project are welcome. You must follow this [guideline](https://github.com/geut/network-setup/blob/master/CONTRIBUTING.md).

## License

MIT © A [**GEUT**](http://geutstudio.com/) project
