<template>
  <div class="q-ma-sm">
    <FilterInfo v-model="displayFilterInfoModal" />
    <q-table
      title="Validators"
      dense
      :rows="filteredValidators"
      :columns="columns"
      :loading="tableLoading"
      :pagination="pagination"
      :grid="$q.screen.xs"
      row-key="name"
      :sort-method="customSort"
      binary-state-sort
      card-container-class="row justify-center"
    >
      <template v-slot:top>
        <div class="full-width row justify-start items-center">
          <q-expansion-item
            class="full-width rounded-borders"
          >
            <template v-slot:header>
              <q-item-section>
                <div class="row justify-start items-center">
                  <div>Exclude from Search</div>
                  <q-btn dense flat unelevated round size="md" :icon="infoIcon" @click.stop="displayFilterInfoModal = !displayFilterInfoModal" />
                  <div v-if="hasFilter"><q-icon :name="solidCheckCircle" size="md" color="purple-13" ><q-tooltip>1 or more Filters are active</q-tooltip></q-icon></div>
                </div>
              </q-item-section>
            </template>
            <q-card class="rounded-borders">
              <q-card-section class="q-gutter-sm">
                <!-- <div class="row justify-evenly items-center q-gutter-sm"> -->
                  <q-toggle dense color="purple-13" v-model="preferencesStore.filters.inactive" label="Inactive Validators" />
                  <q-toggle dense color="purple-13" v-model="preferencesStore.filters.nextSet" label="Not Elected Next Set" />
                  <q-toggle dense color="purple-13" v-model="preferencesStore.filters.highCommission" label="High Commission (>10%)" />
                  <q-toggle dense color="purple-13" v-model="preferencesStore.filters.oversubscribed" label="Oversubscribed" />
                  <q-toggle dense color="purple-13" v-model="preferencesStore.filters.blockedNominations" label="Blocked Nominations" />
                  <q-toggle dense color="purple-13" v-model="preferencesStore.filters.missingIdentity" label="Missing Identity" />
                  <!-- <q-toggle dense color="purple-13" v-model="preferencesStore.filters.noVerifiedIdentity" label="No Verified Identity" /> -->
                  <q-toggle dense color="purple-13" v-model="preferencesStore.filters.notStaked" label="Not Staked" />
                  <q-toggle dense color="purple-13" v-model="preferencesStore.filters.selfController" label="Self Controller" />
                  <!-- <q-toggle dense color="purple-13" v-model="preferencesStore.filters.belowAvgPoints" label="Below Average Era Points" /> -->
                  <!-- <q-toggle dense color="purple-13" v-model="preferencesStore.filters.slashed" label="Slashed" /> -->
                  <!-- <q-toggle dense color="purple-13" v-model="preferencesStore.filters.noGovernance" label="No Governance Participation" /> -->
                <!-- </div> -->
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </div>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">

          <q-td key="block_count" :props="props">
            <div class="row justify-evenly items-center no-wrap">
              <div style="min-width: 33px;">
                <q-badge v-if="props.row.blockCount" :label="props.row.blockCount" class="justify-center">
                  <q-tooltip>Blocks produced this era</q-tooltip>
                </q-badge>
              </div>
            </div>
          </q-td>

          <q-td key="flags" :props="props">
            <div class="row justify-evenly items-center no-wrap">
              <!-- <div style="min-width: 18px;">
                <q-icon :name="isInvulnerable(props.row) ? solidLockClosed : solidLockOpen" size="18px" color="blue-grey-3">
                  <q-tooltip>
                    {{ isInvulnerable(props.row) ? 'protected' : 'not protected'}}
                  </q-tooltip>
                </q-icon>
              </div> -->

              <div style="min-width: 18px;">
                <q-icon v-if="props.row.isSlashed" :name="fasLocationCrosshairs" size="18px" color="red-6">
                  <q-tooltip>
                    This validator has been previously slashed
                  </q-tooltip>
                </q-icon>
              </div>

              <div style="min-width: 18px;">
                <q-icon :name="props.row.identity.identityIcon" size="18px" color="blue-grey-3">
                  <q-tooltip>
                    {{ props.row.identity.identityTooltip }}
                  </q-tooltip>
                </q-icon>
              </div>

              <div style="min-width: 18px;">
                <q-icon v-if="props.row.nextElected" :name="mdiChevronRightCircle" size="18px" color="green-6">
                  <q-tooltip>
                    Validator is elected to the next set
                  </q-tooltip>
                </q-icon>
              </div>

            </div>
          </q-td>

          <q-td key="name" :props="props">
            <div class="row justify-start items-center no-wrap">
              <div class="col-shrink">
                <div class="border-light identity-svg-wrapper" v-html="props.row.identicon" />
              </div>
              <router-link
                :to="{ name: 'validator-lookup', params: { address: props.row.address } }"
                class="entity-link"
              >
                <div class="col q-ml-sm">{{ props.row.identity.name }}</div>
              </router-link>
            </div>
          </q-td>

          <q-td key="commission" :props="props">
            <div>{{ props.row.preferences.commission }}</div>
          </q-td>

          <q-td key="payee" :props="props">
            <div v-if="props.row.payee.Account">Account<q-tooltip>{{ props.row.payee.Account }}</q-tooltip></div>
            <div v-else>{{ props.row.payee }}</div>
          </q-td>

          <q-td key="last_paid_out" :props="props">
            {{ props.row.lastPaidOut }}
          </q-td>

          <q-td key="other_staked" :props="props">
            {{ props.row.otherStaked || ''}}<span v-if="props.row.otherStaked" class="text-weight-thin token">&nbsp;{{ tokenName }}</span>
          </q-td>

          <q-td key="nominator_count" :props="props">
            {{ props.row.nominatorCount }}
          </q-td>

          <q-td key="own_staked" :props="props">
            {{ props.row.ownStaked || '' }}<span v-if="props.row.ownStaked" class="text-weight-thin token">&nbsp;{{ tokenName }}</span>
          </q-td>

          <q-td key="total_staked" :props="props">
            {{ props.row.totalStaked || ''}}<span v-if="props.row.totalStaked" class="text-weight-thin token">&nbsp;{{ tokenName }}</span>
          </q-td>

          <q-td key="staked_return" :props="props">
            {{ props.row.stakedReturn || '' }}<span v-if="props.row.stakedReturn">%</span>
          </q-td>

          <q-td key="reward_points" :props="props">
            {{ props.row.currentRewardPoints || ''}}
          </q-td>

          <q-td key="last_block" :props="props">
            {{ props.row.lastBlock }}
          </q-td>

        </q-tr>
      </template>
      <template v-slot:item="props">
        <q-markup-table class="q-ma-md full-width" style="min-width: 300px;">
          <tbody>

            <tr>
              <td colspan="2">
                <div class="row justify-center items-center">
                  <q-badge v-if="props.row.blockCount" :label="props.row.blockCount" class="justify-center" style="width: 26px;">
                    <q-tooltip>Blocks produced this era</q-tooltip>
                  </q-badge>

                  <!-- <div style="min-width: 18px;">
                    <q-icon :name="isInvulnerable(props.row) ? solidLockClosed : solidLockOpen" size="18px" color="blue-grey-3">
                      <q-tooltip>
                        {{ isInvulnerable(props.row) ? 'protected' : 'not protected'}}
                      </q-tooltip>
                    </q-icon>
                  </div> -->

                  <div style="min-width: 18px;">
                    <q-icon :name="props.row.identity.identityIcon" size="18px" color="blue-grey-3">
                      <q-tooltip>
                        {{ props.row.identity.identityTooltip }}
                      </q-tooltip>
                    </q-icon>
                  </div>

                  <div style="min-width: 18px;">
                    <q-icon v-if="props.row.nextElected" :name="mdiChevronRightCircle" size="18px" color="green-6">
                      <q-tooltip>
                        Validator is elected to the next set
                      </q-tooltip>
                    </q-icon>
                  </div>

                </div>
              </td>
            </tr>

            <tr>
              <td class="text-weight-bold">Name/Address</td>
              <td>
                <div class="row justify-start items-center no-wrap">
                  <div class="col-shrink">
                    <div class="border-light identity-svg-wrapper" v-html="props.row.identicon" />
                  </div>
                  <router-link
                    :to="{ name: 'validator-lookup', params: { address: props.row.address } }"
                    class="entity-link"
                  >
                    <div class="col q-ml-sm">{{ props.row.identity.name }}</div>
                  </router-link>
                </div>
              </td>
            </tr>

            <tr>
              <td class="text-weight-bold">Commission</td>
              <td>{{ props.row.preferences.commission }}</td>
            </tr>

            <tr>
              <td class="text-weight-bold">Payee</td>
              <td>
                <div v-if="props.row.payee.Account">Account<q-tooltip>{{ props.row.payee.Account }}</q-tooltip></div>
                <div v-else>{{ props.row.payee }}</div>
              </td>
            </tr>

            <tr>
              <td class="text-weight-bold">Payout</td>
              <td>
                {{ props.row.lastPaidOut }}
              </td>
            </tr>

            <tr>
              <td class="text-weight-bold">Other Bonded</td>
              <td>{{ props.row.otherStaked || ''}}<span v-if="props.row.otherStaked" class="text-weight-thin token">&nbsp;{{ tokenName }}</span></td>
            </tr>

            <tr>
              <td class="text-weight-bold">Nominators</td>
              <td>{{ props.row.nominatorCount || ''}}</td>
            </tr>

            <tr>
              <td class="text-weight-bold">Own Bonded</td>
              <td>{{ props.row.ownStaked || '' }}<span v-if="props.row.ownStaked" class="text-weight-thin token">&nbsp;{{ tokenName }}</span></td>
            </tr>

            <tr>
              <td class="text-weight-bold">Total Bonded</td>
              <td>{{ props.row.totalStaked }}<span class="text-weight-thin token">&nbsp;{{ tokenName }}</span></td>
            </tr>

            <tr>
              <td class="text-weight-bold">Bonded Return</td>
              <td>{{ props.row.stakedReturn || '' }}<span v-if="props.row.totalStaked">%</span></td>
            </tr>

            <tr>
              <td class="text-weight-bold">Reward Points</td>
              <td>{{ props.row.currentRewardPoints || ' '}}</td>
            </tr>

            <tr>
              <td class="text-weight-bold">Last Block #</td>
              <td>{{ props.row.lastBlock }}</td>
            </tr>
          </tbody>

        </q-markup-table>
      </template>
    </q-table>
  </div>
