<template>
  <q-btn
    flat
    padding="0"
    @click="copyAddress"
  >
    <div
      v-html="identicon"
      class="border-light identity-svg-wrapper"
    />
    <q-tooltip>Click to copy address</q-tooltip>
  </q-btn>
</template>

<script>
import { toSvg } from 'jdenticon'
import { computed } from 'vue'
import { copyToClipboard, useQuasar } from 'quasar'

export default {
  name: 'Identicon',
  props: {
    address: {
      type: String,
      required: true
    }
  },

  setup (props) {
    const $q = useQuasar()

    const identicon = computed(() => toSvg(props.address, 24))

    function copyAddress () {
      copyToClipboard({
        message: props.address,
        position: 'top-right'
      })
        .then(() => {
          // success!
          $q.notify('Address copied to clipboard!')
        })
        .catch(() => {
          // fail
        })
    }

    return {
      identicon,
      copyAddress
    }
  }
}
</script>
