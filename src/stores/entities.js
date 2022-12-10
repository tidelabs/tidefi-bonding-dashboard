import { defineStore } from 'pinia'

export const useEntitiesStore = defineStore('entities', {
  state: () => ({
    loadingCount: 0,
    entities: []
  }),

  getters: {
    isLoading (state) {
      return state.loadingCount > 0
    },
    getEntities (state) {
      return state.entities
    },
    getValidators (state) {
      return state.entities.filter((e) => e.validator === true)
    },
    getActiveValidators (state) {
      return state.entities.filter((e) => e.validator === true && e.elected === true)
    },
    getInactiveValidators (state) {
      return state.entities.filter((e) => e.validator === true && e.elected === false)
    }
  },

  actions: {
    resetEntities () {
      this.entities = []
    },
    incLoading () {
      this.loadingCount++
    },
    decLoading () {
      this.loadingCount--
    },
    getValidatorByAddess (address) {
      return this.entities.find((entity) => entity.address === address)
    },
    getValidatorsSorted () {
      return this.getValidators.sort((a, b) => {
        return a.identity.name.toLowerCase() > b.identity.name.toLowerCase()
          ? 1
          : a.identity.name.toLowerCase() < b.identity.name.toLowerCase()
            ? -1 : 0
      })
    }
  }
})
