<template>
  <div class="column full-width q-ma-md">
    <q-card class="column full-width">
      <highcharts
        :options="chartOptions"
        class="column full-width"
      />
    </q-card>
    <q-resize-observer @resize="onResize" />
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { toBaseToken2 } from 'src/helpers/utils'
import { useClientStore } from 'src/stores/client'

export default {
  name: 'BondingHistory',
  props: {
    bondingHistory: {
      type: Array,
      required: false,
      validator: (prop) => typeof prop === 'object' || prop === null
    }
  },
  setup (props) {
    const clientStore = useClientStore()
    const $q = useQuasar()
    const size = ref({ width: 200, height: 200 })

    function onResize (sz) {
      size.value = sz
    }

    const chartOptions = computed(() => {
      const options = {
        colors: $q.dark.isActive ? [ '#8087E8', '#A3EDBA', '#F19E53', '#6699A1',
          '#E1D369', '#87B4E7', '#DA6D85', '#BBBAC5' ] : [ '#8087E8', '#A3EDBA',
          '#F19E53', '#6699A1', '#E1D369', '#87B4E7', '#DA6D85', '#BBBAC5' ],
        chart: {
          type: 'spline',
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
          text: 'Bonding History',
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
          pointFormat: '<tr><td style="padding:0;">{series.name}:</td><td style="text-align: right;"><strong>{point.y}</strong></td></tr>',
          footerFormat: '</table>',
          useHTML: true
        },
        legend: {
          enabled: false,
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
          categories: props.bondingHistory
            ? props.bondingHistory.map((bonding) => bonding.era)
            : [],
          crosshair: true,
          title: {
            text: 'Eras',
            style: {
              fontSize: '12px',
              color: $q.dark.isActive ? 'yellow' : 'black'
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
        yAxis: {
          // min: 0,
          // decimalsInFloat: 4,
          title: {
            text: 'TDFY',
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
          spline: {
            lineColor: '#00FF00',
            lineWidth: 1,
            marker: {
              enabled: parseInt(size.value.width) > 700,
              // color: $q.dark.isActive ? 'yellow' : null,
              fillColor: '#FF00FF'
            }
          },
          states: {
            hover: {
              enabled: true,
              radius: 3,
              lineColor: $q.dark.isActive ? '#FFFF00' : '#ccc'
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
          name: 'Total Bonded',
          data: props.bondingHistory
            ? props.bondingHistory.map((bonding) => parseFloat(toBaseToken2(bonding.total, clientStore.decimals[ 0 ])))
            : []
        }]
      }

      return options
    })

    return {
      chartOptions,
      onResize
    }
  }
}
</script>
