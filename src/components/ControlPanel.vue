<script setup lang="ts">
import JobButton from './JobButton.vue'
const props = defineProps<{
  jobs: string[]
}>()
</script>

<template>
  <div>
    <ul class="flex">
      <JobButton v-for="job in jobs" :jobName="job" v-bind:key="job"></JobButton>
    </ul>
  </div>
</template>
