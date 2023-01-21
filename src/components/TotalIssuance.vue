<template>
  <q-card class="panel col q-ma-sm q-pa-sm">
    <div class="fit column items-center justify-center no-wrap">
      <div class="col-shrink row items-center justify-center">Total Issuance</div>
      <div class="col row items-center justify-center"><span class="panel-title">{{ totalIssuance }}</span><span class="text-weight-thin token">&nbsp;{{ tokenName }}</span></div>
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

    const totalIssuance = computed(() => {
      if (clientStore.totalIssuance === 0) {
        return clientStore.totalIssuance
      }
      const ti = normalizeValue(toBaseToken(clientStore.totalIssuance, clientStore.decimals[ 0 ]))
      // console.log('totalIssuance converted:', ti)
      // divide by 1 Brillion (1000000000)
      const val = (new BN(ti).div(new BN(1000000000))).toFormat(4, BN.ROUND_DOWN)
      return val + ' B~'
    })

    const tokenName = computed(() => {
      if (clientStore && clientStore.tokens && clientStore.tokens.length > 0) {
        return clientStore.tokens[ 0 ]
      }
      return ''
    })

    return {
      totalIssuance,
      tokenName
    }
  }
}
</script>
