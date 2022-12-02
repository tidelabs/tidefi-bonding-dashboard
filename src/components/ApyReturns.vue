<template>
  <q-card class="panel col q-ma-sm q-pa-sm">
    <div class="fit column items-center justify-center">
      <div class="col-shrink row items-center justify-end">APY</div>
      <div class="col row items-center justify-end"><span class="panel-title">{{ stakedReturn.toFixed(2) }}%</span></div>
    </div>
  </q-card>
</template>

<script>
import { computed } from 'vue'
import { useClientStore } from 'src/stores/client'

export default {
  name: 'ApyReturns',
  setup () {
    const clientStore = useClientStore()

    const stakedReturn = computed(() => clientStore.inflation.stakedReturn)

    return {
      stakedReturn
    }
  }
}
</script>
