<template>
  <q-page padding>
    <div v-if="validator === null" class="error-message column justify-center items-center">
      <div class="q-mt-lg">
        Validator address not found!
        <q-icon :name="infoIcon">
          <q-tooltip>
            {{ $route.params.address }}
          </q-tooltip>
        </q-icon>
      </div>
      <div>
        Did you change networks while on this page?
      </div>
    </div>
    <div v-else class="column">
      <div class="row justify-start items-center">
        <div class="border-light identity-svg-wrapper" v-html="validator.identicon" />
        <div class="validator-name">{{ validator.name }}<q-tooltip>{{ validator.address }}</q-tooltip></div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useEntitiesStore } from 'src/stores/entities'
// import { useClientStore } from 'src/stores/client'
import { infoIcon } from 'assets/icons'

export default {
  name: 'ValidatorInfo',

  setup () {
    const route = useRoute()
    const entitiesStore = useEntitiesStore()
    // const clientStore = useClientStore()

    const validator = computed(() => {
      const v = entitiesStore.getValidators.find((val) => val.address === route.params.address)
      if (v) {
        console.log('Selected validator:', v)
        return v
      }
      return null
    })

    // const previousHistoryErasCount = computed(() => clientStore.getPreviousHistoryErasCount)

    // const erasList = computed(() => {
    //   const erasList = []
    //   const api = clientStore.client.api

    //   Array.from(Array(previousHistoryErasCount.value)).forEach(async (_, i) => {
    //     const eraStackers = await
    //   })
    // })

    return {
      validator,
      infoIcon
    }
  }
}
</script>

<style lang="scss" scoped>
.error-message {
  font-size: 1.2rem;
  color: red;
}
.validator-name {
  font-size: 1.6rem;
}
</style>
