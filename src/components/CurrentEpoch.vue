<template>
  <q-card class="panel col q-ma-sm q-pa-sm">
    <div class="column justify-start items-center">
      <div class="col column items-center justify-end">Current Epoch</div>
      <div class="full-width row justify-start items-center">
        <q-circular-progress
          :value="progressValue"
          show-value
          :color="$q.dark.isActive ? 'yellow' : 'primary'"
          :track-color="$q.dark.isActive ? 'grey-8' : 'grey-4'"
          center-color="transparent"
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
import { useClientStore } from 'stores/client'
import { convertSecondsToTime } from 'src/helpers/utils'

export default {
  name: 'CurrentEpoch',
  setup () {
    const clientStore = useClientStore()

    const progressValue = computed(() => {
      return Number((clientStore.session.sessionProgress * 100 / clientStore.session.sessionLength).toFixed(2))
    })

    const baseTime = computed(() => {
      return convertSecondsToTime(clientStore.session.sessionLength * 6, { d: false, h: true, m: false, s: false })
    })

    const remainingTime = computed(() => {
      return convertSecondsToTime((clientStore.session.sessionLength - clientStore.session.sessionProgress) * 6, { d: false, h: true, m: true, s: true })
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
