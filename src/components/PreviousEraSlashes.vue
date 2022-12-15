<template>
  <q-card v-if="validator && validator.slashInEra && validator.slashInEra.percent" class="info-table">
    <table>
      <thead>
        <tr>
          <th colspan="2">Previous Era Slashes</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Amount</td>
          <td class="text-right">{{ amount }}</td>
        </tr>
        <tr>
          <td>Percent</td>
          <td class="text-right">{{ percent }}</td>
        </tr>
      </tbody>
    </table>
  </q-card>
</template>

<script>
import { computed } from 'vue'
import { useClientStore } from 'src/stores/client'
import { toBaseToken } from 'src/helpers/utils'

export default {
  name: 'PreviousEraSlashes',

  props: {
    validator: {
      type: Object,
      required: false,
      validator: (prop) => typeof prop === 'object' || prop === null
    }
  },

  setup (props) {
    const clientStore = useClientStore()

    const amount = computed(() => formatTokenValue(props.validator.slashInEra.amount))
    const percent = computed(() => props.validator.slashInEra.percent)

    function formatTokenValue (val) {
      return clientStore.decimals.length > 0 ? toBaseToken(val, clientStore.decimals[ 0 ]) : 0
    }

    return {
      amount,
      percent
    }
  }
}
</script>
