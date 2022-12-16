<template>
  <q-card class="panel col q-ma-sm q-pa-sm">
    <div class="fit column items-center justify-center">
      <div class="col-shrink row items-center justify-end">Total Bonded</div>
      <div class="col row items-center justify-end"><span class="panel-title">{{ erasTotalStaked }}</span><span class="text-weight-thin token">&nbsp;{{ tokenName }}</span></div>
      <div class="col row items-center justify-end">{{ stakedPercent }}</div>
    </div>
  </q-card>
</template>

<script>
import { computed } from 'vue'
import { useClientStore } from 'src/stores/client'
import { toBaseToken, normalizeValue } from 'src/helpers/utils'
import BN from 'bignumber.js'

export default {
  name: 'TotalIssuance',
  setup () {
    const clientStore = useClientStore()

    const erasTotalStaked = computed(() => {
      if (clientStore.erasTotalStaked === 0) {
        return clientStore.erasTotalStaked
      }
      const ti = normalizeValue(toBaseToken(clientStore.erasTotalStaked, clientStore.decimals[ 0 ]))
      // divide by 1 Million (1000000)
      const val = (new BN(ti).div(new BN(1000000))).toFormat(4, BN.ROUND_DOWN)
      return val + ' M~'
    })

    const stakedPercent = computed(() => {
      const total = new BN(normalizeValue(normalizeValue(toBaseToken(clientStore.totalIssuance, clientStore.decimals[ 0 ]))))
      const staked = new BN(normalizeValue(normalizeValue(toBaseToken(clientStore.erasTotalStaked, clientStore.decimals[ 0 ]))))
      const value = staked.multipliedBy(100).div(total)
      if (isNaN(value)) return 0
      return value.toFormat(2, BN.ROUND_DOWN) + '%'
    })

    const tokenName = computed(() => {
      if (clientStore && clientStore.tokens && clientStore.tokens.length > 0) {
        return clientStore.tokens[ 0 ]
      }
      return ''
    })

    return {
      erasTotalStaked,
      stakedPercent,
      tokenName
    }
  }
}
</script>
