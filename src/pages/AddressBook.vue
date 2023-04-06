<template>
  <div class="q-pa-xs full-width">
    <q-dialog
      v-model="showConfirmDialog"
    >
      <q-card style="min-width: 300px;">
        <q-card-section>
          <div class="text-h6">Confirm delete for: </div>
          <q-separator />
          <div class="row">
            <span style="min-width: 60px;">Name:</span><span>{{ aliasName }}</span>
          </div>
          <div class="row">
            <span style="min-width: 60px;">Address:</span><span class="ellipsis">{{ aliasAddress }}</span>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions vertical>
          <q-btn
            label="Remove"
            flat
            no-caps
            @click="onRemoveAlias"
          />
          <q-btn
            label="Cancel"
            flat
            no-caps
            @click="showConfirmDialog = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="showAliasDialog"
    >
    <q-card style="min-width: 300px;">
      <q-card-section>
        <div class="text-h6">Add alias: </div>
        <div class="q-gutter-xs">
          <q-input
            outlined
            v-model="aliasAddress"
            label="Address"
            color="purple-13"
            :rules="[val => isValidAddress(val)  || 'Invalid address', val => isAddressAvailable(val) || 'Address already used']"
          />
          <q-input
            outlined
            v-model="aliasName"
            label="Name"
            color="purple-13"
          />
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions vertical>
        <q-btn
          flat
          :disable="shouldDisableSave"
          @click="onSaveAlias"
        >Save</q-btn>
        <q-btn
          flat
          @click="showAliasDialog = false"
        >Cancel</q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

    <div class="row justify-around items-center q-mb-md">
      <q-input
        v-model="filteredAlias"
        label="Filter by alias"
        outlined
        clearable
        color="purple-13"
        style="min-width: 300px; max-height: 56px;"
        class="ellipsis"
      />
      <div class="row justify-center items-center q-gutter-sm">
        <q-btn
          label="Add alias"
          no-caps
          icon="add"
          rounded
          @click="showAliasDialog = true; aliasName = ''; aliasAddress = ''"
        />
        <q-btn
          label="Export"
          no-caps
          :icon="bxExport"
          rounded
          @click="onExport"
        />
        <q-btn
          label="Import"
          no-caps
          :icon="bxImport"
          rounded
          @click="onImport"
        />
      </div>
    </div>
    <div v-if="filteredAliases.length > 0" class="row justify-center q-gutter-sm">
      <q-card v-for="( alias, index ) in filteredAliases" :key="alias.address + '_' + index" style="width: 380px; height: 60px;">
        <q-item>
          <q-item-section top>
            <q-item-label><Identicon :address="alias.address" />{{ alias.name }}</q-item-label>
            <q-item-label caption style="font-size: 11px;" class="ellipsis">
              <router-link
                :to="{ name: 'address-lookup', params: { address: alias.address } }"
                class="entity-link"
              >
                {{ alias.address }}
              </router-link>
            </q-item-label>
          </q-item-section>
          <q-item-section side class="">
            <div class="text-grey-8 q-gutter-xs">
              <q-btn class="" size="10px" flat dense round icon="delete" @click="aliasAddress = alias.address; aliasName = alias.name; showConfirmDialog = true;"/>
              <!-- <q-btn class="" size="10px" flat dense round icon="edit"/> -->
            </div>
          </q-item-section>
        </q-item>
      </q-card>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { usePreferencesStore } from 'src/stores/preferences'
import { isValidAddress } from 'src/helpers/utils'
import { bxExport, bxImport } from 'src/assets/icons'
import { exportFile, useQuasar } from 'quasar'
import { merge } from 'src/helpers/merge'

import Identicon from 'src/components/Identicon.vue'

export default {
  name: 'Address Book',

  components: {
    Identicon
  },

  setup () {
    const $q = useQuasar()
    const filteredAlias = ref('')
    const showAliasDialog = ref(false)
    const showConfirmDialog = ref(false)
    const aliasName = ref('')
    const aliasAddress = ref('')
    const preferencesStore = usePreferencesStore()

    const aliases = computed(() => preferencesStore.aliases)
    const sortedAliases = computed(() => preferencesStore.getAliasesSorted())

    // filter aliases by user value
    const filteredAliases = computed(() => {
      // return all if nothing to filter from
      if (!filteredAlias.value) {
        return sortedAliases.value
      }
      // find aliases that match
      const filtered = []
      const contact = filteredAlias.value.toLowerCase()
      preferencesStore.aliases.forEach((alias) => {
        if (alias.name.toLowerCase().indexOf(contact) > -1) {
          filtered.push(alias)
        }
      })
      return filtered
    })

    function aliasExists (contact) {
      // console.log('aliasExists:', contact)
      return aliases.value.find((alias) => alias.name === contact)
    }

    function onSaveAlias () {
      preferencesStore.addAlias(aliasAddress.value, aliasName.value)
      showAliasDialog.value = false
    }

    function onRemoveAlias () {
      preferencesStore.removeAlias(aliasAddress.value, aliasName.value)
      showConfirmDialog.value = false
    }

    function isAddressAvailable (address) {
      return !aliases.value.find((alias) => alias.address === address)
    }

    const shouldDisableSave = computed(() => {
      if (aliasName.value && aliasAddress.value) {
        if (!aliasExists(aliasName.value)) {
          if (isValidAddress(aliasAddress.value)) {
            if (isAddressAvailable(aliasAddress.value)) {
              return false
            }
          }
        }
      }
      return true
    })

    function onExport () {
      if (exportFile('aliases.json', JSON.stringify(sortedAliases.value), 'application/json')) {
        // success!
        $q.notify({
          message: 'Aliases saved!!',
          position: 'top-right'
        })
      }
      else {
        $q.notify({
          type: 'negative',
          message: 'Aliases export failed!!',
          position: 'top-right'
        })
      }
    }

    async function onImport () {
      const pickerOpts = {
        types: [
          {
            description: 'JSON',
            accept: {
              'application/json': ['.json']
            }
          }
        ],
        excludeAcceptAllOption: true,
        multiple: false
      }

      try {
        const [fileHandle] = await window.showOpenFilePicker(pickerOpts)
        const file = await fileHandle.getFile()
        const contents = JSON.parse(await file.text())
        // console.log('filePicker:', file, contents)
        const { uniques } = merge(preferencesStore.aliases, contents)
        preferencesStore.aliases.push(...uniques)
        preferencesStore.saveAliases()
        $q.notify({
          message: 'Aliases imported!!',
          position: 'top-right'
        })
      }
      catch (e) {
        console.log(e)
        $q.notify({
          type: 'negative',
          message: 'Aliases import failed!!',
          // caption: e,
          position: 'top-right'
        })
      }
    }

    return {
      filteredAliases,
      filteredAlias,
      showAliasDialog,
      showConfirmDialog,
      aliasName,
      aliasAddress,
      aliasExists,
      isValidAddress,
      onSaveAlias,
      onRemoveAlias,
      isAddressAvailable,
      shouldDisableSave,
      bxExport,
      bxImport,
      onExport,
      onImport
    }
  }
}
</script>
