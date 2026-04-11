import { browser } from '$app/environment';
import type { User, Provider } from '@supabase/supabase-js';
import { RAMOLIBE_KEY_PREFIX } from './index.svelte';
import { supabase } from '$lib/supabase/client';

const CLOUD_KEY = `${RAMOLIBE_KEY_PREFIX}CLOUD_V1`;
type CloudSerial = {
	lastSync: string | null;
};
type AuthState = {
	user: User | null;
	isSynced: boolean;
	isLoading: boolean;
};

class CloudStore {
	private _cloud: CloudSerial | null = null;
	private _auth: AuthState = $state<AuthState>({
		user: null,
		isSynced: false,
		isLoading: true
	});

	constructor() {
		if (browser) this.load();
    }

    get user() {
        return this._auth.user;
    }

    get isSynced() {
        return this._auth.isSynced;
    }

    get isLoading() {
        return this._auth.isLoading;
    }

    get lastSync() {
        return this._cloud?.lastSync ? new Date(this._cloud.lastSync) : null;
    }

    get isAuthenticated() {
        return !!this._auth.user;
    }

	private async load() {
		const cloudData = localStorage.getItem(CLOUD_KEY);
		if (cloudData) {
			try {
				const parsed = JSON.parse(cloudData);
				this._cloud = parsed.cloud || null;
			} catch (e) {
				console.error('Failed to parse cloud data:', e);
				this._cloud = null;
			}
		}
		const { data } = await supabase.auth.getUser();
		this._auth.user = data.user;
		this._auth.isLoading = false;

		supabase.auth.onAuthStateChange((_event, session) => {
			this._auth.user = session?.user ?? null;
		});
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

    async deleteCloudData() {
        supabase.rpc('delete_own_user').then(() => {
            this.logout();
        });
    }

    async sync() {
        console.log('Syncing with cloud...');
    }
}

export const cloud = new CloudStore();
