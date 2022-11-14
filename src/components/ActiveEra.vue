<template>
  <q-card class="panel col q-ma-sm q-pa-sm">
    <div class="column justify-start items-center">
      <div class="col column items-center justify-end no-wrap">Active Era ({{ clientStore.activeEra.index }})</div>
      <div class="full-width row justify-start items-center">
        <q-circular-progress
          :value="progressValue"
          show-value
          font-size="12px"
          color="teal"
          track-color="grey-3"
          size="50px"
          class="col justify-end q-ma-sm"
        >
          {{ progressValue }}%
        </q-circular-progress>
        <div class="col column">
          <div class="col row items-center justify-start">{{ baseTime }}<q-tooltip>Duration</q-tooltip></div>
          <div class="col row items-center justify-start">{{ remainingTime }}<q-tooltip>Remaining</q-tooltip></div>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
import { computed } from 'vue'
import { useClientStore } from 'src/stores/client'
import { convertSecondsToTime } from 'src/helpers/utils'

export default {
  name: 'ActiveEra',
  setup () {
    const clientStore = useClientStore()

    const progressValue = computed(() => {
      return Number((clientStore.session.eraProgress * 100 / clientStore.session.eraLength).toFixed(2))
    })

    const baseTime = computed(() => {
      return convertSecondsToTime(clientStore.session.eraLength * 6, { d: true, h: false, m: false, s: false })
    })

    const remainingTime = computed(() => {
      return convertSecondsToTime((clientStore.session.eraLength - clientStore.session.eraProgress) * 6, { d: false, h: true, m: true, s: false })
    })

    return {
      clientStore,
      progressValue,
      baseTime,
      remainingTime
    }
  }
}
</script>
