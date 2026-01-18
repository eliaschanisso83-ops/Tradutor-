import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vsiozfojoetxbuhrobkw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaW96Zm9qb2V0eGJ1aHJvYmt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjE4MTIsImV4cCI6MjA4NDMzNzgxMn0.2vGIblh306KXbDzms6es8IGjfXzEfY4OLKR_sJ6Jmbs';

export const supabase = createClient(supabaseUrl, supabaseKey);