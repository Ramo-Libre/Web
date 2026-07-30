import { createClient } from '@supabase/supabase-js';
import {
	PUBLIC_SUPABASE_URL,
	PUBLIC_SUPABASE_PUBLISHABLE_KEY,
	PUBLIC_TAURI_BUILD
} from '$env/static/public';
import { createAuthStorage } from './storage';

const isTauri = PUBLIC_TAURI_BUILD === 'true' || '__TAURI__' in globalThis;

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
	auth: {
		storage: createAuthStorage(),
		...(isTauri && { flowType: 'pkce' })
	}
});
