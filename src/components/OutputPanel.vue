<script setup lang="ts">
import { popsEmployedAtJobs, selectedJobs } from '@/utils/store'
import { computed, onMounted } from 'vue'
import * as d3 from 'd3'

let data

const output = computed(() => {
  const selectedResourceNames = new Set<string>([])

  for (const d of Object.entries(popsEmployedAtJobs)) {
    const jobName = d[0]
    const popsEmployed = d[1]

    if (popsEmployed > 0) {
      Object.entries(data.filter((d) => d.job === jobName)[0])
        .filter((a) => {
          return a[0] !== 'job' && a[1]
        })
        .map((a) => selectedResourceNames.add(a[0]))
    }
  }

  const resources: string[] = []
  const counts: number[] = []

  data &&
    data
      .filter((d) => selectedJobs.has(d.job))
      .map((d) => Object.entries(d).filter((k) => k[0] !== 'job' && k[1]))
      .map((d) => {
        d.map((e) => {
          if (resources.includes(e[0])) {
            counts[resources.indexOf(e[0])] = counts[resources.indexOf(e[0])] + Number(e[1])
          } else {
            resources.push(e[0])
            counts.push(Number(e[1]))
          }
        })
      })
  return [resources, counts]
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
