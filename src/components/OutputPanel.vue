<script setup lang="ts">
import { popsEmployedAtJobs } from '@/utils/store'
import { computed, onMounted } from 'vue'
import * as d3 from 'd3'

let data

const output = computed(() => {
  const outputUpkeeps: Record<string, number> = []
  for (const job in popsEmployedAtJobs) {
    const resources = data.filter((d) => d.job === job)[0]
    Object.entries(resources)
      .filter((d) => d[0] !== 'job' && d[1])
      .map((x) => {
        const resourcesFromJob = Number(x[1]) * popsEmployedAtJobs[job]
        outputUpkeeps[x[0]] = 0
        outputUpkeeps[x[0]] = outputUpkeeps[x[0]]
          ? resourcesFromJob
          : outputUpkeeps[x[0]] + resourcesFromJob
      })
  }

  console.log(outputUpkeeps)

  return Object.entries(outputUpkeeps).filter(d => d[1])
})

onMounted(() => {
  d3.csv(new URL(`../assets/data.csv`, import.meta.url).href).then((r) => {
    data = r
  })
})
</script>

<template>
  <div>
    {{ output }}
  </div>
</template>
