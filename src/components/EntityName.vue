<template>
  <div v-if="entity" class="column full-width">
    <q-card class="q-ma-sm q-pa-sm info-table" style="max-width: 400px;">
      <table>
        <thead>
          <tr class="row justify-start items-center no-wrap">
            <Identicon :address="entity.address" />
            <div class="entity-name">{{ name }}</div>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th class="text-left">
              <div class="ellipsis" style="font-size: 10px;">{{ entity.address }}</div>
            </th>
          </tr>
        </tbody>
      </table>
    </q-card>
  </div>
</template>

<script>
import { computed } from 'vue'
import { usePreferencesStore } from 'src/stores/preferences'

import Identicon from 'src/components/Identicon.vue'

export default {
  name: 'EntityName',

  components: {
    Identicon
  },

  props: {
    entity: {
      type: Object,
      required: false,
      validator: (prop) => typeof prop === 'object' || prop === null
    }
  },

  setup (props) {
    const preferencesStore = usePreferencesStore()

    const name = computed(() => {
      const alias = preferencesStore.getAlias(props.entity.address)
      return alias ? alias.name : props.entity.identity.name
    })

    return {
      name
    }
  }
}
</script>

<style lang="scss" scoped>
.entity-name {
  font-size: 1.6rem;
}
</style>
