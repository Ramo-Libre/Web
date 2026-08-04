import { browser } from '$app/environment';
import { PUBLIC_TAURI_BUILD } from '$env/static/public';
import type { Provider, User } from '@supabase/supabase-js';
import { supabase } from '$lib/supabase/client';
import { syncRouter } from './sync-router.svelte';
import { noopAdapter } from './sync-noop.svelte';
import { pollingAdapter } from './sync-polling.svelte';
import { openExternal } from '$lib/utils/openExternal';

const isTauri = PUBLIC_TAURI_BUILD === 'true' || '__TAURI__' in globalThis;

class AccountManager {
	private _user = $state<User | null>(null);
	private _isLoading = $state(true);

	constructor() {
		if (browser) {
			void this.init();
		}
	}

	private async init() {
		const { data } = await supabase.auth.getUser();
		this._user = data.user;
		this._isLoading = false;
		await this._syncAdapter();

		supabase.auth.onAuthStateChange(async (_event, session) => {
			this._user = session?.user ?? null;
			await this._syncAdapter();
		});
	}

	private async _syncAdapter() {
		if (this._user) {
			await syncRouter.setAdapter(pollingAdapter);
		} else {
			await syncRouter.setAdapter(noopAdapter);
		}
	}

	get user() {
		return this._user;
	}

	get isAuthenticated() {
		return !!this._user;
	}

	get isLoading() {
		return this._isLoading;
	}

	async loginWith(provider: Provider) {
		if (isTauri) {
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider,
				options: { redirectTo: 'ramolibre://auth-callback', skipBrowserRedirect: true }
			});
			if (error) {
				console.error('Login error:', error.message);
				return;
			}
			if (data?.url) await openExternal(data.url);
		} else {
			const { error } = await supabase.auth.signInWithOAuth({
				provider,
				options: { redirectTo: window.location.origin }
			});
			if (error) console.error('Login error:', error.message);
		}
	}

	async logout() {
		await supabase.auth.signOut().catch((error) => {
			console.error('Logout error:', error.message);
		});
	}

	async deleteCloudData() {
		await supabase.rpc('delete_own_user');
		await this.logout();
	}
}

export const account = new AccountManager();
