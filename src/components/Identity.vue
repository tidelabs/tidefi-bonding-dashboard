<template>
  <q-card v-if="hasIdentity" class="info-table">
    <table>
      <thead>
        <tr>
          <th colspan="2">Identity</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="parentName">
          <td>Parent Name:</td><td>{{ parentName }}</td>
        </tr>
        <tr v-if="superName">
          <td>Super Name:</td><td>{{ superName }}</td>
        </tr>
        <tr v-if="email">
          <td>Email:</td><td>{{ email }}</td>
        </tr>
        <tr v-if="legal">
          <td>Legal:</td><td>{{ legal }}</td>
        </tr>
        <tr v-if="riot">
          <td>Riot:</td><td>{{ riot }}</td>
        </tr>
        <tr v-if="twitter">
          <td>Twitter:</td><td>{{ twitter }}</td>
        </tr>
        <tr v-if="web">
          <td>Web:</td><td>{{ web }}</td>
        </tr>
      </tbody>
    </table>
  </q-card>
</template>

<script>
import { computed } from 'vue'

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
    const parentName = computed(() => {
      if (props.entity && props.entity.parent && props.entity.parent.identity.info.display !== 'None') {
        return props.entity.parent.identity.info.display.Raw
      }
      return ''
    })

    const superName = computed(() => {
      if (props.entity && props.entity.super && props.entity.super.length > 0) {
        return props.entity.super[ 1 ].Raw
      }
      return ''
    })

    const email = computed(() => {
      if (props.entity && props.entity.parent && props.entity.parent.identity.info.email !== 'None') {
        return props.entity.parent.identity.info.email.Raw
      }
      if (props.entity && props.entity.identity && props.entity.identity.info.email !== 'None') {
        return props.entity.identity.info.email.Raw
      }
      return ''
    })

    const legal = computed(() => {
      if (props.entity && props.entity.parent && props.entity.parent.identity.info.legal !== 'None') {
        return props.entity.parent.identity.info.legal.Raw
      }
      if (props.entity && props.entity.identity && props.entity.identity.info.legal !== 'None') {
        return props.entity.identity.info.legal.Raw
      }
      return ''
    })

    const riot = computed(() => {
      if (props.entity && props.entity.parent && props.entity.parent.identity.info.riot !== 'None') {
        return props.entity.parent.identity.info.riot.Raw
      }
      if (props.entity && props.entity.identity && props.entity.identity.info.riot !== 'None') {
        return props.entity.identity.info.riot.Raw
      }
      return ''
    })

    const twitter = computed(() => {
      if (props.entity && props.entity.parent && props.entity.parent.identity.info.twitter !== 'None') {
        return props.entity.parent.identity.info.twitter.Raw
      }
      if (props.entity && props.entity.identity && props.entity.identity.info.twitter !== 'None') {
        return props.entity.identity.info.twitter.Raw
      }
      return ''
    })

    const web = computed(() => {
      if (props.entity && props.entity.parent && props.entity.parent.identity.info.web !== 'None') {
        return props.entity.parent.identity.info.web.Raw
      }
      if (props.entity && props.entity.identity && props.entity.identity.info.web !== 'None') {
        return props.entity.identity.info.web.Raw
      }
      return ''
    })

    const hasIdentity = computed(() => {
      return !!(parentName.value || superName.value
        || email.value || legal.value || riot.value
        || twitter.value || web.value)
    })

    return {
      parentName,
      superName,
      email,
      legal,
      riot,
      twitter,
      web,
      hasIdentity
    }
  }
}
</script>
