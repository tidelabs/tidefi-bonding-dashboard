<template>
  <div class="column full-width q-mt-md">
    <div>Validator Eras Reward Points</div>
    <apexchart
      type="line"
      height="200"
      :options="chartOptions"
      :series="chartData"
    />
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'ValidatorRewardPoints',
  props: {
    validator: {
      type: Object,
      required: true
    }
  },
  setup (props) {
    const chartData = computed(() => {
      return [{
        data: props.validator ? props.validator.erasRewardPoints.map((reward) => reward.amount) : []
      }]
    })

    const chartOptions = computed(() => {
      return {
        xaxis: {
          categories: props.validator ? props.validator.erasRewardPoints.map((reward) => reward.era) : []
        }
      }
    })

    return {
      chartData,
      chartOptions
    }
  }
}
</script>
