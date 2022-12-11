<template>
  <div class="column full-width q-ma-md">
    <q-card class="column full-width">
      <highcharts
        :options="chartOptions"
        class="column full-width staker-rewards"
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
      required: false,
      validator: (prop) => typeof prop === 'object' || prop === null
    },
    isValidator: {
      type: Boolean,
      required: false,
      default: false
    },
    subtitle: {
      type: String,
      required: false,
      default: ''
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
        colors: $q.dark.isActive ? [ '#8087E8', '#A3EDBA', '#F19E53', '#6699A1',
          '#E1D369', '#87B4E7', '#DA6D85', '#BBBAC5' ] : [ '#8087E8', '#A3EDBA',
          '#F19E53', '#6699A1', '#E1D369', '#87B4E7', '#DA6D85', '#BBBAC5' ],
        chart: {
          type: 'column',
          styledMode: false,
          backgroundColor: 'transparent',
          style: {
            color: $q.dark.isActive ? 'yellow' : 'black'
          },
          height: '300',
          zooming: {
            type: 'x'
          }
        },
        title: {
          text: props.isValidator ? 'Validator Rewards per Era' : 'Stakers Rewards per Era',
          style: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: $q.dark.isActive ? 'yellow' : 'black'
          }
        },
        subtitle: {
          text: props.subtitle,
          style: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: $q.dark.isActive ? 'yellow' : 'black'
          }
        },
        accessibility: {
          enabled: false
        },
        tooltip: {
          enabled: true,
          shadow: false,
          borderColor: $q.dark.isActive ? 'yellow' : 'black',
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
          enabled: true,
          backgroundColor: 'transparent',
          itemStyle: {
            fontWeight: '400',
            fontSize: '12px',
            color: $q.dark.isActive ? '#fff' : '#2F2B38'
          },
          itemHoverStyle: {
            fontWeight: '700',
            color: $q.dark.isActive ? '#fff' : '#46465C'
          }
        },
        labels: {
          style: {
            color: $q.dark.isActive ? '#707073' : '#46465C'
          }
        },
        credits: {
          enabled: false
        },
        xAxis: {
          categories: props.rewards
            ? props.rewards.map((eraReward) => eraReward.era)
            : [],
          crosshair: true,
          title: {
            text: 'Eras',
            style: {
              fontSize: '12px',
              color: $q.dark.isActive ? 'yelow' : 'black'
            }
          },
          gridLineColor: $q.dark.isActive ? '#707073' : '#ccc',
          labels: {
            style: {
              color: $q.dark.isActive ? '#fff' : '#46465C',
              fontSize: '12px'
            }
          },
          lineColor: $q.dark.isActive ? '#707073' : '#ccc',
          minorGridLineColor: $q.dark.isActive ? '#505053' : '#ebebeb',
          tickColor: $q.dark.isActive ? '#707073' : '#ccc'
        },
        yAxis: [
          {
            title: {
              text: 'Total Validator Reward',
              style: {
                fontSize: '12px',
                color: $q.dark.isActive ? 'yellow' : 'black',
                fontWeight: '300'
              }
            },
            gridLineColor: $q.dark.isActive ? '#707073' : '#ccc',
            labels: {
              style: {
                fontSize: '12px',
                color: $q.dark.isActive ? '#fff' : '#46465C',
                fontWeight: '300'
              }
            },
            lineColor: $q.dark.isActive ? '#707073' : '#ccc',
            minorGridLineColor: $q.dark.isActive ? '#505053' : '#ebebeb',
            tickColor: $q.dark.isActive ? '#707073' : '#ccc',
            tickWidth: 1
          },
          {
            title: {
              text: props.isValidator ? 'Validator Self-staked Reward' : 'This Nominator Reward',
              style: {
                fontSize: '12px',
                color: $q.dark.isActive ? 'yellow' : 'black',
                fontWeight: '300'
              }
            },
            gridLineColor: $q.dark.isActive ? '#707073' : '#ccc',
            labels: {
              style: {
                fontSize: '12px',
                color: $q.dark.isActive ? '#fff' : '#46465C',
                fontWeight: '300'
              }
            },
            lineColor: $q.dark.isActive ? '#707073' : '#ccc',
            minorGridLineColor: $q.dark.isActive ? '#505053' : '#ebebeb',
            tickColor: $q.dark.isActive ? '#707073' : '#ccc',
            tickWidth: 1
          }
        ],
        // scrollablePlotArea: {
        //   minWidth: 400
        // },
        plotOptions: {
          series: {
            dataLabels: {
              color: $q.dark.isActive ? '#46465C' : '#46465C',
              style: {
                fontSize: '13px'
              }
            },
            marker: {
              lineColor: $q.dark.isActive ? '#333' : '#46465C'
            }
          },
          column: {
            pointPadding: 0.2,
            borderWidth: 0,
            borderRadius: 2,
            groupPadding: 0.2,
            shadow: false
          },
          states: {
            hover: {
              enabled: true,
              radius: 3,
              lineColor: $q.dark.isActive ? '#FFFF00' : '#ccc'
            }
          }
        },
        // drilldown: {
        //   activeAxisLabelStyle: {
        //     color: '#F0F0F3'
        //   },
        //   activeDataLabelStyle: {
        //     color: '#F0F0F3'
        //   },
        //   drillUpButton: {
        //     theme: {
        //       fill: '#fff'
        //     }
        //   }
        // },
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
            name: 'Total Validator Reward',
            data: props.rewards
              ? props.rewards.map((eraReward) => totalPool(eraReward))
              : []
          },
          {
            name: props.isValidator ? 'Validator Self-staked Reward' : 'This Nominator Reward',
            data: props.rewards
              ? props.rewards.map((eraReward) => totalReward(eraReward))
              : []
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
