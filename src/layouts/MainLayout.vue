<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      elevated
      class="glass"
    >
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          TIDEFI Bonding Dashboard
          <q-icon size="md">
            <svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
              <defs></defs>
              <ellipse style="fill: rgb(0,0,0);" cx="85" cy="85" rx="85" ry="85"></ellipse>
              <g transform="matrix(0.89002, 0, 0, 0.957882, 10.683616, 44.895252)" style="">
                <path d="M 99.888 29.697 C 108.946 28.599 116.494 24.482 124.18 20.502 C 129.944 17.619 135.571 14.737 141.473 11.992 C 145.041 10.345 148.747 9.385 152.727 9.659 C 159.864 10.208 164.53 14.874 164.53 22.148 C 164.53 31.893 159.864 39.304 151.629 44.245 C 142.571 49.735 133.101 49.735 123.494 45.617 C 115.808 42.323 109.22 37.245 102.77 32.03 C 101.946 31.481 100.985 30.658 99.888 29.697 Z" fill="#7CBFE7"></path>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M 117.592 71.008 C 133.101 72.38 145.727 67.027 155.197 53.989 C 154.511 54.264 154.236 54.401 153.962 54.538 C 145.178 57.832 136.257 58.518 127.199 56.46 C 118.141 54.401 110.318 50.009 102.907 44.931 C 92.202 37.657 82.595 29.011 72.988 20.364 L 72.987 20.364 C 66.674 14.737 60.086 9.522 52.538 5.542 C 45.401 1.699 37.853 -0.36 29.618 0.052 C 13.972 1.013 1.345 13.365 0.11 29.011 C -0.713 39.99 3.13 49.46 9.855 57.969 L 11.09 59.204 C 11.364 53.989 12.599 49.323 15.756 45.343 C 22.481 36.834 31.265 34.775 41.421 36.834 C 48.146 38.069 54.048 41.5 59.812 44.931 C 61.269 45.814 62.726 46.701 64.184 47.588 C 71.791 52.217 79.429 56.865 87.261 61.126 C 96.731 66.341 106.75 70.047 117.592 71.008 Z M 93.848 89.124 C 103.592 87.889 112.788 85.144 121.572 80.889 C 120.539 80.756 119.507 80.631 118.476 80.506 C 115.26 80.116 112.063 79.729 108.945 79.105 C 97.828 77.046 87.809 72.38 78.202 66.89 C 72.163 63.413 66.247 59.814 60.33 56.215 C 57.371 54.416 54.413 52.617 51.439 50.833 C 47.185 48.362 42.793 46.441 37.852 45.617 C 29.755 44.382 22.892 48.088 20.834 55.087 C 19.187 60.577 20.971 65.381 24.265 69.772 C 27.01 73.341 30.578 75.811 34.421 78.007 C 53.086 88.163 72.85 91.869 93.848 89.124 Z" fill="#7CFC00"></path>
              </g>
            </svg>
          </q-icon>
          </q-toolbar-title>

        <div class="column q-toolbar__title text-right ellipsis" style="font-size: 12px;">
          <div class="ellipsis">{{ clientStore.nodeName }} {{ clientStore.nodeVersion }}</div>
          <div class="ellipsis">{{ clientStore.consts.version.specName }}/{{ clientStore.consts.version.specVersion }}</div>
        </div>

        <q-btn
          aria-label="Dark theme toggle"
          flat
          round
          :icon="$q.dark.isActive ? matBrightness5 : matBrightness2"
          @click="$q.dark.toggle()"
        >
          <q-tooltip>Toggle dark mode</q-tooltip>
        </q-btn>

      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-select
          v-model="selectedNetwork"
          :options="chains"
          option-label="name"
          map-options
          outlines
          :disable="isLoading"
          color="purple-13"
          label="Selected network"
          input-class="q-mx-sm"
        />
        <q-item-label
          header
        >
          Essential Links
        </q-item-label>

        <InternalLink
          v-for="link in internalLinks"
          :key="link.title"
          v-bind="link"
        />

        <q-separator />
        <q-item-label
          header
        >
          External Links
        </q-item-label>

        <ExternalLink
          v-for="link in externalLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, onBeforeMount, getCurrentInstance, watch, computed } from 'vue'
