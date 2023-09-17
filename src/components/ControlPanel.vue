<script setup lang="ts">
import JobButton from './JobButton.vue'
const props = defineProps<{
  jobs: string[]
}>()
</script>

<template>
  <div>
    <h2 class="text-center mb-2">Available Jobs</h2>
    <ul class="flex justify-center">
      <JobButton v-for="job in jobs" :jobName="job" v-bind:key="job"></JobButton>
    </ul>
  </div>
</template>
