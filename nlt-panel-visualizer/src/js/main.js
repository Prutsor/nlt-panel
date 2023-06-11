const tauri = window.__TAURI__;

import { setup } from './renderer.js';

document.addEventListener('alpine:init', () => {
    console.log('alpine:init');

	Alpine.data('main', () => ({
		versions: {},
		show_info: false,
		show_settings: false,
		show_loading: true,
		show_panel: false,
		show_select_panel: false,

		async init() {
			this.versions[await tauri.app.getName()] =
				await tauri.app.getVersion();
			this.versions['Tauri'] = await tauri.app.getTauriVersion();
			this.versions['Alpine'] = Alpine.version;

			this.renderer = await setup();

			this.show_loading = false;
			this.show_panel = true;
		},

		menu_select_panel() {
			this.show_panel = false;
			this.show_select_panel = true;
		},

		menu_info() {
			this.show_panel = false;
			this.show_info = true;
		},

		menu_settings() {
			this.show_panel = false;
			this.show_settings = true;
		},

		menu_return() {
			if (this.show_loading) return;

			this.show_select_panel = false;
			this.show_info = false;
			this.show_settings = false;

			this.show_panel = true;
		},
	}));
});
