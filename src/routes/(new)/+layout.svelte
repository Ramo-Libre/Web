<script lang="ts">
	import NewLayout from '$lib/layouts/NewLayout.svelte';
	import { semestre } from '$lib/infra/semestres.svelte';
	import { supabase } from '$lib/supabase/client';
	import LegacyMigrationModal from '$lib/pages/_components/legacy/LegacyMigrationModal.svelte';

	let { children } = $props();

	let migrating = $state(false);

	async function handleMigrate() {
		migrating = true;
		try {
			const { data } = await supabase.auth.getUser();
			if (data.user) {
				await supabase.from('backups').delete().eq('user_id', data.user.id);
				await supabase.auth.signOut();
			}
			semestre.afterLegacyDecision('migrate');
		} finally {
			migrating = false;
		}
	}

	async function handleDiscard() {
		migrating = true;
		try {
			const { data } = await supabase.auth.getUser();
			if (data.user) {
				await supabase.from('backups').delete().eq('user_id', data.user.id);
				await supabase.auth.signOut();
			}
			semestre.afterLegacyDecision('discard');
		} finally {
			migrating = false;
		}
	}
</script>

{#if semestre.legacyData}
	<LegacyMigrationModal
		counts={semestre.legacyData}
		onmigrate={handleMigrate}
		ondiscard={handleDiscard}
		loading={migrating}
	/>
{:else}
	<NewLayout>{@render children()}</NewLayout>
{/if}
