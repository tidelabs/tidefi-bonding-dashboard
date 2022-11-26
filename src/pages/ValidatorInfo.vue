<template>
  <div class="q-ma-md">
    <div v-if="loading" class="column justify-center items-center">
      <q-spinner-facebook size="lg" />
    </div>
    <div v-else-if="validator === null && $route.params.address" class="error-message column justify-center items-center">
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

    <div v-else class="column justify-start items-start full-width">
      <div class="row justify-center items-center full-width q-mb-lg">
        <q-select
          v-model="selectedValidator"
          :options="validators"
          option-label="name"
          map-options
          outlined
          color="purple-13"
          label="Selected validator"
          style="min-width: 300px;"
        />
      </div>
      <div class="row justify-between items-start full-width">
        <!-- Left Side -->
        <div class="column justify-start items-start">
          <div class="row justify-start items-center">
            <div v-if="validator" class="column">
              <div class="row justify-start items-center">
                <div class="border-light identity-svg-wrapper" v-html="validator.identicon" />
                <div class="validator-name">{{ validator.name }}</div>
              </div>
              <div>{{ validator.address }}</div>
            </div>
          </div>
        </div>
        <!-- Right Side -->
        <div class="column">
          <!-- TODO: Right Side - graphs? -->
        </div>
      </div>
      <div class="row justify-start items-stretch full-width q-gutter-sm">
        <Identity :entity="validator" />
        <Nominators :validator="validator" />
        <ValidatorStats :validator="validator" />
        <Balances :entity="validator" />
      </div>

      <!-- End of split page -->
      <ErasRewardPoints v-if="validator && validator.erasRewardPoints.length" :erasRewardPoints="validator.erasRewardPoints" />
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEntitiesStore } from 'src/stores/entities'
import { useClientStore } from 'src/stores/client'
import { infoIcon } from 'assets/icons'
import { isValidAddress } from 'src/helpers/utils'

import ErasRewardPoints from 'src/components/ErasRewardPoints.vue'
import Identity from 'src/components/Identity.vue'
import Nominators from 'src/components/Nominators.vue'
import ValidatorStats from 'src/components/ValidatorStats.vue'
import Balances from 'src/components/Balances.vue'

export default {
  name: 'ValidatorInfo',

  components: {
    Identity,
    Nominators,
    ValidatorStats,
    Balances,
    ErasRewardPoints
  },

  setup () {
    const route = useRoute()
    const router = useRouter()
    const entitiesStore = useEntitiesStore()
    const clientStore = useClientStore()
    const selectedValidator = ref(null)

    const loading = computed(() => {
      if (clientStore.isLoading) {
        return true
      }
      return entitiesStore.isLoading
    })

    const validators = computed(() => entitiesStore.getValidators)

    const validator = computed(() => {
      if (isValidAddress(route.params.address)) {
        const v = validators.value.find((val) => val.address === route.params.address)
        if (v) {
          // console.log('Selected validator:', v, clientStore)
          return v
        }
      }
      return null
    })

    watch(selectedValidator, (val) => {
      if (val.address !== route.params.address) {
        // push the new route
        router.push({
          name: 'validator-lookup',
          params: {
            address: val.address
          }
        })
      }
    })

    watch(validator, (val) => {
      if (val) {
        selectedValidator.value = val
      }
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
      loading,
      selectedValidator,
      validators,
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
