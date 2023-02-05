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

    console.log('props.address:', props.address)

    const identicon = computed(() => toSvg(props.address, 24))

    function copyAddress () {
      copyToClipboard(props.address)
        .then(() => {
          // success!
          $q.notify({
            message: 'Address copied to clipboard!',
            position: 'top-right'
          })
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
