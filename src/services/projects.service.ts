import { getSupabaseClient } from '@/lib/supabase'
import type { Project, CreateProjectInput, UpdateProjectInput, Task, CreateTaskInput } from '@/types/models'

export async function getProjects(): Promise<Project[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, client:clients(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Project[]
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, client:clients(*), tasks(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Project
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('projects')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as Project
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('projects')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Project
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Tasks
export async function getProjectTasks(projectId: string): Promise<Task[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at')

  if (error) throw error
  return data as Task[]
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('tasks')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as Task
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
}
