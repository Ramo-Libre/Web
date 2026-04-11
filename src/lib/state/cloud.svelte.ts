import { browser } from '$app/environment';
import type { User, Provider } from '@supabase/supabase-js';
import { RAMOLIBE_KEY_PREFIX, SAVE_EVENT } from './index.svelte';
import { supabase } from '$lib/supabase/client';

const CLOUD_KEY = `${RAMOLIBE_KEY_PREFIX}CLOUD_V1`;
type CloudSerial = {
    autoSync: boolean;
    lastSync: string | null;
	lastLocalUpdate: string | null;
};
type AuthState = {
	user: User | null;
	isSynced: boolean;
	isLoading: boolean;
};

const DEFAULT_CLOUD_STATE: CloudSerial = {
    autoSync: true,
    lastSync: null,
    lastLocalUpdate: null
};

const DEFAULT_AUTH_STATE: AuthState = {
    user: null,
    isSynced: false,
    isLoading: true
};

class CloudStore {
	private _cloud: CloudSerial = $state<CloudSerial>(DEFAULT_CLOUD_STATE);
	private _auth: AuthState = $state<AuthState>(DEFAULT_AUTH_STATE);
	private _syncTimeout: NodeJS.Timeout | null = null;

	constructor() {
		if (browser) {
			this.load();
			window.addEventListener(SAVE_EVENT, (ev) => {
				const timestamp = (ev as unknown as { detail: { timestamp: number } }).detail.timestamp;
				this._cloud.lastLocalUpdate = new Date(timestamp).toISOString();
                if (!this._cloud.autoSync) return;
                this.sync(timestamp);
			});
        }
        $effect.root(() => {
			$effect(() => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                this._cloud;
                this.save();
			});
		});
	}

	get user() {
		return this._auth.user;
	}

	get isSynced() {
		return this._auth.isSynced;
    }

    get autoSync() {
        return this._cloud.autoSync;
    }

	get isLoading() {
		return this._auth.isLoading;
	}

	get lastSync() {
		return this._cloud?.lastSync ? new Date(this._cloud.lastSync) : null;
    }

    get lastLocalUpdate() {
        return this._cloud?.lastLocalUpdate ? new Date(this._cloud.lastLocalUpdate) : null;
    }

	get isAuthenticated() {
		return !!this._auth.user;
    }

    set autoSync(value: boolean) {
        this._cloud.autoSync = value;
    }

    private save() {
        console.log('Saving cloud state');
        localStorage.setItem(CLOUD_KEY, JSON.stringify(this._cloud));
    }

    private clear() {
        this._cloud = DEFAULT_CLOUD_STATE;
        this._auth = DEFAULT_AUTH_STATE;
        this._auth.isLoading = false;
        localStorage.removeItem(CLOUD_KEY);
    }

    private async load() {
		const cloudData = localStorage.getItem(CLOUD_KEY);
		if (cloudData) {
			try {
				const parsed = JSON.parse(cloudData);
				this._cloud = parsed.cloud || { lastSync: null };
			} catch (e) {
				console.error('Failed to parse cloud data:', e);
                this.clear();
			}
		}
		const { data } = await supabase.auth.getUser();
		this._auth.user = data.user;
		this._auth.isLoading = false;

		supabase.auth.onAuthStateChange((_event, session) => {
            this._auth.user = session?.user ?? null;
			if (!this._auth.user) {
                this._auth.isSynced = false;
            }
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

    async sync(timestamp: number = Date.now()) {
        if (!this.isAuthenticated) return;
		if (this._syncTimeout) clearTimeout(this._syncTimeout);

		this._syncTimeout = setTimeout(() => {
			this.performSync(timestamp);
		}, 5000);
	}

	private async performSync(timestamp: number) {
		console.log(`Starting cloud sync at ${new Date(timestamp).toISOString()}`);
		const snapshot = this.createFullSnapshot();
		const res = await supabase.from('backups').upsert({
			user_id: this.user!.id,
			payload: snapshot,
			updated_at: new Date(timestamp).toISOString()
		});
		if (res.success) {
			this._cloud.lastSync = new Date().toISOString();
		} else {
			console.error('Cloud sync failed:', res.error);
		}
	}

	private createFullSnapshot(): object {
		return {};
	}
}

export const cloud = new CloudStore();
