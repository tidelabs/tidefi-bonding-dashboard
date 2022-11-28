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
    }
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
    }
  }
})
