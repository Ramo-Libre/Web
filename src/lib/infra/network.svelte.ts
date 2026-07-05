import { browser } from '$app/environment';

class NetworkManager {
	private _isOnline = $state(browser ? navigator.onLine : true);
	private onlineListener = () => (this._isOnline = true);
	private offlineListener = () => (this._isOnline = false);

	constructor() {
		if (browser) {
			window.removeEventListener('online', this.onlineListener);
			window.removeEventListener('offline', this.offlineListener);
			window.addEventListener('online', this.onlineListener);
			window.addEventListener('offline', this.offlineListener);
		}
	}

	get online() {
		return this._isOnline;
	}
}

export const network = new NetworkManager();
