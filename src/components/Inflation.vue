<template>
  <q-card class="panel col q-ma-sm q-pa-sm">
    <div class="fit column items-center justify-center">
      <div class="col-shrink row items-center justify-center text-bold"><span :class="$q.dark.isActive ? 'text-yellow' : 'text-primary'">Inflation</span></div>
      <div class="col row items-center justify-center no-wrap"><span class="panel-title">{{ inflation.toFixed(2) }}%</span></div>
    </div>
  </q-card>
</template>

<script>
import { computed } from 'vue'
import { useClientStore } from 'src/stores/client'

export default {
  name: 'Inflation',
  setup () {
    const clientStore = useClientStore()

    const inflation = computed(() => clientStore.inflation.inflation)

    return {
      inflation
    }
  }
}
</script>
