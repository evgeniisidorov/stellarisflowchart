<script setup lang="ts">
import { onMounted, ref } from 'vue'
import FlowChart from './components/FlowChart.vue'
import JobButton from './components/JobButton.vue'
import * as d3 from 'd3'
import OutputPanel from './components/OutputPanel.vue';

const items = ref()

onMounted(() => {
  d3.csv(new URL(`./assets/data.csv`, import.meta.url).href).then((r) => {
    items.value = r.map((d) => d.job)
  })
})
</script>

<template>
  <main>
    <ul>
      <JobButton v-for="item in items" :jobName="item" v-bind:key="item"></JobButton>
    </ul>
    <FlowChart />
    <OutputPanel />
  </main>
</template>
