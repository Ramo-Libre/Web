import type { ColorName, HexColor, TwClasses } from '$lib/types/colors';

export class ColorUtils {
	static readonly COLORS = [
		'#ef4444', // red-500
		'#f97316', // orange-500
		'#f59e0b', // amber-500
		'#eab308', // yellow-500
		'#84cc16', // lime-500
		'#22c55e', // green-500
		'#10b981', // emerald-500
		'#14b8a6', // teal-500
		'#06b6d4', // cyan-500
		'#0ea5e9', // sky-500
		'#3b82f6', // blue-500
		'#6366f1', // indigo-500
		'#8b5cf6', // violet-500
		'#a855f7', // purple-500
		'#d946ef', // fuchsia-500
		'#ec4899', // pink-500
		'#f43f5e', // rose-500
		'#64748b' // slate-500
	] as const;

	static getRandomColor(): HexColor {
		return this.COLORS[Math.floor(Math.random() * this.COLORS.length)];
	}

	static hexToTailwindClasses(hex: HexColor): TwClasses {
		const colorMap: Record<string, TwClasses> = {
			'#ef4444': {
				bg: 'bg-red-500/20',
				text: 'text-red-700',
				border: 'border-red-500',
				ring: 'ring-red-500',
				hover: 'hover:bg-red-500/20',
				indicator: 'bg-red-500'
			},
			'#f97316': {
				bg: 'bg-orange-500/20',
				text: 'text-orange-700',
				border: 'border-orange-500',
				ring: 'ring-orange-500',
				hover: 'hover:bg-orange-500/20',
				indicator: 'bg-orange-500'
			},
			'#f59e0b': {
				bg: 'bg-amber-500/20',
				text: 'text-amber-700',
				border: 'border-amber-500',
				ring: 'ring-amber-500',
				hover: 'hover:bg-amber-500/20',
				indicator: 'bg-amber-500'
			},
			'#eab308': {
				bg: 'bg-yellow-500/20',
				text: 'text-yellow-700',
				border: 'border-yellow-500',
				ring: 'ring-yellow-500',
				hover: 'hover:bg-yellow-500/20',
				indicator: 'bg-yellow-500'
			},
			'#84cc16': {
				bg: 'bg-lime-500/20',
				text: 'text-lime-700',
				border: 'border-lime-500',
				ring: 'ring-lime-500',
				hover: 'hover:bg-lime-500/20',
				indicator: 'bg-lime-500'
			},
			'#22c55e': {
				bg: 'bg-green-500/20',
				text: 'text-green-700',
				border: 'border-green-500',
				ring: 'ring-green-500',
				hover: 'hover:bg-green-500/20',
				indicator: 'bg-green-500'
			},
			'#10b981': {
				bg: 'bg-emerald-500/20',
				text: 'text-emerald-700',
				border: 'border-emerald-500',
				ring: 'ring-emerald-500',
				hover: 'hover:bg-emerald-500/20',
				indicator: 'bg-emerald-500'
			},
			'#14b8a6': {
				bg: 'bg-teal-500/20',
				text: 'text-teal-700',
				border: 'border-teal-500',
				ring: 'ring-teal-500',
				hover: 'hover:bg-teal-500/20',
				indicator: 'bg-teal-500'
			},
			'#06b6d4': {
				bg: 'bg-cyan-500/20',
				text: 'text-cyan-700',
				border: 'border-cyan-500',
				ring: 'ring-cyan-500',
				hover: 'hover:bg-cyan-500/20',
				indicator: 'bg-cyan-500'
			},
			'#0ea5e9': {
				bg: 'bg-sky-500/20',
				text: 'text-sky-700',
				border: 'border-sky-500',
				ring: 'ring-sky-500',
				hover: 'hover:bg-sky-500/20',
				indicator: 'bg-sky-500'
			},
			'#3b82f6': {
				bg: 'bg-blue-500/20',
				text: 'text-blue-700',
				border: 'border-blue-500',
				ring: 'ring-blue-500',
				hover: 'hover:bg-blue-500/20',
				indicator: 'bg-blue-500'
			},
			'#6366f1': {
				bg: 'bg-indigo-500/20',
				text: 'text-indigo-700',
				border: 'border-indigo-500',
				ring: 'ring-indigo-500',
				hover: 'hover:bg-indigo-500/20',
				indicator: 'bg-indigo-500'
			},
			'#8b5cf6': {
				bg: 'bg-violet-500/20',
				text: 'text-violet-700',
				border: 'border-violet-500',
				ring: 'ring-violet-500',
				hover: 'hover:bg-violet-500/20',
				indicator: 'bg-violet-500'
			},
			'#a855f7': {
				bg: 'bg-purple-500/20',
				text: 'text-purple-700',
				border: 'border-purple-500',
				ring: 'ring-purple-500',
				hover: 'hover:bg-purple-500/20',
				indicator: 'bg-purple-500'
			},
			'#d946ef': {
				bg: 'bg-fuchsia-500/20',
				text: 'text-fuchsia-700',
				border: 'border-fuchsia-500',
				ring: 'ring-fuchsia-500',
				hover: 'hover:bg-fuchsia-500/20',
				indicator: 'bg-fuchsia-500'
			},
			'#ec4899': {
				bg: 'bg-pink-500/20',
				text: 'text-pink-700',
				border: 'border-pink-500',
				ring: 'ring-pink-500',
				hover: 'hover:bg-pink-500/20',
				indicator: 'bg-pink-500'
			},
			'#f43f5e': {
				bg: 'bg-rose-500/20',
				text: 'text-rose-700',
				border: 'border-rose-500',
				ring: 'ring-rose-500',
				hover: 'hover:bg-rose-500/20',
				indicator: 'bg-rose-500'
			},
			'#64748b': {
				bg: 'bg-slate-500/20',
				text: 'text-slate-700',
				border: 'border-slate-500',
				ring: 'ring-slate-500',
				hover: 'hover:bg-slate-500/20',
				indicator: 'bg-slate-500'
			}
		};

		return (
			colorMap[hex] || {
				bg: 'bg-slate-500/20',
				text: 'text-slate-700',
				border: 'border-slate-500',
				ring: 'ring-slate-500',
				hover: 'hover:bg-slate-500/20',
				indicator: 'bg-slate-500'
			}
		);
	}