import InternalLink from 'src/components/InternalLink.vue'
import ExternalLink from 'src/components/ExternalLink.vue'
import { useQuasar } from 'quasar'
import { useChainsStore } from 'stores/chain'
import { useEntitiesStore } from 'src/stores/entities'
import { useClientStore } from 'src/stores/client'
import { usePreferencesStore } from 'src/stores/preferences'
import {
  fabTwitter,
  fabFacebook,
  fabGithub,
  fabDiscord,
  fabYoutube,
  fabMedium,
  mdiHomeCircleOutline,
  fasHome,
  remNodeTree,
  fasAddressBook
} from 'assets/icons'
import { initializeClient } from 'src/helpers/utils'

const matBrightness2 = 'M0 0h24v24H0z@@fill:none;&&M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z'
const matBrightness5 = 'M0 0h24v24H0z@@fill:none;&&M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z'
const icoInputSearch = 'M21 12V10C21 7.23858 18.7614 5 16 5H8C5.23858 5 3 7.23858 3 10V10C3 12.7614 5.23858 15 8 15H12@@stroke-width:1.5;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;&&M20.1241 19.1185C20.6654 18.5758 21 17.827 21 17C21 15.3431 19.6569 14 18 14C16.3431 14 15 15.3431 15 17C15 18.6569 16.3431 20 18 20C18.8299 20 19.581 19.663 20.1241 19.1185ZM20.1241 19.1185L22 21@@stroke-width:1.5;fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;'

const internalList = [
  {
    title: 'Home Page',
    caption: 'Chain info',
    icon: fasHome,
    to: { name: 'home' }
  },
  {
    title: 'Validator Nodes',
    caption: 'Comparative data',
    icon: remNodeTree,
    to: { name: 'validators' }
  },
  {
    title: 'Validator Lookup',
    caption: 'Quantitative data',
    icon: 'search',
    to: { name: 'validator-lookup' }
  },
  {
    title: 'Address Lookup',
    caption: 'Look yourself up!',
    icon: icoInputSearch,
    to: { name: 'address-lookup' }
  },
  {
    title: 'Address Book',
    caption: 'Manage your aliases',
    icon: fasAddressBook,
    to: { name: 'address-book' }
  }
]
const externalList = [
  {
    title: 'TIDEFI',
    caption: 'tidefi.com',
    icon: mdiHomeCircleOutline,
    link: 'https://tidefi.com'
  },
  {
    title: 'Tide Labs',
    caption: 'tidelabs.org',
    icon: 'school',
    link: 'https://tidelabs.org'
  },
  {
    title: 'GitHub',
    caption: 'tidelabs',
    icon: fabGithub,
    link: 'https://github.com/tidelabs'
  },
  {
    title: 'Twitter',
    caption: '@Tidefi_DEX',
    icon: fabTwitter,
    link: 'https://twitter.com/Tidefi_DEX'
  },
  {
    title: 'Facebook',
    caption: '@Tidefidex',
    icon: fabFacebook,
    link: 'https://facebook.com/tidefidex'
  },
  {
    title: 'Discord Chat',
    caption: 'chat.tidefi.com',
    icon: fabDiscord,
    link: 'https://chat.tidefi.com'
  },
  {
    title: 'YouTube',
    caption: 'Tidefi TV',
    icon: fabYoutube,
    link: 'https://youtube.com/@tidefi'
  },
  {
    title: 'Blog',
    caption: 'Medium',
    icon: fabMedium,
    link: 'https://tidefi-official.medium.com/'
  }
]

