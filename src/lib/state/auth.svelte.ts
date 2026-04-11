import { supabase } from '$lib/supabase/client';
import type { User, Provider } from '@supabase/supabase-js';

export type AuthState = {
	user: User | null;
	isSynced: boolean;
	isLoading: boolean;
};

export class AuthManager {
	#state = $state<AuthState>({
		user: null,
		isSynced: false,
		isLoading: true
	});

	constructor() {
		this.#init();
	}

	async #init() {
		const { data } = await supabase.auth.getUser();
		this.#state.user = data.user;
		this.#state.isLoading = false;

		supabase.auth.onAuthStateChange((_event, session) => {
			this.#state.user = session?.user ?? null;
		});
	}

	get user() {
		return this.#state.user;
	}
	get isSynced() {
		return this.#state.isSynced;
	}
	get isLoading() {
		return this.#state.isLoading;
	}

	get isAuthenticated() {
		return !!this.#state.user;
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
		await supabase.auth.signOut();
	}

	setSynced(value: boolean) {
		this.#state.isSynced = value;
	}
}
