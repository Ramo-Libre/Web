import { browser } from '$app/environment';
import type { Provider, User } from '@supabase/supabase-js';
import { supabase } from '$lib/supabase/client';

class AccountManager {
	private _user = $state<User | null>(null);
	private _isLoading = $state(true);

	constructor() {
		if (browser) {
			this.init();
		}
	}

	private async init() {
		const { data } = await supabase.auth.getUser();
		this._user = data.user;
		this._isLoading = false;

		supabase.auth.onAuthStateChange((_event, session) => {
			this._user = session?.user ?? null;
		});
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
		const { error } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: window.location.origin
			}
		});
		if (error) console.error('Login error:', error.message);
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
