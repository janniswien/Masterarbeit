<script setup lang="ts">

import {listAllSessions} from "~/services/api/listAllSessions";
import type {MonitorResponse} from "~/services/monitoring/executeMonitor";
import {receiveMonitorResult} from "~/services/api/receiveMonitorResult";

useHead({title: "Collective Offline Verification"})

const existingSessions = ref<{ id: number, isLoading: boolean, monitorResponse: MonitorResponse | null }[]>([])
const isRunAllLoading = ref<boolean>(false)

existingSessions.value = (await listAllSessions()).map(id => ({id, isLoading: false, monitorResponse: null}))

async function triggerVerification(affectedIndex: number) {
  const session = existingSessions.value[affectedIndex]
  existingSessions.value[affectedIndex] = {...session, isLoading: true}
  const monitorResponse = await receiveMonitorResult(session.id)
  existingSessions.value[affectedIndex] = {...session, isLoading: false, monitorResponse}
}

async function runAll() {
  isRunAllLoading.value = true
  await Promise.all(existingSessions.value.map((session, sessionIndex) => triggerVerification(sessionIndex)))
  isRunAllLoading.value = false
}
</script>

<template>
  <div class="flex items-center gap-2">
    <NuxtLink to="/" class="font-bold text-4xl hover:opacity-70">
      &#8249;
    </NuxtLink>
    <h1 class="text-3xl">Collective Offline Verification</h1>
  </div>

  <ActionButton @click="runAll" :is-loading="isRunAllLoading">Run All</ActionButton>

  <div class="flex flex-wrap items-center gap-5 mt-5">
    <div
        v-for="(session, sessionIndex) in existingSessions"
        class="flex flex-col gap-4 items-start px-6 py-3 border-2 border-gray-400 rounded"
    >

      <p class="font-bold text-md">{{ session.id }}</p>

      <ActionButton v-if="!session.monitorResponse || session.isLoading" :is-loading="session.isLoading" @click="triggerVerification(sessionIndex)">
        Run Monitor
      </ActionButton>

      <div
          v-else
          class="font-bold border-2 w-full text-center p-2"
          :class="{'border-green-500 text-green-500': session.monitorResponse.verdict, 'border-red-500 text-red-500': !session.monitorResponse.verdict}"
      >
        <template v-if="session.monitorResponse.verdict">Trace is valid!</template>
        <template v-else>Trace is invalid!</template>
      </div>

    </div>
  </div>
</template>