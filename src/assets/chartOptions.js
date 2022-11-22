export const globalOptions
  = {
    chart: {
      // foreColor: '#fff',
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: {
          speed: 1000
        }
      },
      dropShadow: {
        enabled: false,
        opacity: 0.3,
        blur: 5,
        left: -7,
        top: 22
      },
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    colors: [ '#FCCF31', '#17ead9', '#f02fc2' ],
    dataLabels: {
      enabled: false
    },
    // fill: {
    //   type: 'gradient',
    //   gradient: {
    //     gradientToColors: [ '#F55555', '#6078ea', '#6094ea' ]
    //   }
    // },
    grid: {
      show: true,
      borderColor: '#40475D',
      padding: {
        left: 0,
        right: 0
      }
    },
    legend: {
      show: true,
      floating: true,
      horizontalAlign: 'left',
      onItemClick: {
        toggleDataSeries: false
      },
      position: 'top',
      offsetY: -28,
      offsetX: 60
    },
    markers: {
      size: 4,
      colors: ['#FF00FF'],
      strokeColors: '#00FF00',
      hover: {
        size: 6
      }
    },
    stroke: {
      width: 3
    },
    subtitle: {
      floating: true,
      align: 'right',
      offsetY: 0,
      style: {
        fontSize: '12px'
      }
    },
    title: {
      align: 'left',
      style: {
        fontSize: '22px'
      }
    },
    tooltip: {
      theme: 'dark'
      // x: {
      //   formatter: function (val) {
      //     return moment(new Date(val)).format("HH:mm:ss")
      //   }
      // }
    },
    yaxis: {
      decimalsInFloat: 4,
      // opposite: true,
      labels: {
        offsetX: -10
      }
    },
    xaxis: {
      axisTicks: {
        color: '#333'
      },
      axisBorder: {
        color: '#333'
      }
    }
  }
