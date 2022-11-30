import { computed } from 'vue'

export default function () {
  function lastPaidOut (currentEra, lastEra) {
    const lastPayout = computed(() => {
      if (lastEra === -1) {
        return 'never'
      }

      const days = currentEra - lastEra
      switch (days) {
        case 0:
          return 'recently'
        case 1:
          return 'yesterday'
        default:
          return `${ days } days`
      }
    })

    return lastPayout
  }

  return {
    lastPaidOut
  }
}
