#[cfg(desktop)]
use tauri::Emitter;
#[cfg(desktop)]
use tauri_plugin_deep_link::DeepLinkExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
	#[allow(unused_mut)]
	let mut builder = tauri::Builder::default();

	#[cfg(desktop)]
	{
		builder = builder.plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
			if let Some(url) = argv.iter().find(|a| a.starts_with("ramolibre://")) {
				log::info!("deep-link-received from argv: {url}");
				app.emit("deep-link-received", url.clone()).ok();
			}
		}));
	}

	builder
		.plugin(tauri_plugin_deep_link::init())
		.plugin(tauri_plugin_store::Builder::default().build())
		.plugin(tauri_plugin_fs::init())
		.plugin(tauri_plugin_opener::init())
		.setup(|app| {
			#[cfg(any(target_os = "linux", all(debug_assertions, windows)))]
			app.deep_link().register_all()?;

			if cfg!(debug_assertions) {
				app.handle().plugin(
					tauri_plugin_log::Builder::default()
						.level(log::LevelFilter::Info)
						.build(),
				)?;
			}
			Ok(())
		})
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
