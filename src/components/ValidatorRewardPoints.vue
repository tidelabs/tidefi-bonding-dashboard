<template>
  <div class="column full-width">
    <q-card>
      <highcharts
        :options="chartOptions"
      />
    </q-card>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useQuasar } from 'quasar'

export default {
  name: 'ValidatorRewardPoints',
  props: {
    erasRewardPoints: {
      type: Array,
      required: true
    }
  },
  setup (props) {
    const $q = useQuasar()

    const chartOptions = computed(() => {
      const options = {
        chart: {
          type: 'spline',
          backgroundColor: 'transparent',
          style: {
            color: $q.dark.isActive ? 'yellow' : null
          },
          height: '300'
        },
        accessibility: {
          point: {
            descriptionFormatter: function (p) {
              console.log(p)
              return p.category + ', ' + p.y + ' TDFY.'
            }
          }
        },
        title: {
          text: 'Eras Rewards',
          style: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: $q.dark.isActive ? 'yellow' : 'currentColor'
          }
        },
        tooltip: {
          enabled: true,
          shadow: true,
          borderColor: $q.dark.isActive ? 'yellow' : null,
          backgroundColor: 'rgba(200, 200, 200, 0.80)',
          style: {
            color: $q.dark.isActive ? '#1d1d1d' : 'currentColor',
            fontWeight: 'bold'
          },
          headerFormat: '<span style="font-size: 10px">{point.key}</span><br/>',
          valueSuffix: ' TDFY'
        },
        legend: {
          enabled: false
        },
        credits: {
          enabled: false
        },
        xAxis: {
          categories: props.erasRewardPoints
            ? props.erasRewardPoints.map((reward) => reward.era)
            : [],
          crosshair: true,
          title: {
            text: 'Eras',
            style: {
              fontSize: '12px',
              color: $q.dark.isActive ? 'yellow' : 'currentColor'
            }
          }
        },
        yAxis: {
          // min: 0,
          title: {
            text: 'TDFY',
            style: {
              fontSize: '12px',
              color: $q.dark.isActive ? 'yellow' : 'currentColor'
            }
          }
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0
          },
          areaspline: {
            marker: {
              enabled: true,
              fillColor: $q.dark.isActive ? 'yellow' : null
            }
          },
          spline: {
            lineColor: $q.dark.isActive ? '#FF00FF' : null,
            lineWidth: 1,
            marker: {
              enabled: true,
              color: $q.dark.isActive ? 'yellow' : null,
              fillColor: $q.dark.isActive ? '#00FF00' : null
            }
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
        series: [{
          name: 'Reward',
          data: props.erasRewardPoints
            ? props.erasRewardPoints.map((reward) => reward.amount)
            : []
        }]
      }

      return options
    })

    // computed(() => {
    //   debugger
    //   const optionsLine = {
    //     chart: {
    //       id: '-validator-reward-points',
    //       type: 'line'
    //     },
    //     stroke: {
    //       curve: 'straight',
    //       width: 5
    //     },
    //     xaxis: {
    //       categories: props.erasRewardPoints ? props.erasRewardPoints.map((reward) => reward.era) : []
    //     },
    //     title: {
    //       text: 'Validator Eras Reward Points'
    //     }
    //   }

    //   const options = extend(true, globalOptions, optionsLine)
    //   chart.value && chart.value.updateOptions(toRaw(options))
    //   return options
    // })

    return {
      chartOptions
    }
  }
}
</script>
