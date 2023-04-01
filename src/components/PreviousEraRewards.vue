<template>
  <q-card class="panel col q-ma-sm q-pa-sm">
    <div class="fit column items-center justify-center">
      <div class="col-shrink row items-center justify-center no-wrap text-bold"><span :class="$q.dark.isActive ? 'text-yellow' : 'text-primary'">Previous Era Rewards</span></div>
      <div class="col row items-center justify-center">
        <span class="panel-title">{{ previousEraRewards }}</span>
        <span class="text-weight-thin token">&nbsp;{{ tokenName }}</span>
      </div>
    </div>
  </q-card>
</template>

<script>
import { computed } from 'vue'
import { useClientStore } from 'src/stores/client'
import { toBaseToken } from 'src/helpers/utils'

export default {
  name: 'PreviousEraRewards',
  setup () {
    const clientStore = useClientStore()

    const previousEraRewards = computed(() => {
      if (clientStore.rewardsHistory && clientStore.rewardsHistory.length > 0) {
        const value = clientStore.rewardsHistory[ clientStore.rewardsHistory.length - 1 ].rewards
        const amount = toBaseToken(value, clientStore.decimals[ 0 ])
        return amount
      }
      return 0
      // const ti = normalizeValue(toBaseToken(clientStore.totalIssuance, clientStore.decimals[ 0 ]))
      // // console.log('totalIssuance converted:', ti)
      // // divide by 1 Brillion (1000000000)
      // const val = (new BN(ti).div(new BN(1000000000))).toFormat(4, BN.ROUND_DOWN)
      // return val + ' B~'
    })

    const tokenName = computed(() => {
      if (clientStore && clientStore.tokens && clientStore.tokens.length > 0) {
        return clientStore.tokens[ 0 ]
      }
      return ''
    })

    return {
      previousEraRewards,
      tokenName
    }
  }
}
</script>
