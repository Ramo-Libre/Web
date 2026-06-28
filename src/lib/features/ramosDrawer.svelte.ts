export function createRamoDrawer() {
	let selectedId = $state<string | null>(null);

	function open(id: string) {
		selectedId = id;
	}

	function close() {
		selectedId = null;
	}

	return {
		get id() {
			return selectedId;
		},
		open,
		close
	};
}

export const ramoDrawer = createRamoDrawer();
