import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'WARNING: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in .env.local. Supabase operations will be bypassed.'
  );
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Helper function to generate public URL for assets in Supabase Storage (default bucket: 'zenov-bucket')
 */
export function getPublicStorageUrl(filePath: string, bucket = 'zenov-bucket'): string {
  if (!supabaseUrl) return filePath;
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  const cleanPath = filePath.replace(/^\/+/, '');
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

/**
 * Helper function to upload an image to Supabase Storage bucket
 */
export async function uploadImageToStorage(file: File, path: string, bucket = 'zenov-bucket') {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;

  const publicUrl = getPublicStorageUrl(data.path, bucket);
  return { path: data.path, publicUrl };
}
