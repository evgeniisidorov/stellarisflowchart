<script setup lang="ts">
import * as d3 from 'd3'
import { onMounted, ref } from 'vue'
import FlowChart from './components/Flowchart.vue'
import OutputPanel from './components/OutputPanel.vue'
import ControlPanel from './components/ControlPanel.vue'

const items = ref([])

onMounted(() => {
  d3.csv(new URL(`./assets/data.csv`, import.meta.url).href).then((r) => {
    r.map((d) => items.value.push(d.job))
  })
})
</script>

<template>
  <main>
    <ControlPanel :jobs="items" />
    <FlowChart />
    <OutputPanel />
  </main>
</template>
