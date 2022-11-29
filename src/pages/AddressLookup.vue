<template>
  <div class="q-ma-md">
    <div v-if="loading" class="column justify-center items-center">
      <q-spinner-facebook size="lg" />
    </div>
    <div v-else class="column justify-start items-start full-width">
      <div class="row justify-center items-center full-width q-mb-lg">
        <q-input
            v-model="selectedAddress"
            label="Input an Address"
            outlined
            debounce="500"
            color="purple-13"
            :rules="[val => (isValidAddress(val) ? true : (entity = null && false)) || 'Invalid address']"
            style="min-width: 300px;"
          />
      </div>
      <div class="row full-width">
        <EntityName :entity="entity" />
      </div>
      <div class="row justify-start items-stretch full-width q-gutter-sm">
        <Identity :entity="entity" />
        <Balances :entity="entity" />
        <Ledger :entity="entity" />
        <Nominations :entity="entity" />
      </div>

      <!-- End of split page -->
      <div class="column full-width q-mt-md q-gutter-sm">
        <StakerRewards v-if="entity?.stakerRewards && entity?.stakerRewards?.length > 0" :rewards="entity.stakerRewards" />
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch, onBeforeMount, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isValidAddress } from '../helpers/utils'
import { Entity } from '../classes/entity'
import { useEntitiesStore } from 'src/stores/entities'
import { useClientStore } from 'src/stores/client'

import EntityName from 'src/components/EntityName.vue'
import Identity from 'src/components/Identity.vue'
import Balances from 'src/components/Balances.vue'
import StakerRewards from 'src/components/StakerRewards.vue'
import Ledger from 'src/components/Ledger.vue'
import Nominations from 'src/components/Nominations.vue'

export default {
  name: 'Address Lookup',

  components: {
    Identity,
    Balances,
    StakerRewards,
    Ledger,
    EntityName,
    Nominations
  },

  setup (props) {
    const route = useRoute()
    const router = useRouter()
    const bus = inject('bus')
    const entitiesStore = useEntitiesStore()
    const clientStore = useClientStore()
    const selectedAddress = ref(null)
    const entity = ref(null)

    bus.on('session-ended', () => {
      // is there an entity loaded up?
      if (entity.value) {
        // if so, refresh it's data
        entity.value.connect()
      }
    })

    onBeforeMount(() => {
      if (clientStore.client && route.params.address && isValidAddress(route.params.address)) {
        selectedAddress.value = route.params.address
      }
    })

    const loading = computed(() => {
      if (clientStore.isLoading) {
        return true
      }
      return entitiesStore.isLoading
    })

    watch(selectedAddress, async (addr) => {
      if (isValidAddress(addr)) {
        if (addr !== route.params.address) {
          // push the new route
          router.push({
            name: 'address-lookup',
            params: {
              address: addr
            }
          })
        }

        entity.value = new Entity(addr, false)
        const success = await entity.value.connect()
        if (!success) {
          entity.value = null
          // return
        }
        // console.log('entity:', entity, clientStore)
      }
      else {
        entity.value = null
      }
    })

    watch(() => clientStore.client !== null, () => {
      if (clientStore.client
        && route.params.address
        && isValidAddress(route.params.address)
        && selectedAddress.value !== route.params.address) {
        selectedAddress.value = route.params.address
      }
    })

    return {
      loading,
      selectedAddress,
      isValidAddress,
      entity
    }
  }
}
</script>
