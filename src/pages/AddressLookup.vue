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
      <div class="row justify-between items-start full-width">
        <!-- Left Side -->
        <div class="column justify-start items-start">
          <div class="row justify-start items-center">
            <div v-if="entity" class="column">
              <div class="row justify-start items-center">
                <div class="border-light identity-svg-wrapper" v-html="entity.identicon" />
                <div class="validator-name">{{ entity.name }}</div>
              </div>
              <div>{{ entity.address }}</div>
              <ValidatorIdentity :validator="entity" />
            </div>
          </div>
        </div>
        <!-- Right Side -->
        <div class="column">
          <!-- TODO: Right Side - graphs -->
        </div>
      </div>
      <!-- End of split page -->
    </div>
  </div>
</template>

<script>
import { computed, ref, watch, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isValidAddress } from '../helpers/utils'
import { Entity } from '../classes/entity'
import { useEntitiesStore } from 'src/stores/entities'
import { useClientStore } from 'src/stores/client'

import ValidatorIdentity from 'src/components/ValidatorIdentity.vue'

export default {
  name: 'Address Lookup',

  components: {
    ValidatorIdentity
  },

  setup (props) {
    const route = useRoute()
    const router = useRouter()
    const entitiesStore = useEntitiesStore()
    const clientStore = useClientStore()
    const selectedAddress = ref(null)
    const entity = ref(null)

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
          return
        }
        console.log('entity:', entity.value)
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
