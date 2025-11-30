'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server' // Pastikan path import ini sesuai

export async function login(formData: FormData) {
  const supabase = await createClient()

  // Ambil data dari form
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error') // Atau handle error di UI
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}