<script setup lang="ts">

import Dropzone, {type DropzoneFile} from "dropzone"
import type {MonitorResponse} from "~/services/monitoring/executeMonitor";
import {createSession} from "~/services/api/createSession";
import {destroySession} from "~/services/api/destroySession";
import {storeTrace} from "~/services/api/storeTrace";
import {receiveMonitorResult} from "~/services/api/receiveMonitorResult";
import ActionButton from "~/components/ActionButton.vue";

useHead({title: "Trace Filtering and Rewriting"})

const inputTrace = ref<string>("")
const isDropzoneActive = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const monitorResponse = ref<MonitorResponse | null>(null)
const traces = ref<string[][]>([])
const messageKey = ref<string>("@m")
const rvTraceIdentifier = ref<string>("[[RV-TRACE]]")

/**
 * Process the inputted trace by assigning it to a session and sending it to the monitor.
 */
async function processTrace() {
  if (isLoading.value || inputTrace.value.length === 0) {
    return
  }

  isLoading.value = true

  const formattedRvTraceEvents = inputTrace.value
      .trim()
      .split("\r\n")
      .map(line => JSON.parse(line))
      .filter(line => line[messageKey.value].startsWith(rvTraceIdentifier.value))
      .map(event => event[messageKey.value].replace(rvTraceIdentifier.value, "").trim())

  if (formattedRvTraceEvents.length === 0) {
    return
  }

  traces.value = formattedRvTraceEvents[0].includes("sync=true") ? [] : [[]]
  formattedRvTraceEvents.forEach(event => {
    if (event.includes("sync=true")) {
      traces.value.push([])
    }

    traces.value[traces.value.length - 1].push(event)
  })

  // Subtract timestamps
  traces.value.forEach((trace, index) => {
    if (trace.length === 0) {
      return
    }

    const firstTimestamp = parseInt(trace[0].split(":")[0])
    let latestTimestamp = 0
    traces.value[index] = trace.map(event => {
      const realTimestamp = parseInt(event.split(":")[0]) - firstTimestamp
      latestTimestamp = Math.max(realTimestamp, latestTimestamp + 1)
      return `${latestTimestamp}:${event.split(":")[1]}`
    })
  })

  isLoading.value = false
  inputTrace.value = ""
}

/**
 * Instantiate the dropzone when the component is mounted.
 */
onMounted(() => {
  new Dropzone("#dropzone", {
    url: '/',
    createImageThumbnails: false,
    clickable: false,
    autoProcessQueue: false,
    previewsContainer: '#hiddenPreview',
    init: function () {
      this.on('dragenter', () => isDropzoneActive.value = true)
      this.on('dragover', () => isDropzoneActive.value = true)
      this.on('dragleave', () => isDropzoneActive.value = false)

      this.on('addedfile', file => {
        isDropzoneActive.value = false
        uploadFile(file)
      })

    }
  });
})

/**
 * Read the file from the dropzone to the trace
 */
function uploadFile(file: DropzoneFile) {
  const reader = new FileReader();
  reader.addEventListener("loadend", event => inputTrace.value = event.target?.result?.toString() || "")
  reader.readAsText(file)
}

async function createSessionAndRedirect(trace: string[]) {
  const sessionId = await createSession()
  await storeTrace(sessionId, trace.join("\r\n"))
  navigateTo(`/verification/offline/${sessionId}`, {open: {target: "_blank"}})
}
</script>

<template>
  <div class="flex items-center gap-2">
    <NuxtLink to="/" class="font-bold text-4xl hover:opacity-70">
      &#8249;
    </NuxtLink>
    <h1 class="text-3xl">Trace Preparation</h1>
  </div>

  <div class="w-full flex gap-6">
    <div class="min-w-fit flex flex-col items-start">
      <label for="messageKey" class="text-sm">JSON key of the event's message:</label>
      <input
          v-model="messageKey"
          id="messageKey"
          placeholder="Key of the event's name"
          class="text-sm py-1 px-2 border border-gray-400 rounded hover:bg-gray-100 focus:bg-gray-100"
      />
    </div>
    <div class="min-w-fit flex flex-col items-start">
      <label for="rvTraceIdentifier" class="text-sm">Prefix of an RV trace event:</label>
      <input
          v-model="rvTraceIdentifier"
          id="rvTraceIdentifier"
          placeholder="Prefix of an RV trace event"
          class="text-sm py-1 px-2 border border-gray-400 rounded hover:bg-gray-100 focus:bg-gray-100"
      />
    </div>
  </div>

  <div class="w-full my-6 py-4 border-y border-gray-300">
    The inputted trace should look as follows:
    <pre>
      {"{{ messageKey }}": "Some message", ...} \r\n
      {"{{ messageKey }}": "{{ rvTraceIdentifier }} 1234: this is an RV-related event", ...} \r\n
      ...
    </pre>
  </div>

  <div
      class="w-full flex items-center justify-center h-40 border-2 focus:border-blue-600 focus:bg-gray-100 p-5 transition-all"
      :class="{'border-gray-600': !isDropzoneActive, 'border-2 border-green-400': isDropzoneActive}"
      id="dropzone"
  >
    Drop your logfile here!
  </div>

  <div v-if="inputTrace.length > 0" class="w-full">
    Preview:
    <pre class="w-full overflow-x-auto">{{ inputTrace.split("\r\n").slice(0, 4).join("\r\n") }}<br/><template v-if="inputTrace.split('\r\n').length > 4">... ({{ inputTrace.split("\r\n").length - 4 }} more events)</template></pre>
  </div>

  <ActionButton @click="processTrace" :is-loading="isLoading">
    Prepare Trace
  </ActionButton>

  <div v-if="traces.length > 0" class="flex flex-wrap gap-5">
    <div v-for="(trace, index) in traces" class="py-4 px-5 border border-gray-200 rounded-2xl">
      <h4 class="font-bold text-lg">Trace #{{ index + 1 }}</h4>
      <p class="text-sm mb-4">{{ trace.length }} events</p>
      <p v-for="(event, index) in trace" class="mb-4 text-xs">
        <template v-if="index < 10">{{event}}</template>
      </p>
      <ActionButton @click="createSessionAndRedirect(trace)">View and verify &#8599;</ActionButton>
    </div>
  </div>

  <div class="dropzone-previews hidden" id="hiddenPreview"></div>
</template>

