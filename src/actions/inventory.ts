'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addItem(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const code = formData.get('code') as string
  const condition = formData.get('condition') as string

  // Validasi sederhana
  if (!name || !code) return;

  const { error } = await supabase
    .from('items')
    .insert({
      name,
      code,
      condition,
      status: 'Tersedia'
    })

  if (error) {
    console.error('Gagal input:', error)
    // Handle error (bisa return state ke form)
    return
  }

  revalidatePath('/dashboard') // Refresh data di halaman dashboard
  redirect('/dashboard')
}