	static nameToTailwindClasses(name: ColorName): TwClasses {
		const nameMap: Record<string, TwClasses> = {
			red: {
				bg: 'bg-red-500/20',
				text: 'text-red-700',
				border: 'border-red-500',
				ring: 'ring-red-500',
				hover: 'hover:bg-red-500/20',
				indicator: 'bg-red-500'
			},
			orange: {
				bg: 'bg-orange-500/20',
				text: 'text-orange-700',
				border: 'border-orange-500',
				ring: 'ring-orange-500',
				hover: 'hover:bg-orange-500/20',
				indicator: 'bg-orange-500'
			},
			amber: {
				bg: 'bg-amber-500/20',
				text: 'text-amber-700',
				border: 'border-amber-500',
				ring: 'ring-amber-500',
				hover: 'hover:bg-amber-500/20',
				indicator: 'bg-amber-500'
			},
			yellow: {
				bg: 'bg-yellow-500/20',
				text: 'text-yellow-700',
				border: 'border-yellow-500',
				ring: 'ring-yellow-500',
				hover: 'hover:bg-yellow-500/20',
				indicator: 'bg-yellow-500'
			},
			lime: {
				bg: 'bg-lime-500/20',
				text: 'text-lime-700',
				border: 'border-lime-500',
				ring: 'ring-lime-500',
				hover: 'hover:bg-lime-500/20',
				indicator: 'bg-lime-500'
			},
			green: {
				bg: 'bg-green-500/20',
				text: 'text-green-700',
				border: 'border-green-500',
				ring: 'ring-green-500',
				hover: 'hover:bg-green-500/20',
				indicator: 'bg-green-500'
			},
			emerald: {
				bg: 'bg-emerald-500/20',
				text: 'text-emerald-700',
				border: 'border-emerald-500',
				ring: 'ring-emerald-500',
				hover: 'hover:bg-emerald-500/20',
				indicator: 'bg-emerald-500'
			},
			teal: {
				bg: 'bg-teal-500/20',
				text: 'text-teal-700',
				border: 'border-teal-500',
				ring: 'ring-teal-500',
				hover: 'hover:bg-teal-500/20',
				indicator: 'bg-teal-500'
			},
			cyan: {
				bg: 'bg-cyan-500/20',
				text: 'text-cyan-700',
				border: 'border-cyan-500',
				ring: 'ring-cyan-500',
				hover: 'hover:bg-cyan-500/20',
				indicator: 'bg-cyan-500'
			},
			sky: {
				bg: 'bg-sky-500/20',
				text: 'text-sky-700',
				border: 'border-sky-500',
				ring: 'ring-sky-500',
				hover: 'hover:bg-sky-500/20',
				indicator: 'bg-sky-500'
			},
			blue: {
				bg: 'bg-blue-500/20',
				text: 'text-blue-700',
				border: 'border-blue-500',
				ring: 'ring-blue-500',
				hover: 'hover:bg-blue-500/20',
				indicator: 'bg-blue-500'
			},
			indigo: {
				bg: 'bg-indigo-500/20',
				text: 'text-indigo-700',
				border: 'border-indigo-500',
				ring: 'ring-indigo-500',
				hover: 'hover:bg-indigo-500/20',
				indicator: 'bg-indigo-500'
			},
			violet: {
				bg: 'bg-violet-500/20',
				text: 'text-violet-700',
				border: 'border-violet-500',
				ring: 'ring-violet-500',
				hover: 'hover:bg-violet-500/20',
				indicator: 'bg-violet-500'
			},
			purple: {
				bg: 'bg-purple-500/20',
				text: 'text-purple-700',
				border: 'border-purple-500',
				ring: 'ring-purple-500',
				hover: 'hover:bg-purple-500/20',
				indicator: 'bg-purple-500'
			},
			fuchsia: {
				bg: 'bg-fuchsia-500/20',
				text: 'text-fuchsia-700',
				border: 'border-fuchsia-500',
				ring: 'ring-fuchsia-500',
				hover: 'hover:bg-fuchsia-500/20',
				indicator: 'bg-fuchsia-500'
			},
			pink: {
				bg: 'bg-pink-500/20',
				text: 'text-pink-700',
				border: 'border-pink-500',
				ring: 'ring-pink-500',
				hover: 'hover:bg-pink-500/20',
				indicator: 'bg-pink-500'
			},
			rose: {
				bg: 'bg-rose-500/20',
				text: 'text-rose-700',
				border: 'border-rose-500',
				ring: 'ring-rose-500',
				hover: 'hover:bg-rose-500/20',
				indicator: 'bg-rose-500'
			},
			slate: {
				bg: 'bg-slate-500/20',
				text: 'text-slate-700',
				border: 'border-slate-500',
				ring: 'ring-slate-500',
				hover: 'hover:bg-slate-500/20',
				indicator: 'bg-slate-500'
			}
		};

		return (
			nameMap[name.toLowerCase()] || {
				bg: 'bg-slate-500/20',
				text: 'text-slate-700',
				border: 'border-slate-500',
				ring: 'ring-slate-500',
				hover: 'hover:bg-slate-500/20',
				indicator: 'bg-slate-500'
			}
		);
	}

