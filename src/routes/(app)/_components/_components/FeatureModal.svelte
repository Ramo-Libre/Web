<script lang="ts">
	import {
		ArrowRight,
		ArrowLeft,
		GraduationCap,
		CalendarCheck,
		TrendingUp,
		CalendarDays,
		BookMarked,
		Bolt,
		Cloud
	} from '@lucide/svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
	}

	let { open = false, onClose }: Props = $props();

	let currentStep = $state(0);

	const features = [
		{
			title: 'Dashboard',
			description: 'Visualiza tu progreso académico y próximos eventos de un vistazo.',
			image: '/screenshots/dashboard.png',
			icon: GraduationCap,
			iconColor: 'text-primary-100'
		},
		{
			title: 'Horarios',
			description: 'Organiza tus bloques de clases y sesiones de estudio de forma eficiente.',
			image: '/screenshots/horarios.png',
			icon: CalendarCheck,
			iconColor: 'text-schedule-100'
		},
		{
			title: 'Probabilidad de Aprobación',
			description: 'Calcula tu probabilidad de aprobar cada materia según tu rendimiento.',
			image: '/screenshots/notas-general.png',
			icon: TrendingUp,
			iconColor: 'text-grades-100'
		},
		{
			title: 'Prediccion de Notas',
			description: 'Predice tus notas finales basándote en tu perfil estadistico.',
			image: '/screenshots/notas-predicciones.png',
			icon: TrendingUp,
			iconColor: 'text-grades-100'
		},
		{
			title: 'Calendario',
			description: 'Sigue tus fechas de examenes, entregas y feriados en un solo lugar.',
			image: '/screenshots/calendario.png',
			icon: CalendarDays,
			iconColor: 'text-calendar-100'
		},
		{
			title: 'Ramos',
			description:
				'Configura los Horarios, Ecuaciones de Nota y Reglas de Aprobación para cada uno de tus ramos.',
			image: '/screenshots/ramos.png',
			icon: BookMarked,
			iconColor: 'text-classes-100'
		},
		{
			title: 'Configuracion',
			description:
				'Personaliza tu experiencia, selecciona tu tema favorito y preferencias de visualización.',
			image: '/screenshots/configuracion.png',
			icon: Bolt,
			iconColor: 'text-config-100'
		},
		{
			title: 'Sincronizacion con la Nube',
			description:
				'Mantén tus datos seguros y accesibles desde cualquier dispositivo activando la sincronización en la nube.',
			image: '/screenshots/providers.png',
			icon: Cloud,
			iconColor: 'text-config-100'
		}
	];

	let active = $derived(features[currentStep]);

	function handleClose() {
		currentStep = 0;
		onClose();
	}

	const next = () => (currentStep = (currentStep + 1) % features.length);
	const prev = () => (currentStep = (currentStep - 1 + features.length) % features.length);
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<!-- Overlay oscuro con blur (idéntico al tuyo) -->
		<button
			class="absolute inset-0 bg-black/40 z-0 backdrop-blur-sm cursor-pointer transition-all"
			aria-label="Cerrar"
			onclick={handleClose}
		></button>

		<!-- Contenedor del Modal (Ajustado a max-w-2xl para que la imagen luzca mejor) -->
		<div
			class="relative z-10 w-full max-w-2xl bg-base-100 rounded-2xl shadow-xl border border-base-400 p-6 m-4"
		>
			<!-- Header: Icono y Título del Paso -->
			<div class="flex items-center justify-between mb-6">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-base-200 border border-base-300 rounded-lg">
						<active.icon class="w-6 h-6 {active.iconColor}" />
					</div>
					<div class="text-sm font-semibold text-content uppercase tracking-wide">
						{active.title}
					</div>
				</div>
				<div class="text-[10px] font-bold text-content/40 uppercase tracking-widest">
					Paso {currentStep + 1} / {features.length}
				</div>
			</div>

			<!-- Cuerpo: Imagen y Descripción -->
			<div class="space-y-6">
				<div
					class="aspect-video w-full overflow-hidden rounded-xl border border-base-400 bg-base-200"
				>
					<img
						src={active.image}
						alt={active.title}
						class="h-full w-full object-contain transition-opacity duration-300"
					/>
				</div>

				<p class="text-content/70 text-lg leading-relaxed text-center px-4">
					{active.description}
				</p>
			</div>

			<!-- Footer: Navegación y Acción -->
			<div class="mt-8 flex flex-col sm:flex-row items-center gap-4">
				<!-- Selectores de paso (Dots) -->
				<div class="flex gap-1.5 flex-1 order-2 sm:order-1">
					{#each features as _, i (i)}
						<div
							class="h-1.5 rounded-full transition-all duration-300 {currentStep === i
								? 'w-8 bg-primary-100'
								: 'w-2 bg-base-400'}"
						></div>
					{/each}
				</div>

				<!-- Botones de Acción -->
				<div class="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
					<button
						type="button"
						class="p-3 cursor-pointer rounded-lg border border-base-400 text-content/70 hover:bg-base-200 hover:text-content transition-colors active:scale-95"
						onclick={prev}
						aria-label="Anterior"
					>
						<ArrowLeft class="w-5 h-5" />
					</button>

					<button
						type="button"
						class="flex-1 sm:flex-none px-6 py-3 cursor-pointer rounded-lg bg-primary-100 text-base-100 text-sm font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
						onclick={currentStep === features.length - 1 ? handleClose : next}
					>
						{currentStep === features.length - 1 ? '¡Entendido!' : 'Siguiente'}
						<ArrowRight class="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Animación de entrada para el contenido */
	img,
	h1,
	p {
		animation: contentShift 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes contentShift {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