</template>

<script>
import { computed, watch, reactive, ref } from 'vue'
import { useChainsStore } from 'stores/chain'
import { useEntitiesStore } from 'stores/entities'
import { useClientStore } from 'stores/client'
import { usePreferencesStore } from 'stores/preferences'
import { infoIcon, mdiChevronRightCircle, fasLocationCrosshairs } from 'assets/icons'
import { solidCheckCircle } from 'src/assets/icons'

import FilterInfo from 'components/FilterInfo.vue'

const solidLockClosed = 'M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z@@fill:currentColor;fill-rule:evenodd;clip-rule:evenodd;|0 0 20 20'
const solidLockOpen = 'M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z@@fill:currentColor;|0 0 20 20'

// Icons for later
// const scalesDuotone = 'M56,88l32,80c0,17.7-20,24-32,24s-32-6.3-32-24ZM200,56l-32,80c0,17.7,20,24,32,24s32-6.3,32-24Z@@opacity:0.2;&&M239.4,133l-32-80h0l-.5-.9h0l-.6-.8c-.1-.1-.1-.1-.1-.2l-.8-.8a.1.1,0,0,1-.1-.1,1.8,1.8,0,0,0-.7-.5l-.2-.2-.9-.5h-.2l-.8-.3h-.2l-1-.2h-3L136,62V40a8,8,0,0,0-16,0V65.6L54.3,80.2h-.7l-1,.4h-.2l-.8.4a.1.1,0,0,1-.1.1l-.9.7a.1.1,0,0,1-.1.1l-.6.7h-.1a2.4,2.4,0,0,0-.6.9l-.2.2-.4.9h-.1L16.6,165a8,8,0,0,0-.6,3c0,23.3,24.5,32,40,32s40-8.7,40-32a8,8,0,0,0-.6-3L66.9,93.8,120,82V208H104a8,8,0,0,0,0,16h48a8,8,0,0,0,0-16H136V78.4l50.9-11.3L160.6,133a8,8,0,0,0-.6,3c0,23.3,24.5,32,40,32s40-8.7,40-32A8,8,0,0,0,239.4,133ZM56,184c-7.5,0-22.8-3.6-23.9-14.6L56,109.5l23.9,59.9C78.8,180.4,63.5,184,56,184Zm144-32c-7.5,0-22.8-3.6-23.9-14.6L200,77.5l23.9,59.9C222.8,148.4,207.5,152,200,152Z|0 0 256 256'
// const howToVoteTwoTone = 'M0 0h24v24H0V0z@@fill:none;&&M5 19h14v1H5z@@opacity:.3;&&M18 13h-.68l-2 2h1.91L19 17H5l1.78-2h2.05l-2-2H6l-3 3v4c0 1.1.89 2 1.99 2H19c1.1 0 2-.89 2-2v-4l-3-3zm1 7H5v-1h14v1z&&M12.048 12.905L8.505 9.362l4.95-4.95 3.543 3.543z@@opacity:.3;&&M19.11 7.25L14.16 2.3c-.38-.4-1.01-.4-1.4-.01L6.39 8.66c-.39.39-.39 1.02 0 1.41l4.95 4.95c.39.39 1.02.39 1.41 0l6.36-6.36c.39-.39.39-1.02 0-1.41zm-7.06 5.65L8.51 9.36l4.95-4.95L17 7.95l-4.95 4.95z'
// const alarmClockOutline = 'M31.47,3.84a5.78,5.78,0,0,0-7.37-.63,16.08,16.08,0,0,1,8.2,7.65A5.73,5.73,0,0,0,31.47,3.84ZM11.42,3.43a5.77,5.77,0,0,0-7.64.41,5.72,5.72,0,0,0-.38,7.64A16.08,16.08,0,0,1,11.42,3.43ZM16.4,4.09A14,14,0,0,0,8.11,27.88L5.56,30.43A1,1,0,1,0,7,31.84l2.66-2.66a13.9,13.9,0,0,0,16.88-.08l2.74,2.74a1,1,0,0,0,1.41-1.41L28,27.78A14,14,0,0,0,16.4,4.09ZM19.58,29.9A12,12,0,1,1,29.92,19.56,12,12,0,0,1,19.58,29.9ZM24.92,20.34l-6.06-3V9.5a.9.9,0,0,0-1.8,0v9L24.12,22a.9.9,0,1,0,.79-1.62Z|0 0 36 36'
// const notificationImportantTwoTone = 'M12 6c-2.76 0-5 2.24-5 5v7h10v-7c0-2.76-2.24-5-5-5zm1 10h-2v-2h2v2zm0-4h-2V8h2v4z@@opacity:.3;&&M12 23c1.1 0 1.99-.89 1.99-1.99h-3.98c0 1.1.89 1.99 1.99 1.99zm7-6v-6c0-3.35-2.36-6.15-5.5-6.83V3c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v1.17C7.36 4.85 5 7.65 5 11v6l-2 2v1h18v-1l-2-2zm-2 1H7v-7c0-2.76 2.24-5 5-5s5 2.24 5 5v7zM11 8h2v4h-2zm0 6h2v2h-2z'
// const personAddDisabledTwoTone = 'M0 0h24v24H0V0z@@fill:none;&&M9 18h5.87L13 16.13l-1.1.3C9.89 16.99 9.08 17.76 9 18zm8-10c0-1.1-.9-2-2-2-.99 0-1.81.72-1.97 1.67l2.31 2.31C16.27 9.82 17 8.99 17 8z@@opacity:.3;&&M14.48 11.95c.17.02.34.05.52.05 2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4c0 .18.03.35.05.52l3.43 3.43zM15 6c1.1 0 2 .9 2 2 0 .99-.73 1.82-1.67 1.97l-2.31-2.31C13.19 6.72 14.01 6 15 6zm1.69 8.16L22.53 20H23v-2c0-2.14-3.56-3.5-6.31-3.84zM0 3.12l4 4V10H1v2h3v3h2v-3h2.88l2.51 2.51C9.19 15.11 7 16.3 7 18v2h9.88l4 4 1.41-1.41L1.41 1.71 0 3.12zm13.01 13.01L14.88 18H9c.08-.24.88-1.01 2.91-1.57l1.1-.3zM6 9.12l.88.88H6v-.88z'
// const identityTwoTone = 'M27.6488 48.6345C27.6093 48.6491 27.5698 48.6638 27.5304 48.6786L26.3003 49.1397C20.1048 51.4617 16 57.3838 16 64.0002C16 66.2093 17.7909 68.0002 20 68.0002H60C62.2091 68.0002 64 66.2093 64 64.0002C64 57.3838 59.8952 51.4617 53.6997 49.1397L52.4696 48.6786C52.4302 48.6638 52.3907 48.6491 52.3512 48.6345L45.908 54.09C42.4983 56.9769 37.5017 56.9769 34.092 54.09L27.6488 48.6345Z@@fill:currentColor;fill-opacity:0.25;&&M27.0335 18.8434C33.4205 10.0086 46.5795 10.0086 52.9665 18.8434L59.581 27.993C63.2551 33.0751 62.3964 40.1292 57.6104 44.1816L45.908 54.09C42.4983 56.9769 37.5017 56.9769 34.092 54.09L22.3896 44.1816C17.6036 40.1293 16.7449 33.0751 20.419 27.9929L27.0335 18.8434Z@@fill:currentColor;fill-opacity:0.25;&&M45.908 54.09L52.3512 48.6345C52.3907 48.6491 52.4302 48.6638 52.4696 48.6786L53.6997 49.1397C59.8952 51.4617 64 57.3838 64 64.0002C64 66.2093 62.2091 68.0002 60 68.0002H20C17.7909 68.0002 16 66.2093 16 64.0002C16 57.3838 20.1048 51.4617 26.3003 49.1397L27.5304 48.6786C27.5698 48.6638 27.6093 48.6491 27.6488 48.6345L34.092 54.09M45.908 54.09C42.4983 56.9769 37.5017 56.9769 34.092 54.09M45.908 54.09L57.6104 44.1816C62.3964 40.1292 63.2551 33.0751 59.581 27.993M34.092 54.09L22.3896 44.1816C17.6036 40.1293 16.7449 33.0751 20.419 27.9929M40 56.2551V68.0004M20.419 27.9929L27.0335 18.8434C33.4205 10.0086 46.5795 10.0086 52.9665 18.8434L59.581 27.993M20.419 27.9929C18.6407 30.4528 17.9243 33.3747 18.2012 36.1945C24.0233 31.0925 31.6505 28 40.0001 28C48.3496 28 55.9769 31.0925 61.799 36.1945C62.0758 33.3747 61.3593 30.4528 59.581 27.993M26.4546 30.8893C30.5891 29.032 35.174 27.9987 40.0002 27.9987C44.8264 27.9987 49.4112 29.0319 53.5456 30.8892C53.4967 31.5085 53.4069 32.1275 53.2753 32.7424L53.0516 33.7877C52.2136 37.7041 49.6612 41.0372 46.0986 42.8672C42.2707 44.8335 37.7295 44.8335 33.9015 42.8672C30.339 41.0372 27.7865 37.7041 26.9485 33.7877L26.7248 32.7424C26.5933 32.1276 26.5035 31.5086 26.4546 30.8893Z@@fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;|0 0 80 80'
// const selfImprovementTwoTone = 'M0 0 H24 V24 H0 V0z@@fill:none;&&M12 6 m-2 0 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0&&M21,16v-2c-2.24,0-4.16-0.96-5.6-2.68l-1.34-1.6C13.68,9.26,13.12,9,12.53,9h-1.05c-0.59,0-1.15,0.26-1.53,0.72l-1.34,1.6 C7.16,13.04,5.24,14,3,14v2c2.77,0,5.19-1.17,7-3.25V15l-3.88,1.55C5.45,16.82,5,17.48,5,18.21C5,19.2,5.8,20,6.79,20H9v-0.5 c0-1.38,1.12-2.5,2.5-2.5h3c0.28,0,0.5,0.22,0.5,0.5S14.78,18,14.5,18h-3c-0.83,0-1.5,0.67-1.5,1.5V20h7.21 C18.2,20,19,19.2,19,18.21c0-0.73-0.45-1.39-1.12-1.66L14,15v-2.25C15.81,14.83,18.23,16,21,16z'
// const cash100 = 'M2,5H22V20H2V5M20,18V7H4V18H20M17,8A2,2 0 0,0 19,10V15A2,2 0 0,0 17,17H7A2,2 0 0,0 5,15V10A2,2 0 0,0 7,8H17M17,13V12C17,10.9 16.33,10 15.5,10C14.67,10 14,10.9 14,12V13C14,14.1 14.67,15 15.5,15C16.33,15 17,14.1 17,13M15.5,11A0.5,0.5 0 0,1 16,11.5V13.5A0.5,0.5 0 0,1 15.5,14A0.5,0.5 0 0,1 15,13.5V11.5A0.5,0.5 0 0,1 15.5,11M13,13V12C13,10.9 12.33,10 11.5,10C10.67,10 10,10.9 10,12V13C10,14.1 10.67,15 11.5,15C12.33,15 13,14.1 13,13M11.5,11A0.5,0.5 0 0,1 12,11.5V13.5A0.5,0.5 0 0,1 11.5,14A0.5,0.5 0 0,1 11,13.5V11.5A0.5,0.5 0 0,1 11.5,11M8,15H9V10H8L7,10.5V11.5L8,11V15Z'

