const tauri = window.__TAURI__;

import { setup } from './renderer.js';

document.addEventListener('alpine:init', () => {
	console.log('alpine:init');

	Alpine.data('main', () => ({
		is_streaming: false,
		versions: {},
		panels: {},
		show_info: false,
		show_settings: false,
		show_loading: false,
		show_panel: false,
		show_select_panel: false,

		async init() {
			this.menu_load_start();

			this.panels = Object.fromEntries(
				(await tauri.invoke('get_panels')).map((panel) => [
					panel.ip,
					panel,
				])
			);

			tauri.event.listen('panel_discovered', async (event) => {
				const panel = event.payload;

				this.panels[panel.ip] = panel;

				await tauri.invoke('add_panel', { panel });
			});

			tauri.event.listen('stream_data', (event) =>
				this.stream_render(event.payload)
			);

			this.versions[await tauri.app.getName()] =
				await tauri.app.getVersion();
			this.versions['Tauri'] = await tauri.app.getTauriVersion();
			this.versions['Alpine'] = Alpine.version;

			this.renderer = await setup();
			window.onclose = this.stream_stop;

			console.log(this.panels);

			this.menu_load_finish();
		},

		async stream_render(packet) {
			if (!this.is_streaming) return;

			if (!this.renderer.is_on) this.renderer.turn_on();

			console.log(packet);

			for (let i = 0; i < 128; i++) {
				this.renderer.set_pixel(
					i,
					packet[i * 3 + 1],
					packet[i * 3 + 2],
					packet[i * 3 + 3]
				);
			}

			this.renderer.render();
		},

		async stream_start(panel) {
			this.menu_load_start();

			await tauri.invoke('panel_start_stream', { panel });

			this.is_streaming = true;
			this.renderer.turn_on();

			this.menu_load_finish();
		},

		async stream_stop() {
			this.menu_load_start();

			await tauri.invoke('panel_stop_stream');

			this.is_streaming = false;
			this.renderer.turn_off();

			this.menu_load_finish();
		},

		menu_select_panel() {
			if (this.is_streaming) return this.stream_stop();

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

		menu_load_start() {
			this.show_select_panel = false;
			this.show_info = false;
			this.show_settings = false;
			this.show_panel = false;

			this.show_loading = true;
		},

		menu_load_finish() {
			this.show_select_panel = false;
			this.show_info = false;
			this.show_settings = false;
			this.show_panel = true;

			this.show_loading = false;
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
