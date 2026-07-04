<script lang="ts">
	import { db } from '$lib';
	import { Clock, ExternalLink } from '@lucide/svelte';
	import { goto } from '$app/navigation';

	let active = $derived(!!db.dev?.timeTravelEnabled && !!db.dev?.timeTravelDate);
	let label = $derived(
		db.dev?.timeTravelDate
			? new Date(db.dev.timeTravelDate).toLocaleString('es-CL', {
					weekday: 'short',
					day: 'numeric',
					month: 'short',
					hour: '2-digit',
					minute: '2-digit'
			  })
			: ''
	);

	function disable() {
		if (!db.dev) return;
		db.dev.timeTravelEnabled = false;
		db.dev.timeTravelDate = null;
	}
</script>

{#if active}
	<div class="bg-primary-400/20 border border-primary-100/30 rounded-lg px-3 py-2 flex items-center gap-2 text-xs">
		<div class="animate-pulse w-1.5 h-1.5 bg-primary-100 rounded-full shrink-0"></div>
		<span class="text-primary-100 font-bold">Viaje en el tiempo:</span>
		<span class="text-content/70 font-mono">{label}</span>
		<div class="flex-1"></div>
		<button
			onclick={() => goto('/dev-tools/')}
			class="flex items-center gap-1 text-primary-100 hover:underline font-medium cursor-pointer"
		>
			<ExternalLink size={12} />
			Ajustar
		</button>
		<button
			onclick={disable}
			class="text-content/40 hover:text-error-100 font-medium cursor-pointer"
		>
			Desactivar
		</button>
	</div>
{/if}
