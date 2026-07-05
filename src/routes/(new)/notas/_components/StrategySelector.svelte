<script lang="ts">
	import { Scale, Minimize2, ShieldCheck, Equal } from '@lucide/svelte';

	interface Props {
		selected: string;
		onSelect: (strategy: string) => void;
	}

	let { selected, onSelect }: Props = $props();

	const strategies: { id: string; icon: any; label: string; description: string }[] = [
		{
			id: 'punto_medio',
			icon: Scale,
			label: 'Balance',
			description: 'Equilibrio entre esfuerzo y seguridad'
		},
		{
			id: 'minimo_esfuerzo',
			icon: Minimize2,
			label: 'Mínimo',
			description: 'Minimiza las notas requeridas'
		},
		{
			id: 'maximo_seguridad',
			icon: ShieldCheck,
			label: 'Seguro',
			description: 'Maximiza el margen de aprobación'
		},
		{
			id: 'minimo_varianza',
			icon: Equal,
			label: 'Uniforme',
			description: 'Notas lo más parecidas posible'
		}
	];
</script>

<div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
	{#each strategies as s}
		<button
			onclick={() => onSelect(s.id)}
			class="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all cursor-pointer w-full {selected ===
			s.id
				? 'bg-primary-100 text-base-100 border-primary-100'
				: 'bg-base-100 text-content/60 border-base-400 hover:border-primary-100 hover:text-content'}"
			title={s.description}
		>
			<s.icon class="w-4 h-4" />
			{s.label}
		</button>
	{/each}
</div>
