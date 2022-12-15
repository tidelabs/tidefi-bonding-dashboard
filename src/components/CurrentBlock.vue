<template>
  <q-card class="panel col q-ma-sm q-pa-sm">
    <div class="column justify-start items-center">
      <div class="col column items-center justify-end">Current Block</div>
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
          {{ (maxBlockTime * progressValue / 100 / 1000).toFixed(1) }}s
        </q-circular-progress>
        <div class="col column">
          <div class="col row items-center justify-start no-wrap">{{ clientStore.currentHeader.number }}</div>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
import { computed, watch, ref } from 'vue'
import { useClientStore } from 'src/stores/client'

export default {
  name: 'CurrentBlock',
  setup () {
    const clientStore = useClientStore()
    const maxBlockTime = clientStore.expectedBlockTime || 6000
    const incrementTime = 250 // update visuals 4 times a second
    const intervalTime = ref(0)
    let intervalId = null

    function clearTimer () {
      clearInterval(intervalId)
      intervalTime.value = 0
    }

    function setCountdown () {
      clearTimer()
      intervalId = setInterval(() => {
        intervalTime.value += incrementTime
      }, incrementTime)
    }

    const progressValue = computed(() => {
      return Number((100 * intervalTime.value / maxBlockTime).toFixed(2))
    })

    watch(() => clientStore.currentHeader.number, () => {
      setCountdown()
    })

    watch(intervalTime, async (val) => {
      if (!clientStore.isLoading) {
        const value = parseFloat(val)
        if (value > (1000 * 60)) { // 1 minute
          // wait 1 more minute, if this one does not succeed
          intervalTime.value = 0

          // try to reconnect
          await clientStore.client.reconnect()
        }
      }
    })

    return {
      clientStore,
      progressValue,
      maxBlockTime
    }
  }
}
</script>
