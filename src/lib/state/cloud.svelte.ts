import { browser } from '$app/environment';
import type { User, Provider } from '@supabase/supabase-js';
import { db, RAMOLIBE_KEY_PREFIX, SAVE_EVENT, type SaveEventData } from './index.svelte';
import { supabase } from '$lib/supabase/client';
import { untrack } from 'svelte';
import { PUBLIC_CLOUD_SYNC_DEBOUNCE } from '$env/static/public';
import { network } from './network.svelte';

const CLOUD_SYNC_DEBOUNCE = parseInt(PUBLIC_CLOUD_SYNC_DEBOUNCE) || 5000;
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
	isSyncing: boolean;
};

const DEFAULT_CLOUD_STATE: CloudSerial = {
	autoSync: true,
	lastSync: null,
	lastLocalUpdate: null
};

const DEFAULT_AUTH_STATE: AuthState = {
	user: null,
	isSynced: false,
	isLoading: true,
	isSyncing: false
};

class CloudStore {
	private _cloud: CloudSerial = $state<CloudSerial>(DEFAULT_CLOUD_STATE);
	private _auth: AuthState = $state<AuthState>(DEFAULT_AUTH_STATE);
	private _syncTimeout: NodeJS.Timeout | null = null;

	private saveListener = (ev: Event) => {
		const { timestamp, preferencesChanged } = (ev as unknown as SaveEventData).detail;
		if (preferencesChanged) return;
		this._cloud.lastLocalUpdate = new Date(timestamp).toISOString();
		if (!this._cloud.autoSync) return;
		this.sync(timestamp);
	};

	private focusListener = () => {
		console.log('Ventana enfocada');
		if (this.isAuthenticated && this.autoSync) {
			this.sync();
		}
	};

	constructor() {
		if (browser) {
			this.load().then(() => {
				window.removeEventListener(SAVE_EVENT, this.saveListener);
				window.removeEventListener('focus', this.focusListener);
				window.addEventListener(SAVE_EVENT, this.saveListener);
				window.addEventListener('focus', this.focusListener);

				$effect.root(() => {
					$effect(() => {
						// eslint-disable-next-line @typescript-eslint/no-unused-expressions
						this._cloud;
						this.save();
					});
				});
				$effect.root(() => {
					$effect(() => {
						if (network.online && this.autoSync) {
							untrack(() => this.sync());
						}
					});
				});
			});
		}
	}

	get user() {
		return this._auth.user;
	}

	get isSynced() {
		return this._auth.isSynced;
	}

	get isSyncing() {
		return this._auth.isSyncing;
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
				this._cloud = parsed || DEFAULT_CLOUD_STATE;
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
		this._auth.isSyncing = true;
		this._auth.isSynced = false;

		this._syncTimeout = setTimeout(() => {
			this.performSync(timestamp)
				.then((success) => {
					this._auth.isSynced = success;
				})
				.catch(() => {
					this._auth.isSynced = false;
				})
				.finally(() => {
					this._auth.isSyncing = false;
				});
		}, CLOUD_SYNC_DEBOUNCE);
	}

	private async push(timestamp: number) {
		console.log('Subiendo datos a la nube');
		const snapshot = db.createFullSnapshot();
		const res = await supabase.from('backups').upsert({
			user_id: this.user!.id,
			payload: snapshot,
			updated_at: new Date(timestamp).toISOString()
		});
		if (res.success) {
			this._cloud.lastSync = new Date().toISOString();
			return true;
		} else {
			console.error('Sincronizacion fallida:', res.error);
			return false;
		}
	}

	private async performSync(timestamp: number) {
		console.log(`Sincronizando con la nube: ${new Date(timestamp).toISOString()}`);
		const { data: remote } = await supabase
			.from('backups')
			.select('payload, updated_at')
			.eq('user_id', this.user!.id)
			.maybeSingle();

		if (remote) {
			console.log(
				`Datos en la nube encontrados, ultima actualizacion: ${new Date(remote.updated_at).toISOString()}`
			);
			const cloudTime = new Date(remote.updated_at).getTime();
			const lastSyncTime = this.lastSync?.getTime() ?? 0;
			const localEditTime = this.lastLocalUpdate?.getTime() ?? 0;
			let keepCloud = true;

			if (lastSyncTime === 0) {
				if (db.empty) {
					console.log('Sin datos locales, descargando desde la nube');
					untrack(() => db.hydrate(remote.payload));
					this._cloud.lastSync = remote.updated_at;
					return true;
				}

				// Conflicto inicial
				keepCloud = confirm(
					'Se han encontrado datos en la nube pero hay registros locales. ¿Deseas descargar los datos de la nube? Si cancelas, se mantendrán los datos locales (que serán subidos a la nube).'
				);
				if (keepCloud) {
					console.log('Descargando version de la nube');
					untrack(() => db.hydrate(remote.payload));
					this._cloud.lastSync = remote.updated_at;
					return true;
				}
			}

			if (cloudTime > lastSyncTime && keepCloud) {
				if (localEditTime <= cloudTime) {
					console.log('Descargando version mas reciente de la nube');
					untrack(() => db.hydrate(remote.payload));
					this._cloud.lastSync = remote.updated_at;
					return true;
				}
			}
		}
		return await this.push(timestamp);
	}
}

export const cloud = new CloudStore();
