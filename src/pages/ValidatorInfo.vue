<template>
  <q-page>
    {{ JSON.stringify(validator, null, 2) }}
  </q-page>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useEntitiesStore } from 'src/stores/entities'

export default {
  name: 'ValidatorInfo',

  setup () {
    const route = useRoute()
    const entitiesStore = useEntitiesStore()

    const validator = computed(() => {
      const v = entitiesStore.getValidators.find((val) => val.address === route.params.address)
      if (v) {
        console.log('Selected validator:', v)
        return
      }
      return null
    })

    // console.log('Look up validator:', route.params.address)

    return {
      validator
    }
  }
}
</script>
