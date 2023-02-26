<template>
  <q-card v-if="validator?.slashesInEras?.length" class="info-table">
    <table>
      <thead>
        <tr>
          <th colspan="2">Previous Eras Slashes</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-right">Era</td>
          <td class="text-right">Amount</td>
          <td class="text-right">Percent</td>
        </tr>
        <tr v-for="slash in validator.slashesInEras" :key="slash.era">
          <td class="text-right">{{ slash.era }}</td>
          <td class="text-right">{{ formatTokenValue(slash.amount) }}</td>
          <td class="text-right">{{ slash.percent }}</td>
        </tr>
      </tbody>
    </table>
  </q-card>
</template>

<script>
import { useClientStore } from 'src/stores/client'
import { toBaseToken } from 'src/helpers/utils'

export default {
  name: 'PreviousErasSlashes',

  props: {
    validator: {
      type: Object,
      required: false,
      validator: (prop) => typeof prop === 'object' || prop === null
    }
  },

  setup (props) {
    const clientStore = useClientStore()

    function formatTokenValue (val) {
      return clientStore.decimals.length > 0 ? toBaseToken(val, clientStore.decimals[ 0 ]) : 0
    }

    return {
      formatTokenValue
    }
  }
}
</script>
