import { defineStore } from 'pinia'

export const useChainsStore = defineStore('chain', {
  state: () => ({
    chains: [
      {
        name: 'Tidechain',
        rpc: 'wss://rpc.tidefi.io',
        mainnet: true
      },
      {
        name: 'Lagoon',
        rpc: 'wss://rpc.lagoon.tidefi.io',
        mainnet: false
      }
    ],
    // selected chain and index
    chainName: '',
    chainIndex: -1
  }),

  getters: {
    getChains (state) {
      return state.chains
    },
    getChainName (state) {
      return state.chainName
    },
    getChainIndex (state) {
      return state.chainIndex
    }
  },

  actions: {
    // increment () {
    //   this.counter++
    // }
  }
})
