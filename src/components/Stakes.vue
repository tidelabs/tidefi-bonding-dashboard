<template>
  <q-card v-if="entity?.currentStakes?.length" class="info-table">
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
          <td class="text-right text-bold">Stake</td>
          <td class="text-right text-bold">Accrued</td>
        </tr>
        <template v-for="{ tokenName, tokenSymbol, initialBalance, initialBalanceTotal, accrued, accruedTotal, startDate, endDate, duration, remaining, unstaking, unstakeTime } in currentStakes" :key="tokenName">
          <tr class="top-border">
            <td class="ellipsis">{{ tokenName }}</td>
            <td>{{ tokenSymbol }}</td>
            <td class="text-right">{{ initialBalance }}<q-tooltip>{{ initialBalanceTotal }} {{ tokenSymbol }}</q-tooltip></td>
            <td class="text-right">{{ accrued }}<q-tooltip>{{ accruedTotal }} {{ tokenSymbol }}</q-tooltip></td>
          </tr>
          <tr style="font-size: 10px;">
            <td>{{ startDate }}<q-tooltip>Staking start</q-tooltip></td>

            <td v-if="!unstaking">{{ duration }}<q-tooltip>Duration</q-tooltip></td>
            <td v-else>Unstaking</td>

            <td v-if="!unstaking"  class="text-right">{{ remaining }}<q-tooltip>Remaining time</q-tooltip></td>
            <td v-else  class="text-right">{{ unstakeTime }}<q-tooltip>Unstaking time</q-tooltip></td>

            <td class="text-right">{{ endDate }}<q-tooltip>Staking end</q-tooltip></td>
          </tr>
        </template>
      </tbody>
    </table>
  </q-card>
</template>

<script>
import { computed } from 'vue'
import BN from 'bignumber.js'
import { useClientStore } from 'stores/client'
import { normalizeValue, toBaseToken, blocksToMS, formatDateInternational, formatDurationFromSeconds } from 'src/helpers/utils'

const UNSTAKE_DURATION = 24 * 60 * 60 * 1000 // milliseconds in a day

export default {
  name: 'Stakes',

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
      // console.log('currentStakes:', props.entity.currentStakes)
      props.entity.currentStakes.forEach((stake) => {
        const token = clientStore.getTokenAsset(stake.currencyId === 'Tdfy' ? stake.currencyId : Number(stake.currencyId.Wrapped))
        const accrued = (new BN(normalizeValue(stake.principal)).minus(normalizeValue(stake.initialBalance))).toString()
        const currentMS = Date.now()
        const initialBlockMS = blocksToMS(clientStore.currentHeader.number - parseInt(normalizeValue(stake.initialBlock), 10))
        const startMS = currentMS - initialBlockMS
        const durationMS = blocksToMS(normalizeValue(stake.duration))
        const endMS = startMS + durationMS
        const remainingMS = endMS - currentMS

        const currentStake = {
          ...stake
        }

        currentStake.tokenName = token.asset.name
        currentStake.tokenSymbol = token.asset.symbol
        currentStake.initialBalance = toBaseToken(normalizeValue(stake.initialBalance), token.asset.decimals)
        currentStake.initialBalanceTotal = toBaseToken(normalizeValue(stake.initialBalance), token.asset.decimals, token.asset.decimals)
        currentStake.accrued = toBaseToken(accrued, token.asset.decimals)
        currentStake.accruedTotal = toBaseToken(accrued, token.asset.decimals, token.asset.decimals)
        currentStake.startDate = formatDateInternational(startMS)
        currentStake.endDate = formatDateInternational(endMS)
        currentStake.duration = formatDurationFromSeconds(durationMS / 1000, 'hours')
        currentStake.remaining = remainingMS > 0 ? formatDurationFromSeconds(remainingMS / 1000, 'hours') : 'Completed!'
        currentStake.unstaking = !!stake.status.pendingUnlock
        const unstakeTime = currentMS + Math.min(
          UNSTAKE_DURATION,
          blocksToMS(normalizeValue(stake.status.pendingUnlock) - clientStore.currentHeader.number)
        )
        currentStake.unstakeTime = formatDateInternational(unstakeTime, 'hours')

        current.push(currentStake)
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

<style lang="scss">
.top-border {
  border-top: 1px solid gray;
}
</style>
