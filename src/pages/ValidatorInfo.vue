<template>
  <div v-if="validator === null" class="error-message column justify-center items-center">
    <div class="q-mt-lg">
      Validator address not found!
      <q-icon :name="infoIcon">
        <q-tooltip>
          {{ $route.params.address }}
        </q-tooltip>
      </q-icon>
    </div>
    <div>
      Did you change networks while on this page?
    </div>
  </div>

</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useEntitiesStore } from 'src/stores/entities'

const infoIcon = 'M24 44C29.5228 44 34.5228 41.7614 38.1421 38.1421C41.7614 34.5228 44 29.5228 44 24C44 18.4772 41.7614 13.4772 38.1421 9.85786C34.5228 6.23858 29.5228 4 24 4C18.4772 4 13.4772 6.23858 9.85786 9.85786C6.23858 13.4772 4 18.4772 4 24C4 29.5228 6.23858 34.5228 9.85786 38.1421C13.4772 41.7614 18.4772 44 24 44Z@@fill:currentColor;fill-opacity:0.6;;stroke:currentColor;stroke-width:4;stroke-linejoin:round&&M24 11C25.3807 11 26.5 12.1193 26.5 13.5C26.5 14.8807 25.3807 16 24 16C22.6193 16 21.5 14.8807 21.5 13.5C21.5 12.1193 22.6193 11 24 11Z@@fill:none;fill-rule:evenodd;clip-rule:evenodd;fill:white;&&M24.5 34V20H23.5H22.5@@fill:none;stroke:white;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;&&M21 34H28@@fill:none;stroke:white;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;|0 0 48 48'

export default {
  name: 'ValidatorInfo',

  setup () {
    const route = useRoute()
    const entitiesStore = useEntitiesStore()

    const validator = computed(() => {
      const v = entitiesStore.getValidators.find((val) => val.address === route.params.address)
      if (v) {
        console.log('Selected validator:', v)
        return v
      }
      return null
    })

    // console.log('Look up validator:', route.params.address)

    return {
      validator,
      infoIcon
    }
  }
}
</script>

<style lang="scss" scoped>
.error-message {
  font-size: 1.2rem;
  color: red;
}
</style>
