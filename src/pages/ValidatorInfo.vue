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
        <!-- Did you change networks while on this page? -->
      </div>
    </div>

    <div v-else class="column justify-start items-start full-width">
      <div class="row justify-center items-center full-width q-mb-lg">
        <q-select
          v-model="selectedValidator"
          :options="validatorsOption"
          :option-label="(val) => val.identity.name"
          use-input
          input-debounce="0"
          @filter="filterValidators"
          map-options
          outlined
          color="purple-13"
          label="Selected validator"
          style="min-width: 300px;"
        />
      </div>
      <div class="row  full-width">
        <EntityName :entity="validator" />
      </div>
      <div class="row justify-start items-stretch full-width q-gutter-sm">
        <Identity :entity="validator" />
        <Nominators :validator="validator" />
        <ValidatorStats :validator="validator" />
        <Balances :entity="validator" />
        <Ledger :entity="validator" />
      </div>

      <!-- End of split page -->
      <div class="column full-width q-mt-md q-gutter-sm">
        <ErasRewardPoints v-if="validator && validator.erasRewardPoints.length" :erasRewardPoints="validator.erasRewardPoints" />
        <StakerRewards v-if="validator && validator.stakerRewards.length > 0" :rewards="validator.stakerRewards" :isValidator="true" />
        <BondingHistory v-if="validator && validator.bondingHistory.length > 0" :bondingHistory="validator.bondingHistory" />
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEntitiesStore } from 'src/stores/entities'
import { useClientStore } from 'src/stores/client'
import { infoIcon } from 'assets/icons'
import { isValidAddress } from 'src/helpers/utils'
import { stakerRewards } from 'src/helpers/stakerRewards'

import EntityName from 'src/components/EntityName.vue'
import ErasRewardPoints from 'src/components/ErasRewardPoints.vue'
import Identity from 'src/components/Identity.vue'
import Nominators from 'src/components/Nominators.vue'
import ValidatorStats from 'src/components/ValidatorStats.vue'
import Balances from 'src/components/Balances.vue'
import StakerRewards from 'src/components/StakerRewards.vue'
import Ledger from 'src/components/Ledger.vue'
import BondingHistory from 'src/components/BondingHistory.vue'

export default {
  name: 'ValidatorInfo',

  components: {
    Identity,
    Nominators,
    ValidatorStats,
    Balances,
    ErasRewardPoints,
    StakerRewards,
    Ledger,
    EntityName,
    BondingHistory
  },

  setup () {
    const route = useRoute()
    const router = useRouter()
    const entitiesStore = useEntitiesStore()
    const clientStore = useClientStore()
    const selectedValidator = ref(null)
    const stakerRewardsData = reactive([])
    const validatorsOption = ref([])

    const loading = computed(() => {
      if (clientStore.isLoading) {
        return true
      }
      return entitiesStore.isLoading
    })

    const validators = computed(() => entitiesStore.getValidatorsSorted())

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
      if (val && val.address !== route.params.address) {
        // push the new route
        router.push({
          name: 'validator-lookup',
          params: {
            address: val.address
          }
        })
      }
    })

    watch(validator, async (val) => {
      if (val) {
        selectedValidator.value = val
        stakerRewardsData.splice(0, stakerRewardsData.length)
        stakerRewards(clientStore.client.api, val.address, true)
          .then((result) => {
            stakerRewardsData.splice(0, stakerRewardsData.length, ...result)
            // console.log('StakerRewards:', stakerRewardsData)
          })
      }
      else {
        stakerRewardsData.splice(0, stakerRewardsData.length)
      }
    })

    function filterValidators (val, update) {
      if (val === '') {
        update(() => {
          validatorsOption.value = validators.value
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        validatorsOption.value = validators.value.filter(v => {
          return v.identity.name.toLowerCase().indexOf(needle) > -1
        })
      })
    }

    return {
      loading,
      selectedValidator,
      validators,
      validator,
      infoIcon,
      stakerRewardsData,
      filterValidators,
      validatorsOption
    }
  }
}
</script>

<style lang="scss" scoped>
.error-message {
  font-size: 1.2rem;
  color: red;
}
</style>