	static getNextColor(currentColor: string): HexColor {
		const currentIndex = this.COLORS.indexOf(currentColor as (typeof this.COLORS)[number]);
		if (currentIndex === -1) return this.COLORS[0];
		return this.COLORS[(currentIndex + 1) % this.COLORS.length];
	}

	static getPreviousColor(currentColor: string): HexColor {
		const currentIndex = this.COLORS.indexOf(currentColor as (typeof this.COLORS)[number]);
		if (currentIndex === -1) return this.COLORS[0];
		return this.COLORS[(currentIndex - 1 + this.COLORS.length) % this.COLORS.length];
	}

	static tailwindToHex(tailwindColor: string): HexColor {
		// Extraer el primer color hex de las clases tailwind
		// Buscar por las clases bg- más comunes
		if (tailwindColor.includes('bg-red-500')) return '#ef4444';
		if (tailwindColor.includes('bg-orange-500')) return '#f97316';
		if (tailwindColor.includes('bg-amber-500')) return '#f59e0b';
		if (tailwindColor.includes('bg-yellow-500')) return '#eab308';
		if (tailwindColor.includes('bg-lime-500')) return '#84cc16';
		if (tailwindColor.includes('bg-green-500')) return '#22c55e';
		if (tailwindColor.includes('bg-emerald-500')) return '#10b981';
		if (tailwindColor.includes('bg-teal-500')) return '#14b8a6';
		if (tailwindColor.includes('bg-cyan-500')) return '#06b6d4';
		if (tailwindColor.includes('bg-sky-500')) return '#0ea5e9';
		if (tailwindColor.includes('bg-blue-500')) return '#3b82f6';
		if (tailwindColor.includes('bg-indigo-500')) return '#6366f1';
		if (tailwindColor.includes('bg-violet-500')) return '#8b5cf6';
		if (tailwindColor.includes('bg-purple-500')) return '#a855f7';
		if (tailwindColor.includes('bg-fuchsia-500')) return '#d946ef';
		if (tailwindColor.includes('bg-pink-500')) return '#ec4899';
		if (tailwindColor.includes('bg-rose-500')) return '#f43f5e';

		// Default a slate si no encuentra coincidencia
		return '#64748b';
	}
}
