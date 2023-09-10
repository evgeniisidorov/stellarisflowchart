<script setup lang="ts">
import { selectedJobs } from '@/utils/store'
import { onUpdated, ref } from 'vue'

defineProps<{
  jobName: string
}>()

const isToggled = ref(false)
</script>

<template>
  <div>
    <input
      type="checkbox"
      class="default:ring-2 checked:"
      @checked="isToggled"
      @change="
        (e) => {
          isToggled = !isToggled
          if (isToggled) {
            selectedJobs.add(jobName)
          } else {
            selectedJobs.delete(jobName)
          }
        }
      "
      :id="jobName"
    /><label :for="jobName">{{ jobName }}</label>
  </div>
</template>
