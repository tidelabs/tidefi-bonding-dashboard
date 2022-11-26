<template>
  <div class="column full-width q-ma-sm">
    <q-card>
      <highcharts
        :options="chartOptions"
        class="full-width"
      />
    </q-card>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useQuasar } from 'quasar'

export default {
  name: 'ErasRewardPoints',
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
          text: 'Eras Reward Points',
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
          headerFormat: '<span style="font-size: 10px">{point.key}</span><br/>',
          valueSuffix: ' Pts.'
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
              color: $q.dark.isActive ? 'yellow' : 'black'
            }
          }
        },
        yAxis: {
          // min: 0,
          title: {
            text: 'Points',
            style: {
              fontSize: '12px',
              color: $q.dark.isActive ? 'yellow' : 'black'
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

    return {
      chartOptions
    }
  }
}
</script>