export default {
  name: 'Validators',

  components: {
    FilterInfo
  },

  setup () {
    const chainStore = useChainsStore()
    const entitiesStore = useEntitiesStore()
    const clientStore = useClientStore()
    const preferencesStore = usePreferencesStore()
    const columns = [
      {
        label: 'Blocks',
        name: 'block_count',
        required: true,
        align: 'center',
        sortable: true,
        style: 'max-width: 33px; padding-left: 0; padding-right: 0;'
      },
      {
        label: 'Flags',
        name: 'flags',
        required: true,
        align: 'right',
        sortable: false,
        style: 'width: 50px; padding-left: 0; padding-right: 0;'
      },
      {
        label: 'Name/Address',
        name: 'name',
        required: true,
        align: 'left',
        sortable: true
      },
      {
        label: 'Commission',
        name: 'commission',
        required: true,
        align: 'right',
        sortable: true
      },
      {
        label: 'Payee',
        name: 'payee',
        required: true,
        align: 'left',
        sortable: true
      },
      {
        label: 'Payout',
        name: 'last_paid_out',
        required: false,
        align: 'right',
        sortable: false
        // style: 'width: 160px'
      },
      {
        label: 'Other Bonded',
        name: 'other_staked',
        required: false,
        align: 'right',
        sortable: true
        // style: 'width: 160px'
      },
      {
        label: 'Nominators',
        name: 'nominator_count',
        required: true,
        align: 'right',
        sortable: true,
        style: 'width: 40px'
      },
      {
        label: 'Own Bonded',
        name: 'own_staked',
        required: false,
        align: 'right',
        sortable: true
      },
      {
        label: 'Total Bonded',
        name: 'total_staked',
        required: false,
        align: 'right',
        sortable: true
      },
      {
        label: 'Bonded Return',
        name: 'staked_return',
        required: false,
        align: 'right',
        sortable: true
      },
      {
        label: 'Reward Points',
        name: 'reward_points',
        required: false,
        align: 'right',
        sortable: true
      },
      {
        label: 'Last Block #',
        name: 'last_block',
        required: false,
        align: 'right',
        sortable: false
      }
    ]
    const pagination = reactive({
      rowsPerPage: 15
    })
    const displayFilterInfoModal = ref(false)

    const chainName = computed(() => chainStore.chainName)

    const tokenName = computed(() => {
      if (clientStore && clientStore.tokens && clientStore.tokens.length > 0) {
        return clientStore.tokens[ 0 ]
      }
      return ''
    })

    const validators = computed(() => {
      const v = entitiesStore.getValidators
      // console.log('validators:', v)
      return v
    })

    const filteredValidators = computed(() => {
      return validators.value.filter((val) => {
        let retVal = true
        if (retVal && preferencesStore.filters.inactive && val.elected === false) retVal = false
        if (retVal && preferencesStore.filters.nextSet && val.nextElected === false) retVal = false
        if (retVal && preferencesStore.filters.highCommission && parseFloat(val.preferences.commission) > 10.00) retVal = false
        if (retVal && preferencesStore.filters.oversubscribed && isOversubscribed(val)) retVal = false
        if (retVal && preferencesStore.filters.blockedNominations && val.preferences.blocked === true) retVal = false
        if (retVal && preferencesStore.filters.missingIdentity && !val.identity.hasIdentity) retVal = false
        if (retVal && preferencesStore.filters.noVerifiedIdentity && !val.identity.hasVerifiedIdentity) retVal = false
        if (retVal && preferencesStore.filters.notStaked && val.payee !== 'Staked') retVal = false
        if (retVal && preferencesStore.filters.selfController && val.selfController === val.address) retVal = false
        if (retVal && preferencesStore.filters.belowAvgPoints && val.belowAvgPoints) retVal = false
        if (retVal && preferencesStore.filters.slashed && val.slashed) retVal = false
        if (retVal && preferencesStore.filters.noGovernance && val.noGovernance) retVal = false
        return retVal
      })
    })

    const hasFilter = computed(() => {
      return Object.keys(preferencesStore.filters).some((key) => preferencesStore.filters[ key ])
    })

    const tableLoading = computed(() => {
      if (clientStore.isLoading) {
        return true
      }
      return entitiesStore.isLoading
    })

    watch(chainName, (val) => {
      console.log('indexPage: chainName changed', val)
    })

    watch(preferencesStore.filters, () => {
      preferencesStore.saveFilters()
    })

    watch(displayFilterInfoModal, (val) => {
      // console.log('displayFilterInfoModal:', displayFilterInfoModal.value)
    })

    function customSort (rows, sortBy, descending) {
      const data = [...rows]

      if (sortBy) {
        data.sort((a, b) => {
          const x = descending ? b : a
          const y = descending ? a : b

          if (sortBy === 'name') {
            // string sort
            return x[ sortBy ].toLowerCase() > y[ sortBy ].toLowerCase()
              ? 1
              : x[ sortBy ].toLowerCase() < y[ sortBy ].toLowerCase()
                ? -1 : 0
          }
          else if (sortBy === 'payee') {
            let x1 = x[ sortBy ], y1 = y[ sortBy ]
            if (x1.Account) {
              x1 = 'Account'
            }
            if (y1.Account) {
              y1 = 'Account'
            }
            // string sort
            return x1.toLowerCase() > y1.toLowerCase()
              ? 1
              : x1.toLowerCase() < y1.toLowerCase()
                ? -1 : 0
          }
          else {
            // numeric sorts
            let x1 = 0, y1 = 0
            if (sortBy === 'block_count') {
              x1 = parseFloat(x.blockCount)
              y1 = parseFloat(y.blockCount)
            }
            else if (sortBy === 'commission') {
              x1 = parseFloat(x.preferences.commission)
              y1 = parseFloat(y.preferences.commission)
            }
            else if (sortBy === 'other_staked') {
              x1 = x.otherStaked === 'unknown' ? 0 : x.otherStaked
              y1 = y.otherStaked === 'unknown' ? 0 : y.otherStaked
            }
            else if (sortBy === 'nominator_count') {
              x1 = x.nominatorCount
              y1 = y.nominatorCount
            }
            else if (sortBy === 'own_staked') {
              x1 = x.ownStaked
              y1 = y.ownStaked
            }
            else if (sortBy === 'total_staked') {
              x1 = x.totalStaked === 'unknown' ? 0 : x.totalStaked
              y1 = y.totalStaked === 'unknown' ? 0 : y.totalStaked
            }
            else if (sortBy === 'staked_return') {
              x1 = x.stakedReturn || 0
              y1 = y.stakedReturn || 0
            }
            else if (sortBy === 'reward_points') {
              x1 = x.currentRewardPoints || 0
              y1 = y.currentRewardPoints || 0
            }

            return parseFloat(x1) - parseFloat(y1)
          }
        })
      }

      return data
    }

    function isOversubscribed (validator) {
      return validator.nominatorCount.value > clientStore.consts.maxNominatorRewardedPerValidator
    }

    function isInvulnerable (validator) {
      return clientStore.invulnerables.find(id => id === validator.address)
    }

    function getProtectedIcon (validator) {
      const found = clientStore.invulnerables.find(id => id === validator.address)
      if (found) {
        return solidLockClosed
      }
      return solidLockOpen
    }

    return {
      validators,
      columns,
      preferencesStore,
      pagination,
      tableLoading,
      tokenName,
      solidLockClosed,
      solidLockOpen,
      solidCheckCircle,
      mdiChevronRightCircle,
      fasLocationCrosshairs,
      // scalesDuotone,
      // howToVoteTwoTone,
      // alarmClockOutline,
      // notificationImportantTwoTone,
      // personAddDisabledTwoTone,
      // identityTwoTone,
      // cash100,
      // selfImprovementTwoTone,
      infoIcon,
      displayFilterInfoModal,
      customSort,
      isInvulnerable,
      getProtectedIcon,
      filteredValidators,
      hasFilter
    }
  }
}
</script>

<style lang="scss">
  .q-table th, .q-table td {
    padding: 7px 8px;
    background-color: inherit;
  }
  .q-table--dense .q-table__top {
    padding: 6px 0px;
  }

  .token {
    font-size: 11px;
  }
</style>
