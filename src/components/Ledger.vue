<template>
  <q-card
    v-if="entity?.tokenBalances && availableLedgers?.length"
    class="info-table"
  >
    <table>
      <thead>
        <tr>
          <th colspan="4">Ledger ({{ availableLedgers.length }})</th>
        </tr>
      </thead>
    </table>
    <table>
      <tbody>
        <tr></tr>
        <tr class="bottom-border">
          <td class="text-bold">Name</td>
          <td class="text-bold">Symbol</td>
          <td class="text-right text-bold">Total</td>
          <td class="text-right text-bold">Reserved</td>
        </tr>
        <template
          v-for="{
            name,
            symbol,
            balance,
            reserved,
            total,
            totalReserved,
          } in availableLedgers"
          :key="name"
        >
          <tr>
            <td>{{ name }}</td>
            <td>{{ symbol }}</td>
            <td class="text-right">
              {{ balance }}<q-tooltip>{{ total }} {{ symbol }}</q-tooltip>
            </td>
            <td class="text-right">
              {{ reserved
              }}<q-tooltip>{{ totalReserved }} {{ symbol }}</q-tooltip>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </q-card>
</template>

<script>
import { computed } from 'vue'
import { useClientStore } from 'stores/client'
import { toBaseToken } from 'src/helpers/utils'

export default {
  name: 'Balances',

  props: {
    entity: {
      type: Object,
      required: false,
      validator: (prop) => typeof prop === 'object' || prop === null
    }
  },

  setup (props) {
    const clientStore = useClientStore()

    const availableLedgers = computed(() => {
      const available = []
      props.entity.tokenBalances.forEach((tb) => {
        if (tb.ledger) {
          const token = clientStore.getTokenAsset(tb.id)
          // console.log('Token:', token)
          if (token) {
            available.push({
              name: token.asset.name,
              symbol: token.asset.symbol,
              balance: toBaseToken(tb.ledger.balance, token.asset.decimals),
              reserved: toBaseToken(tb.ledger.reserved, token.asset.decimals),
              reservedTotal: toBaseToken(
                tb.ledger.reserved,
                token.asset.decimals,
                token.asset.decimals
              ),
              total: toBaseToken(
                tb.ledger.balance,
                token.asset.decimals,
                token.asset.decimals
              )
            })
          }
        }
      })
      // console.log('available:', available)
      return available
    })

    return {
      availableLedgers
    }
  }
}
</script>

<style lang="scss">
.bottom-border {
  border-bottom: 1px solid gray;
}
</style>
