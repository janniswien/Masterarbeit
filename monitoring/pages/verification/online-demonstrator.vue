<script setup lang="ts">

import {createSession} from "~/services/api/createSession";
import {destroySession} from "~/services/api/destroySession";
import type {MonitorResponse} from "~/services/monitoring/executeMonitor";
import {receiveMonitorResult} from "~/services/api/receiveMonitorResult";

useHead({title: "Online Runtime Verification Demonstrator"})

const sessionId = ref<number | null>(null)
const nextEvent = ref<string>("")
const completeTrace = ref<string>("")
const monitorResponse = ref<MonitorResponse | null>(null)

const isSessionCreationLoading = ref<boolean>(false)
const isMonitorLoading = ref<boolean>(false)
const isSessionDeletionLoading = ref<boolean>(false)

async function storeSession() {
  isSessionCreationLoading.value = true
  sessionId.value = await createSession()
  isSessionCreationLoading.value = false
}

async function appendTrace() {
  if (nextEvent.value.length === 0) {
    return
  }

  const {body} = await $fetch(`/api/traces/${sessionId.value}/append`, {
    method: "POST",
    headers: {'Content-Type': 'text/plain'},
    body: nextEvent.value
  })
  nextEvent.value = ""
  completeTrace.value = body
}

async function runMonitor() {
  isMonitorLoading.value = true
  if (!sessionId.value || isSessionDeletionLoading.value) {
    isMonitorLoading.value = false
    return
  }

  monitorResponse.value = await receiveMonitorResult(sessionId.value)
  isMonitorLoading.value = false
}

async function destroy() {
  isSessionDeletionLoading.value = true
  if (!sessionId.value || isMonitorLoading.value) {
    isSessionDeletionLoading.value = false
    return
  }

  await destroySession(sessionId.value)
  sessionId.value = null
  nextEvent.value = ""
  completeTrace.value = ""
  isSessionDeletionLoading.value = false
}

onUnmounted(() => sessionId.value ? destroySession(sessionId.value) : undefined)
</script>

<template>
  <div class="flex items-center gap-2">
    <NuxtLink to="/" class="font-bold text-4xl hover:opacity-70">
      &#8249;
    </NuxtLink>
    <h1 class="text-3xl">Online Verification Demonstrator</h1>
  </div>

  <div class="w-full pl-10 py-3 border border-gray-200">
    <h3 class="text-lg font-bold">1. Create Session</h3>

    <div class="pl-5 mt-2 flex items-start flex-col gap-2">
      <pre>POST <i>/api/sessions</i> RETURNS {id: number}</pre>
      <ActionButton v-if="!sessionId" @click="storeSession" :is-loading="isSessionCreationLoading">Create Session</ActionButton>
      <p v-else>Session ID: <b>{{ sessionId}}</b></p>
    </div>
  </div>

  <div v-if="sessionId" class="w-full pl-10 py-3 border border-gray-200">
    <h3 class="text-lg font-bold">2. Accumulate Trace</h3>

    <div class="pl-5 mt-2 flex items-start flex-col gap-2">
      <pre>POST <i>/api/traces/{sessionId}/append</i> WITH {headers: {Content-Type: text/plain}, body: string} RETURNS {body: string, sessionId: number}</pre>
      <div class="flex items-stretch gap-2">
        <input
            type="text"
            class="border-2 border-gray-800 px-3 py-2 text-xs"
            placeholder="Enter single trace event"
            v-model="nextEvent"
        />
        <button class="border-2 border-gray-800 hover:bg-gray-200 transition-all text-xs p-2" @click="nextEvent = '1: sync=true'">
          Insert Sample
        </button>
        <button class="border-2 border-gray-800 hover:bg-gray-200 transition-all text-xs p-2" @click="appendTrace">
          Submit
        </button>
      </div>
      <div v-if="completeTrace.length > 0">
        <p class="font-bold">Complete Trace:</p>
        <pre>{{completeTrace}}</pre>
      </div>
    </div>
  </div>

  <div v-if="sessionId && completeTrace.length > 0" class="w-full pl-10 py-3 border border-gray-200">
    <h3 class="text-lg font-bold">3. Execute Monitor on Complete Trace</h3>

    <div class="pl-5 mt-2 flex items-start flex-col gap-2">
      <pre>GET <i>/api/monitors/{sessionId}</i> RETURNS {output: string, verdict: boolean, isDefinite: boolean}</pre>
      <ActionButton @click="runMonitor" :is-loading="isMonitorLoading">Execute Monitor</ActionButton>
      <div v-if="monitorResponse" class="w-full">
        <p class="font-bold">Monitor Response:</p>
        <pre class="w-full overflow-auto">{{ monitorResponse }}</pre>
      </div>
    </div>
  </div>

  <div v-if="sessionId && completeTrace.length > 0" class="w-full pl-10 py-3 border border-gray-200">
    <h3 class="text-lg font-bold">4. Destroy Session (Optional)</h3>

    <div class="pl-5 mt-2 flex items-start flex-col gap-2">
      <pre>DELETE <i>/api/sessions/{sessionId}</i></pre>
      <ActionButton @click="destroy" :is-loading="isSessionDeletionLoading">Destroy Session</ActionButton>
    </div>
  </div>
</template>