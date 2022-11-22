import { defineStore } from 'pinia'

export const usePreferencesStore = defineStore('preferences', {
  state: () => ({
    filters: {
      inactive: false,
      nextSet: false,
      highCommission: false,
      oversubscribed: false,
      blockedNominations: false,
      missingIdentity: false,
      notStaked: false,
      selfController: false
    }
  })

  // getters: {
  // },

  // actions: {
  //   increment () {
  //     this.counter++
  //   }
  // }
})
