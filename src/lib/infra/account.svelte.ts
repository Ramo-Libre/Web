import { browser } from '$app/environment';
import type { Provider, User } from '@supabase/supabase-js';
import { supabase } from '$lib/supabase/client';
import { syncRouter } from './sync-router.svelte';
import { noopAdapter } from './sync-noop.svelte';
import { pollingAdapter } from './sync-polling.svelte';
import { local } from './persistence.svelte';
import { changeBus } from './changes.svelte';
import { semestre } from './semestres.svelte';
import { KEYS } from './sync-policies';
import type { RamosSerial } from '$lib/features/ramos.svelte';
import type { ScheduleSerial } from '$lib/features/schedule.svelte';
import type { EscenariosSerial } from '$lib/features/notas.svelte';

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
		await this._syncAdapter();
		if (this._user) {
			this._migrateDefaultData();
		}

		supabase.auth.onAuthStateChange(async (_event, session) => {
			this._user = session?.user ?? null;
			await this._syncAdapter();
			if (session?.user) {
				this._migrateDefaultData();
			}
		});
	}

	private async _syncAdapter() {
		if (this._user) {
			await syncRouter.setAdapter(pollingAdapter);
		} else {
			await syncRouter.setAdapter(noopAdapter);
		}
	}

	private _migrateDefaultData() {
		const PREFIX = '$DEFAULT$';
		const rmsKey = PREFIX + '_' + KEYS.ramos;
		const schKey = PREFIX + '_' + KEYS.schedule;
		const escKey = PREFIX + '_' + KEYS.escenarios;

		const ramosData = local.get<RamosSerial>(rmsKey) ?? [];
		const scheduleData = local.get<ScheduleSerial>(schKey) ?? [];
		const escenariosData = local.get<EscenariosSerial>(escKey) ?? [];

		if (!ramosData.length && !scheduleData.length && !escenariosData.length) return;

		const newId = semestre.add('Mis Datos');

		local.save(newId + '_' + KEYS.ramos, ramosData);
		local.save(newId + '_' + KEYS.schedule, scheduleData);
		local.save(newId + '_' + KEYS.escenarios, escenariosData);

		semestre.loadCurrentSemester();

		local.remove(rmsKey);
		local.remove(schKey);
		local.remove(escKey);

		for (const [ramoId] of ramosData) {
			changeBus.emit('ramos', 'created', ramoId);
		}
		for (const [eventId] of scheduleData) {
			changeBus.emit('schedule', 'created', eventId);
		}
		for (const [escId] of escenariosData) {
			changeBus.emit('escenarios', 'created', escId);
		}

		console.log('[Sync:Migrate] migrated $DEFAULT$ data to semester', newId, {
			ramos: ramosData.length,
			schedule: scheduleData.length,
			escenarios: escenariosData.length
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
