<template>
  <q-card v-if="entity?.identity?.hasIdentity" class="info-table">
    <table>
      <thead>
        <tr>
          <th colspan="2">Identity</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="name">
          <td>Name:</td><td>{{ name }}</td>
        </tr>
        <tr v-if="entity.identity.parentName">
          <td>Parent Name:</td><td>{{ entity.identity.parentName }}</td>
        </tr>
        <tr v-if="entity.identity.superName">
          <td>Super Name:</td><td>{{ entity.identity.superName }}</td>
        </tr>
        <tr v-if="entity.identity.email">
          <td>Email:</td><td>{{ entity.identity.email }}</td>
        </tr>
        <tr v-if="entity.identity.legal">
          <td>Legal:</td><td>{{ entity.identity.legal }}</td>
        </tr>
        <tr v-if="entity.identity.riot">
          <td>Riot:</td><td>{{ entity.identity.riot }}</td>
        </tr>
        <tr v-if="entity.identity.twitter">
          <td>Twitter:</td><td>{{ entity.identity.twitter }}</td>
        </tr>
        <tr v-if="entity.identity.web">
          <td>Web:</td><td>{{ entity.identity.web }}</td>
        </tr>
      </tbody>
    </table>
  </q-card>
</template>

<script>
import { computed } from 'vue'
import { usePreferencesStore } from 'src/stores/preferences'

export default {
  name: 'Identity',

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
