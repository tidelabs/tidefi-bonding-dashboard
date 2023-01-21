<template>
  <q-card class="panel col q-ma-sm q-pa-sm">
    <div class="fit column items-center justify-center">
      <div class="col-shrink row items-center justify-center">Total Validators</div>
      <div class="col row items-center justify-center no-wrap"><span class="panel-title text-center">{{ clientStore.validatorCount }}</span>/{{ clientStore.counterForValidators }}</div>
    </div>
  </q-card>
</template>

<script>
import { useClientStore } from 'src/stores/client'

export default {
  name: 'TotalValidators',
  setup () {
    const clientStore = useClientStore()

    return {
      clientStore
    }
  }
}
</script>
