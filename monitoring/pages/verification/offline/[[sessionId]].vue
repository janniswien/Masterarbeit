<script setup lang="ts">

import Dropzone, {type DropzoneFile} from "dropzone"
import type {MonitorResponse} from "~/services/monitoring/executeMonitor";
import {createSession} from "~/services/api/createSession";
import {destroySession} from "~/services/api/destroySession";
import {storeTrace} from "~/services/api/storeTrace";
import {receiveMonitorResult} from "~/services/api/receiveMonitorResult";
import ActionButton from "~/components/ActionButton.vue";
import {readSessionTrace} from "~/services/api/readSessionTrace";
import {listAllSessions} from "~/services/api/listAllSessions";

useHead({title: "Offline Runtime Verification"})

const inputTrace = ref<string>("")
const isDropzoneActive = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const monitorResponse = ref<MonitorResponse | null>(null)
const sessionId = ref<number | null>(null)
const destroySessionAfterVerification = ref<boolean>(false)
const existingSessions = ref<number[]>([])

existingSessions.value = await listAllSessions()

const route = useRoute()

watchEffect(async () => {
  if (route.params.sessionId) {
    isLoading.value = true
    sessionId.value = parseInt(route.params.sessionId.toString())
    inputTrace.value = await readSessionTrace(sessionId.value)
    isLoading.value = false
  }
})

/**
 * Process the inputted trace by assigning it to a session and sending it to the monitor.
 */
async function processTrace() {
  if (isLoading.value || inputTrace.value.length === 0) {
    return
  }

  isLoading.value = true
  if (!sessionId.value) {
    sessionId.value = await createSession()
    await storeTrace(sessionId.value, inputTrace.value)
  }

  monitorResponse.value = await receiveMonitorResult(sessionId.value)
  isLoading.value = false

  if (destroySessionAfterVerification.value) {
    await destroySession(sessionId.value)
  }
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

function selectSession(session: number) {
  navigateTo(`/verification/offline/${session}`)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <NuxtLink to="/" class="font-bold text-4xl hover:opacity-70">
      &#8249;
    </NuxtLink>
    <h1 class="text-3xl">Individual Offline Verification</h1>
  </div>

  <div class="py-2">
      <p class="font-bold text-lg">Select an existing session:</p>
      <select
          class="mt-3 px-5 py-2 border-2 border-gray-300 hover:bg-gray-200 focus:border-gray-200"
          v-model="sessionId"
          @update:model-value="selectSession"
      >
        <option v-for="session in existingSessions" :value="session">
          {{session}}
        </option>
      </select>
  </div>

  <textarea
      class="w-full h-64 border-2 focus:border-blue-600 focus:bg-gray-100 p-5 transition-all"
      :class="{'border-gray-600': !isDropzoneActive, 'border-2 border-green-400': isDropzoneActive}"
      id="dropzone"
      placeholder="Enter trace directly or drop text file containing a trace."
      v-model="inputTrace"
  ></textarea>

  <div class="flex gap-1">
    <input type="checkbox" v-model="destroySessionAfterVerification" id="destroySession"/>
    <label for="destroySession" class="text-sm">Destroy session after receiving monitor verdict</label>
  </div>

  <ActionButton @click="processTrace" :is-loading="isLoading">
    Verify Trace
  </ActionButton>

  <div
      v-if="monitorResponse?.verdict !== undefined"
      class="font-bold border-2 w-full text-center p-2"
      :class="{'border-green-500 text-green-500': monitorResponse.verdict, 'border-red-500 text-red-500': !monitorResponse.verdict}"
  >
    Final verdict:
    <template v-if="monitorResponse.verdict">Trace is valid!</template>
    <template v-else>Trace is invalid!</template>
  </div>

  <div v-if="monitorResponse?.output">
    <h2 class="text-xl">Complete Monitor Output:</h2>
    <pre>{{ monitorResponse.output }}</pre>
  </div>

  <div class="dropzone-previews hidden" id="hiddenPreview"></div>
</template>