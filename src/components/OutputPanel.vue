<script setup lang="ts">
import { popsEmployedAtJobs } from '@/utils/store'
import { computed, onMounted, ref, type Ref } from 'vue'
import * as d3 from 'd3'

let data
const resources: Ref<string[]> = ref<string[]>([])

const getResourceIconURL = (resource: string): string =>
  new URL(`../assets/icons/resource/${resource}.png`, import.meta.url).href

const output = computed(() => {
  const output: Record<string, number> = {}
  const upkeep: Record<string, number> = {}
  const total: Record<string, number> = {}
  for (const job in popsEmployedAtJobs) {
    const resources = data.filter((d) => d.job === job)[0]
    Object.entries(resources)
      .filter((d) => d[0] !== 'job' && d[1])
      .map((x) => {
        const resourcesFromJob = Number(x[1]) * popsEmployedAtJobs[job]
        if (Number(x[1]) > 0) {
          output[x[0]] = output[x[0]] ? output[x[0]] + resourcesFromJob : resourcesFromJob
        }
        if (Number(x[1]) < 0) {
          upkeep[x[0]] = upkeep[x[0]] ? upkeep[x[0]] + resourcesFromJob : resourcesFromJob
        }

        if (typeof total[x[0]] !== 'number') {
          total[x[0]] = 0
        }
        total[x[0]] += resourcesFromJob
      })
  }

  // console.log([
  //   Object.entries(data[0])
  //     .filter((x) => x[0] !== 'job')
  //     .map((x) => x[0])
  //     .reduce((acc, curr) => ((acc[curr] = ''), acc), {}),
  //   output,
  //   upkeep,
  //   total
  // ])

  return [
    Object.entries(output).filter((d) => !!d[1]),
    Object.entries(upkeep).filter((d) => !!d[1]),
    Object.entries(total).filter((d) => !!d[1])
  ]
})

onMounted(() => {
  d3.csv(new URL(`../assets/data.csv`, import.meta.url).href).then((r) => {
    data = r
    Object.entries(data[0])
      .filter((d) => d[0] !== 'job')
      .map((x) => resources.value.push(x[0]))
  })
})
</script>

<template>
  <div class="flex justify-center">
    <div class="flex gap-4 justify-center p-2 rounded text-stone-400">
      <div
        v-for="resource in resources"
        v-bind:key="resource"
        class="flex flex-col gap-1 justify-center"
      >
        <img :src="getResourceIconURL(resource)" class="w-6 h-6" />
        <span v-for="index in [0, 1, 2]" v-bind:key="index" class="text-center">
          {{
            output[index].filter((x) => x[0] === resource).length
              ? output[index].filter((x) => x[0] === resource)[0][1]
              : 0
          }}
        </span>
      </div>
    </div>
  </div>
</template>
