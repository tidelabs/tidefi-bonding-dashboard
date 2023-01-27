import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    // use to filter validators
    filters: {
      inactive: false,
      nextSet: false,
      highCommission: false,
      oversubscribed: false,
      blockedNominations: false,
      missingIdentity: false,
      noVerifiedIdentity: false,
      notStaked: false,
      selfController: false,
      belowAvgPoints: false,
      slashed: false,
      noGovernance: false
    },
    // array: { address: xxx, name: xxx }
    aliases: []
  }),

  // getters: {
  // },

  actions: {
    saveFilters () {
      LocalStorage.set('filters', this.filters)
    },
    restoreFilters () {
      if (LocalStorage.has('filters')) {
        this.filters = LocalStorage.getItem('filters')
      }
    },
    saveAliases () {
      LocalStorage.set('aliases', this.aliases)
    },
    restoreAliases () {
      if (LocalStorage.has('aliases')) {
        this.aliases = LocalStorage.getItem('aliases')
      }
    }
  }
})
