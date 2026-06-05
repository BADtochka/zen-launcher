import { load, type Store } from "@tauri-apps/plugin-store";
import { onCleanup } from "solid-js";
import { DEFAULT_SETTINGS } from "../constants/settings";
import type { StoredSettings } from "../types/Settings";

export const initStore = async () =>
	await load("store.json", {
		autoSave: false,
		defaults: DEFAULT_SETTINGS,
	});

export const subscribeToStore = async <T>(
	store: Store,
	cb: (key: string, value: T | undefined) => void,
) => await store.onChange<T>((key, value) => cb(key, value));

type Unlisten = () => void;

export const createUnlistenRegistry = () => {
	const unsubscribers = new Set<Unlisten>();
	let cleaned = false;

	onCleanup(() => {
		cleaned = true;

		for (const unsubscribe of unsubscribers) {
			unsubscribe();
		}

		unsubscribers.clear();
	});

	return (unsubscribe: Unlisten) => {
		if (cleaned) {
			unsubscribe();
			return;
		}

		unsubscribers.add(unsubscribe);
	};
};

export const isSettingsKey = (key: string): key is keyof StoredSettings =>
	key in DEFAULT_SETTINGS;
