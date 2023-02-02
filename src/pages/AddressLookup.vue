<template>
  <div class="q-ma-md">
    <div v-if="loading" class="column justify-center items-center">
      <q-spinner-facebook size="lg" />
    </div>
    <div v-else class="column justify-start items-start full-width">
      <q-dialog
        v-model="showAliasDialog"
      >
      <q-card style="min-width: 300px;">
        <q-card-section v-if="!hasAlias(entity.address)">
          <div class="text-h6">Add alias for: {{ entity.identity.name }}</div>
          <q-input outlined v-model="aliasName" label="Name" />
        </q-card-section>
        <q-card-section v-else>
          <div class="text-h6">Remove alias for: {{ getAlias(entity.address).name }}</div>
        </q-card-section>
        <q-separator />
        <q-card-actions vertical>
          <q-btn
            v-if="!hasAlias(entity.address)"
            flat
            :disable="!aliasName"
            @click="onSaveAlias"
          >Save</q-btn>
          <q-btn
            v-else
            flat
            @click="onRemoveAlias"
          >Remove</q-btn>
          <q-btn
            flat
            @click="showAliasDialog = false"
          >Cancel</q-btn>
        </q-card-actions>
      </q-card>
      </q-dialog>
      <div class="row justify-center items-start full-width q-mb-lg q-gutter-lg">
        <q-input
          v-if="aliases.length === 0"
          v-model="selectedAddress"
          label="Input an Address"
          outlined
          clearable
          color="purple-13"
          :rules="[val => (isValidAddress(val) ? true : (entity = null && false)) || 'Invalid address']"
          style="min-width: 300px; max-height: 56px;"
        />
        <q-select
          v-else
          v-model="selectedAddress"
          :options="entitiesOption"
          use-input
          map-options
          emit-value
          option-label="name"
          option-value="address"
          clearable
          input-debounce="0"
          @filter="filterEntities"
          outlined
          new-value-mode="add"
          debounce="500"
          color="purple-13"
          label="Input an Address"
          :rules="[val => (isValidAddress(val) ? true : (entity = null && false)) || 'Invalid address']"
          style="min-width: 300px; max-height: 56px;"
        />
        <q-btn
          id="alias-button"
          label="Alias"
          outline
          no-caps
          :disable="!(isValidAddress(selectedAddress))"
          style="height: 56px;"
          @click="showAliasDialog = !showAliasDialog"
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
import { computed, ref, watch, onBeforeMount, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isValidAddress } from '../helpers/utils'
import { Entity } from '../classes/entity'
import { useEntitiesStore } from 'src/stores/entities'
import { useClientStore } from 'src/stores/client'
import { usePreferencesStore } from 'src/stores/preferences'
import mitt from 'mitt'

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
    const emitter = mitt()
    const entitiesStore = useEntitiesStore()
    const clientStore = useClientStore()
    const preferencesStore = usePreferencesStore()
    const selectedAddress = ref(null)
    const entity = ref(null)
    const entitiesOption = ref([])
    const showAliasDialog = ref(false)
    const aliasName = ref('')

    emitter.on('session-ended', () => {
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

    onUnmounted(() => {
      // remove handler
      emitter.off('session-ended')
    })

    const loading = computed(() => {
      if (clientStore.isLoading) {
        return true
      }
      return entitiesStore.isLoading
    })

    const aliases = computed(() => preferencesStore.aliases)

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

    function filterEntities (val, update) {
      if (val === '' || preferencesStore.aliases.isEmpty) {
        update(() => {
          entitiesOption.value = preferencesStore.aliases
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        entitiesOption.value = preferencesStore.aliases.filter((v) => {
          return v.name.toLowerCase().indexOf(needle) > -1
        })
      })
    }

    // takes an entity's address and checks if there is an alias
    function hasAlias (address) {
      return !!preferencesStore.aliases.find((alias) => address === alias.address)
    }

    function getAlias (address) {
      return preferencesStore.getAlias(address)
    }

    function onSaveAlias () {
      preferencesStore.addAlias(entity.value.address, aliasName.value)
      aliasName.value = ''
      showAliasDialog.value = false
    }

    function onRemoveAlias () {
      preferencesStore.removeAlias(entity.value.address)
      aliasName.value = ''
      showAliasDialog.value = false
    }

    return {
      loading,
      selectedAddress,
      isValidAddress,
      entity,
      filterEntities,
      entitiesOption,
      aliases,
      hasAlias,
      getAlias,
      showAliasDialog,
      aliasName,
      onSaveAlias,
      onRemoveAlias
    }
  }
}
</script>

<style lang="scss" scoped>
#alias-button.q-btn--rectangle {
  border-radius: 5px;
}

#alias-button.q-btn--outline:before {
  border-color: rgba(0, 0, 0, 0.2);
  transition: border-color 0.36s cubic-bezier(0.4, 0, 0.2, 1);
}

#alias-button.q-btn--outline:hover:before {
  border-color: rgba(0, 0, 0, 0.6);
}

body.body--dark {
  #alias-button.q-btn--outline:before {
    border-color: rgba(255, 255, 255, 0.6);
  }

  #alias-button.q-btn--outline:hover:before {
    border-color: rgb(255, 255, 255);
  }
}
</style>
