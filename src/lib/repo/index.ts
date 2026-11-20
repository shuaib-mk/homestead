import { localRepo } from './localRepo'
import { createSupabaseRepo } from './supabaseRepo'
import type { Repo } from './types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Supabase when both env vars are set, otherwise 100% localStorage demo mode. */
export const repo: Repo = url && key ? createSupabaseRepo(url, key) : localRepo
export { RepoError } from './types'
export type { Repo } from './types'
