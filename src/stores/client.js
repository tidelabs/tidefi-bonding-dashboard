import { defineStore } from 'pinia'

export const useClientStore = defineStore('client', {
  state: () => ({
    client: null,
    loading: false,

    currentHeader: { number: 0 }, // current block

    nodeName: '',
    nodeVersion: '',
    decimals: [],
    tokens: [],
    //
    session: {
      eraLength: 1, // avoid divide by 0 ini error
      eraProgress: 0,
      sessionLength: 1, // avoid divide by 0 ini error
      sessionProgress: 0,
      sessionsPerEra: 0
    },
    //
    consts: { // with expected defaults
      version: {
        specName: '',
        implName: '',
        specVersion: 0
      },
      bondingDuration: 28,
      existentialDeposit: 1000000000000, // 1 TDFY
      expectedBlockTime: 6000, // ms
      maxElectingVoters: 22500,
      maxNominations: 16,
      maxNominatorRewardedPerValidator: 256,
      sessionsPerEra: 6,
      historyDepth: 50 // 84 for Tidechain
    },
    //
    assets: [],
    //
    activeEra: { index: 0, start: 0 }, // index, start (time)
    currentEra: 0,
    sessionIndex: 0,
    bondedEras: [],
    //
    totalIssuance: 0,
    erasTotalStaked: 0,
    auctionCounter: 0,
    numAuctions: 0,
    //
    subIdentities: [],
    invulnerables: [],
    //
    counterForNominators: 0,
    counterForValidators: 0,
    validatorCount: 0,
    //
    validatorEntries: [],
    stakerEntries: [],
    rewardsHistory: [],
    rewardPoints: [{ era: 0, rewards: { total: 0, individual: {} } }],
    slashes: [],
    nextElected: [],
    inflation: {
      idealInterest: 0,
      idealStake: 0,
      inflation: 0,
      stakedFraction: 0,
      stakedReturn: 0
    }
  }),

  getters: {
    previousEra (state) {
      return Math.max(0, state.activeEra.index - 1)
    },
    isLoading (state) {
      return state.loading
    },
    getPreviousHistoryErasCount (state) {
      return state.activeEra.index - state.consts.historyDepth <= 0 ? state.activeEra.index : state.consts.historyDepth
    },
    getTdfyAsset (state) {
      return {
        asset: {
          name: 'Tidefi',
          symbol: state.tokens[ 0 ],
          decimals: state.decimals[ 0 ]
        }
      }
    }
  },

  actions: {
    getTokenAsset (assetId) {
      if (assetId === 'Tdfy') {
        return this.getTdfyAsset
      }
      return this.assets.find((asset) => asset.id === assetId)
    }
  }
})
