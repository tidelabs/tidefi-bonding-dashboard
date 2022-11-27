<template>
  <div class="column full-width q-ma-md">
    <q-card class="column full-width">
      <highcharts
        :options="chartOptions"
        class="column full-width"
        style="max-width: 100%;"
      />
    </q-card>
  </div>
</template>

<script>
import { computed } from 'vue'
import { toBaseToken2 } from 'src/helpers/utils'
import { useClientStore } from 'src/stores/client'
import { useQuasar } from 'quasar'

export default {
  name: 'StakerRewards',

  props: {
    rewards: {
      type: Array,
      required: true
    }
  },

  setup (props) {
    const clientStore = useClientStore()
    const $q = useQuasar()

    // console.log('rewards:', props.rewards)

    function totalPool (eraReward) {
      let totalPool = 0
      if (eraReward.validators.length > 0) {
        totalPool = eraReward.validators.reduce((sum, validator) => {
          return sum + parseFloat(toBaseToken2(validator.pool, clientStore.decimals[ 0 ]))
        }, 0)
      }
      // console.log(`era: ${ eraReward.era }, reward: ${ totalPool }`)
      return totalPool
    }

    function totalReward (eraReward) {
      let totalReward = 0
      if (eraReward.validators.length > 0) {
        totalReward = eraReward.validators.reduce((sum, validator) => {
          return sum + parseFloat(toBaseToken2(validator.reward, clientStore.decimals[ 0 ]))
        }, 0)
      }
      // console.log(`era: ${ eraReward.era }, reward: ${ totalReward }`)
      return totalReward
    }

    const chartOptions = computed(() => {
      const options = {
        chart: {
          type: 'column',
          backgroundColor: 'transparent',
          style: {
            color: $q.dark.isActive ? 'yellow' : null
          },
          height: '300'
        },
        accessibility: {
          enabled: false,
          point: {
            descriptionFormatter: function (p) {
              // console.log(p)
              return p.category + ', ' + p.y + ' TDFY.'
            }
          }
        },
        title: {
          text: 'Stakers Rewards per Era',
          style: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: $q.dark.isActive ? 'yellow' : 'black'
          }
        },
        tooltip: {
          enabled: true,
          shadow: true,
          borderColor: $q.dark.isActive ? 'yellow' : null,
          backgroundColor: 'rgba(200, 200, 200, 0.80)',
          style: {
            color: $q.dark.isActive ? '#1d1d1d' : 'black',
            fontWeight: 'bold'
          },
          valueSuffix: ' TDFY',
          headerFormat: '<span style="font-size: 10px">Era: {point.key}</span><br><table>',
          pointFormat: '<tr><td style="padding:0;">{series.name}:</td><td style="text-align: right;"><strong>{point.y:.4f}</strong></td></tr>',
          footerFormat: '</table>',
          // footerFormat: '<tr><td>Percentage</td><td></td></tr></table>',
          shared: true,
          useHTML: true
        },
        legend: {
          enabled: false
        },
        credits: {
          enabled: false
        },
        xAxis: {
          categories: props.rewards ? props.rewards.map((eraReward) => eraReward.era) : [],
          crosshair: true,
          title: {
            text: 'Eras',
            style: {
              fontSize: '12px',
              color: $q.dark.isActive ? 'yellow' : 'black'
            }
          }
        },
        yAxis: [
          {
            title: {
              text: 'Validator Reward',
              style: {
                fontSize: '12px'
                // color: $q.dark.isActive ? 'yellow' : 'black'
              }
            }
          },
          {
            title: {
              text: 'This Nominator Reward',
              style: {
                fontSize: '12px'
                // color: $q.dark.isActive ? 'yellow' : 'black'
              }
            }
          }
        ],
        plotOptions: {
          column: {
            pointPadding: 0.2,
            // borderWidth: 0,
            borderRadius: 2
          },
          states: {
            hover: {
              enabled: true,
              radius: 3,
              lineColor: $q.dark.isActive ? '#FFFF00' : null
            }
          }
        },
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 500
              }
            }
          ]
        },
        series: [
          {
            name: 'Validator Reward',
            data: props.rewards ? props.rewards.map((eraReward) => totalPool(eraReward)) : []
          },
          {
            name: 'This Nominator Reward',
            data: props.rewards ? props.rewards.map((eraReward) => totalReward(eraReward)) : []
          }
        ]
      }

      return options
    })

    return {
      chartOptions
    }
  }
}
</script>

<style lang="scss">
.highcharts-color-0 {
  fill: #FF0000;
  stroke: #FFFF00;
}
.highcharts-color-1 {
  fill: #00FFFF;
  stroke: #FFFF00;
}
</style>
