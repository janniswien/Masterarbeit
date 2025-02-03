<template>
  <div v-for="section in sections" class="w-full flex flex-col gap-4 items-start px-4 py-5 border-2 border-gray-400 rounded">
    <h1 class="font-bold text-2xl">{{ section.title }}</h1>
    <p class="text-sm text-gray-900">{{ section.description }}</p>
    <ActionButton>
      <NuxtLink :to="section.link">Open</NuxtLink>
    </ActionButton>
  </div>
</template>
<script setup lang="ts">
const sections = [
  {
    title: "Individual Offline Verification",
    description: "Upload prepared traces and verify them by running the monitor.",
    link: "/verification/offline"
  },
  {
    title: "Collective Offline Verification",
    description: "Run the monitor for all existing trace sessions.",
    link: "/verification/offline/collective"
  },
  {
    title: "Online Verification Demonstrator",
    description: "View an example of the online verification process by adding recurring extensions to the trace and eventually verify the resulting trace.",
    link: "/verification/online-demonstrator"
  },
  {
    title: "Trace Preparation",
    description: "Prepare a JSON-based trace by extracting all RV-related events and format each message.",
    link: "/trace-preparation"
  }
]
</script>