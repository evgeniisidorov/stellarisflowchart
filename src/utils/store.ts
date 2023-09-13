import { reactive } from 'vue'

export const selectedJobs: Set<string> = reactive(new Set<string>([]))
export const popsEmployedAtJobs = reactive<Record<string, number>>({})