<script setup lang="ts">
import { selectedJobs, popsEmployedAtJobs } from '@/utils/store'
import { ref } from 'vue'

const props = defineProps<{
  jobName: string
}>()
const isToggled = ref(false)
const url = new URL(`../assets/icons/job/job_${props.jobName}.png`, import.meta.url).href

const onClick = () => {
  isToggled.value = !isToggled.value
  if (isToggled.value) {
    selectedJobs.add(props.jobName)

    popsEmployedAtJobs[props.jobName] = 1
  } else {
    selectedJobs.delete(props.jobName)
    popsEmployedAtJobs[props.jobName] = 0
  }
}
</script>

<template>
  <div
    v-on:click="onClick"
    class="transititext-primarytext-primary transition duration-50 ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
    :title="jobName"
  >
    <input type="checkbox" class="absolute w-0 h-0 opacity-0" @checked="isToggled" :id="jobName" />
    <img :src="url" :class="`w-6 h-6 ${isToggled ? '' : 'grayscale opacity-50'}`" />
  </div>
</template>
