<template>
  <q-card v-if="entity && unbonding?.length" class="info-table">
    <table>
      <thead>
        <tr>
          <th colspan="1">Unbonding ({{ unbonding.length }})</th>
        </tr>
      </thead>
    </table>
    <table>
      <tbody>
        <template v-for="({ era, value, total, date }, index) in unbonding" :key="index">
          <tr>
            <td>Available {{ date }}<q-tooltip>Era {{ era }}</q-tooltip></td>
            <td class="text-right">{{ value }}<q-tooltip>{{ total }} TDFY</q-tooltip></td>
          </tr>
        </template>
      </tbody>
    </table>
  </q-card>
</template>

<script>
import { computed } from 'vue'
import { useClientStore } from 'stores/client'
import { toBaseToken, eraToDate } from 'src/helpers/utils'

export default {
  name: 'Unbonding',

  props: {
    entity: {
      type: Object,
      required: false,
      validator: (prop) => typeof prop === 'object' || prop === null
    }
  },

  setup (props) {
    const clientStore = useClientStore()

    const unbonding = computed(() => {
      const unbonding = []
      props.entity.ledger?.unlocking.forEach((unlocking) => {
        unbonding.push({
          era: unlocking.era,
          value: toBaseToken(unlocking.value, clientStore.decimals[ 0 ]),
          total: toBaseToken(unlocking.value, clientStore.decimals[ 0 ], clientStore.decimals[ 0 ]),
          date: eraToDate(unlocking.era, true)
        })
      })
      // console.log('unbonding:', unbonding)
      return unbonding
    })

    return {
      unbonding
    }
  }
}
</script>
