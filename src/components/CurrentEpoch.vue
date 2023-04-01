<template>
  <q-card class="panel col q-ma-sm q-pa-sm">
    <div class="column justify-start items-center">
      <div class="col column items-center justify-center no-wrap text-bold"><span :class="$q.dark.isActive ? 'text-yellow' : 'text-primary'">Current Epoch</span></div>
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
          <div class="col row items-center justify-start no-wrap text-bold"><span :class="$q.dark.isActive ? 'text-yellow' : 'text-primary'">{{ sessionIndex }}</span></div>
          <div class="col row items-center justify-start no-wrap">{{ baseTime }}<q-tooltip>Duration</q-tooltip></div>
          <div class="col row items-center justify-start no-wrap">{{ remainingTime }}<q-tooltip>Remaining</q-tooltip></div>
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

    const sessionIndex = computed(() => clientStore.sessionIndex)

    return {
      progressValue,
      baseTime,
      remainingTime,
      sessionIndex
    }
  }
}
</script>
