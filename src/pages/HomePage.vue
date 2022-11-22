<template>
  <div class="column">
    <ErasRewards v-if="erasRewards.length > 0" :rewards="erasRewards" class="q-pa-sm" />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useClientStore } from 'src/stores/client'
import ErasRewards from 'components/ErasRewards.vue'

export default {
  name: 'HomePage',

  components: {
    ErasRewards
  },

  setup () {
    const clientStore = useClientStore()

    const erasRewards = computed(() => clientStore.rewardsHistory)

    return {
      erasRewards
    }
  }
}
</script>
