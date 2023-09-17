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
  <main class="font-sans text-stone-300">
    <header class="w-96 p-2">
      <h1 class="text-2xl mb-4">Stellaris Economy Flowchart</h1>
      <p class="text-base mb-4">
        This chart is to contrsuct a supply chain in Stellaris. As of now, it supports only
        biological non-hivemind empires 
      </p>
    </header>
    <ControlPanel :jobs="items" />
    <FlowChart />
    <OutputPanel />
  </main>
</template>
