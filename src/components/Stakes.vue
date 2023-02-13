<template>
  <q-card v-if="entity && entity.currentStakes.length" class="info-table">
    <table>
      <thead>
        <tr>
          <th colspan="1">Stakes ({{ currentStakes.length }})</th>
        </tr>
      </thead>
    </table>
    <table>
      <tbody>
        <tr>
          <td class="text-bold">Name</td>
          <td class="text-bold">Symbol</td>
          <td class="text-right text-bold">Initial Stake</td>
          <td class="text-right text-bold">Principal</td>
        </tr>
        <template v-for="{ tokenName, tokenSymbol, initialBalance, initialBalanceTotal, principal, principalTotal } in currentStakes" :key="tokenName">
          <tr>
            <td>{{ tokenName }}</td>
            <td>{{ tokenSymbol }}</td>
            <td class="text-right">{{ initialBalance }}<q-tooltip>{{ initialBalanceTotal }} {{ tokenSymbol }}</q-tooltip></td>
            <td class="text-right">{{ principal }}<q-tooltip>{{ principalTotal }} {{ tokenSymbol }}</q-tooltip></td>
          </tr>
        </template>
      </tbody>
    </table>
  </q-card>
</template>

<script>
import { computed } from 'vue'
import { useClientStore } from 'stores/client'
import { normalizeValue, toBaseToken } from 'src/helpers/utils'

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

    const currentStakes = computed(() => {
      const current = []
      props.entity.currentStakes.forEach((stake) => {
        const token = clientStore.getTokenAsset(Number(stake.currencyId.Wrapped))
        const data = {
          ...stake
        }
        data.tokenName = token.asset.name
        data.tokenSymbol = token.asset.symbol
        data.initialBalance = toBaseToken(normalizeValue(stake.initialBalance), token.asset.decimals)
        data.initialBalanceTotal = toBaseToken(normalizeValue(stake.initialBalance), token.asset.decimals, token.asset.decimals)
        data.principal = toBaseToken(normalizeValue(stake.principal), token.asset.decimals)
        data.principalTotal = toBaseToken(normalizeValue(stake.principal), token.asset.decimals, token.asset.decimals)
        data.duration = normalizeValue(stake.duration)
        current.push(data)
      })
      // console.log(current)
      return current
    })

    return {
      currentStakes
    }
  }
}
</script>
