import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vyzbwwvdktqnzcgoinej.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5emJ3d3Zka3RxbnpjZ29pbmVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NjczOTMsImV4cCI6MjA2NjU0MzM5M30.8EpMudaXNd-f24I-rotsFrJMz8Bg-nyVUTFqHlClVY8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);