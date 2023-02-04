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
            :rules="[val => isValidAddress(val)  || 'Invalid address']"
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
          :disable="!aliasName || aliasExists(aliasName) || !isValidAddress(aliasAddress)"
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
      <q-btn
        label="Add alias"
        no-caps
        icon="add"
        rounded
        @click="showAliasDialog = true; aliasName = ''; aliasAddress = ''"
      />
    </div>
    <div class="row justify-center">
      <q-list
        bordered
        separator
        style="max-width: 600px; width: 100%;"
      >
        <q-item v-for="alias in filteredAliases" :key="alias.address" style="min-height: 60px;">
          <q-item-section top>
            <q-item-label>{{ alias.name }}</q-item-label>
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
    </q-list>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { usePreferencesStore } from 'src/stores/preferences'
import { isValidAddress } from 'src/helpers/utils'

export default {
  name: 'Address Book',

  setup () {
    const filteredAlias = ref('')
    const showAliasDialog = ref(false)
    const showConfirmDialog = ref(false)
    const aliasName = ref('')
    const aliasAddress = ref('')
    const preferencesStore = usePreferencesStore()

    const aliases = computed(() => preferencesStore.aliases)

    // filter aliases by user value
    const filteredAliases = computed(() => {
      // return all if nothing to filter from
      if (!filteredAlias.value) {
        return aliases.value
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
      preferencesStore.removeAlias(aliasAddress.value)
      showConfirmDialog.value = false
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
      onRemoveAlias
    }
  }
}
</script>