export default defineComponent({
  name: 'MainLayout',

  components: {
    InternalLink,
    ExternalLink
  },

  setup () {
    const leftDrawerOpen = ref(false)
    const vm = getCurrentInstance()
    const $q = useQuasar() || vm.proxy.$q || vm.ctx.$q
    const chainsStore = useChainsStore()
    const clientStore = useClientStore()
    const entitiesStore = useEntitiesStore()
    const preferencesStore = usePreferencesStore()
    const theme = ref(null)
    const selectedNetwork = ref(null)

    onBeforeMount(() => {
      let val = $q.localStorage.getItem('chainName')
      if (val === 'null') val = null
      if (val) {
        chainsStore.chainName = val
      }
      else {
        chainsStore.chainName = chainsStore.chains[ 0 ].name
      }

      preferencesStore.restoreFilters()
      preferencesStore.restoreAliases()
    })

    // ----------------------------------------------------
    // dark mode preferences
    theme.value = $q.localStorage.getItem('theme')

    watch(() => $q.dark.isActive, val => {
      theme.value = val ? 'dark' : 'light'
    })

    watch(theme, (val) => {
      $q.localStorage.set('theme', val)
    })

    function setTheme (theme) {
      if (theme === null) {
        $q.dark.set('auto')
      }
      else if (theme === 'dark') {
        $q.dark.set(true)
      }
      else {
        $q.dark.set(false)
      }
    }

    setTheme(theme.value)

    // ----------------------------------------------------
    // chain name
    const chainName = computed(() => chainsStore.chainName)
    const chains = computed(() => chainsStore.chains)

    const isLoading = computed(() => {
      if (clientStore.isLoading) {
        return true
      }
      return entitiesStore.isLoading
    })

    watch(chainName, async () => {
      const chain = chainsStore.chains.find((chain, index) => {
        if (chain.name === chainName.value) {
          chainsStore.chainName = chainName.value
          chainsStore.chainIndex = index
          return chain
        }
        return undefined
      })

      if (!chain) {
        setDefaultChain()
        return
      }

      $q.localStorage.set('chainName', chainsStore.chains[ chainsStore.chainIndex ].name)
      console.log(`chain specs changed to: ${ chainsStore.chains[ chainsStore.chainIndex ].name } (${ chainsStore.chains[ chainsStore.chainIndex ].rpc })`)

      selectedNetwork.value = chain

      await initializeClient()
      // await initializeEntities()
    })

    function setDefaultChain () {
      chainsStore.chainName = chainsStore.chains[ 0 ].name
      chainsStore.chainIndex = 0
      chainsStore.client = null
    }

    watch(selectedNetwork, (val) => {
      // console.log('selectedNetwork changed:', selectedNetwork.value)
      // verify different network
      if (chainsStore.chainName === val.name) {
        return
      }

      chainsStore.chainName = val.name
    })

    // async function initializeEntities () {
    //   // clear any existing entities
    //   entitiesStore.resetEntities()

    //   // get latest validators
    //   const validators = await chainsStore.client.api.query.session.validators()
    //   if (validators && validators.length > 0) {
    //     validators.forEach(async (val) => {
    //       // console.log('validator:', val)
    //       const validator = new Entity(val.toString(), val, true)
    //       await validator.connect()
    //       entitiesStore.entities.push(validator)
    //       console.log('validator:', validator)
    //     })
    //   }

    //   // const disabledValidators = await chainsStore.client.api.query.session.disabledValidators()
    //   // if (disabledValidators && disabledValidators.length > 0) {
    //   //   disabledValidators.forEach(async (val) => {
    //   //     // console.log('validator:', val)
    //   //     const validator = new Entity(chainsStore.client, val.toString(), val, true)
    //   //     await validator.connect()
    //   //     entitiesStore.validators.push(validator)
    //   //     console.log('validator:', validator)
    //   //   })
    //   // }
    // }

    return {
      internalLinks: internalList,
      externalLinks: externalList,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      clientStore,
      matBrightness2,
      matBrightness5,
      chains,
      selectedNetwork,
      isLoading
    }
  }
})
</script>
