<template>
  <div class="column full-width q-mt-md">
    <apexchart
      ref="chart"
      type="line"
      height="200"
      :options="chartOptions"
      :series="chartData"
    />
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { toBaseToken2 } from 'src/helpers/utils'
import { useClientStore } from 'src/stores/client'
import { extend } from 'quasar'
import { globalOptions } from 'assets/chartOptions'

export default {
  name: 'ErasRewards',

  props: {
    rewards: {
      type: Array,
      required: true
    }
  },

  setup (props) {
    const clientStore = useClientStore()
    const chart = ref(null)

    const chartData = computed(() => {
      return [{
        data: props.rewards ? props.rewards.map((eraReward) => {
          return toBaseToken2(eraReward.rewards, clientStore.decimals[ 0 ])
        }) : []
      }]
    })

    const chartOptions = computed(() => {
      const optionsLine = {
        chart: {
          id: '-eras-rewards'
        },
        stroke: {
          curve: 'straight',
          width: 5
        },
        xaxis: {
          categories: props.rewards ? props.rewards.map((eraReward) => eraReward.era) : []
        },
        title: {
          text: 'Eras Rewards (TDFY)'
        }
      }

      return extend(true, globalOptions, optionsLine)
    })

    return {
      chartData,
      chartOptions,
      chart
    }
  }
}
</script>
