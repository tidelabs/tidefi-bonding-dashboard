// import { inject, provide, reactive, computed } from 'vue'
// import { validatorsStoreKey } from './symbols.js'

// export function useEntitiesStore () {
//   return inject(validatorsStoreKey)
// }

// export function providevalidatorsStore () {
//   const store = {
//     validators: []
//   }

//   store.validatorsCount = computed(() => store.validators.length)
//   store.nominatorsCount = computed(() => {
//     const initialValue = 0
//     return store.validators.reduce((acc, v) => acc + v.nominatorCount, initialValue)
//   })

//   provide(
//     validatorsStoreKey,
//     process.env.SERVER === true ? store : reactive(store)
//   )
// }
