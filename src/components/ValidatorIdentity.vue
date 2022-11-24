<template>
  <table v-if="validator.hasIdentity" class="identity-table">
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

</template>

<script>
import { computed } from 'vue'

export default {
  name: 'ValidatorIdentity',

  props: {
    validator: {
      type: Object,
      required: true
    }
  },

  setup (props) {
    const parentName = computed(() => {
      if (props.validator.parent && props.validator.parent.identity.info.display !== 'None') {
        return props.validator.parent.identity.info.display.Raw
      }
      return ''
    })

    const superName = computed(() => {
      if (props.validator.super && props.validator.super.length > 0) {
        return props.validator.super[ 1 ].Raw
      }
      return ''
    })

    const email = computed(() => {
      if (props.validator.parent && props.validator.parent.identity.info.email !== 'None') {
        return props.validator.parent.identity.info.email.Raw
      }
      if (props.validator.identity && props.validator.identity.info.email !== 'None') {
        return props.validator.identity.info.email.Raw
      }
      return ''
    })

    const legal = computed(() => {
      if (props.validator.parent && props.validator.parent.identity.info.legal !== 'None') {
        return props.validator.parent.identity.info.legal.Raw
      }
      if (props.validator.identity && props.validator.identity.info.legal !== 'None') {
        return props.validator.identity.info.legal.Raw
      }
      return ''
    })

    const riot = computed(() => {
      if (props.validator.parent && props.validator.parent.identity.info.riot !== 'None') {
        return props.validator.parent.identity.info.riot.Raw
      }
      if (props.validator.identity && props.validator.identity.info.riot !== 'None') {
        return props.validator.identity.info.riot.Raw
      }
      return ''
    })

    const twitter = computed(() => {
      if (props.validator.parent && props.validator.parent.identity.info.twitter !== 'None') {
        return props.validator.parent.identity.info.twitter.Raw
      }
      if (props.validator.identity && props.validator.identity.info.twitter !== 'None') {
        return props.validator.identity.info.twitter.Raw
      }
      return ''
    })

    const web = computed(() => {
      if (props.validator.parent && props.validator.parent.identity.info.web !== 'None') {
        return props.validator.parent.identity.info.web.Raw
      }
      if (props.validator.identity && props.validator.identity.info.web !== 'None') {
        return props.validator.identity.info.web.Raw
      }
      return ''
    })

    return {
      parentName,
      superName,
      email,
      legal,
      riot,
      twitter,
      web
    }
  }
}
</script>

<style lang="scss" scoped>
.identity-table {
  border: 1px solid rgba(200,200,200,0.4);
  border-radius: 4px;
  margin-top: 8px;
}
</style>
