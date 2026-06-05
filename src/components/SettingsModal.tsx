import { normalize } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { Store } from "@tauri-apps/plugin-store";
import { RotateCcw } from "lucide-solid";
import { useAtom, useAtomValue } from "solid-jotai";
import { settingsModalAtom } from "../atoms/modals";
import { settingsAtom } from "../atoms/settings";
import { getHotkeyHandler } from "../utils/keyboard";
import { Button } from "./Button";
import { Modal } from "./Modal";

export const SettingsModal = () => {
	const settings = useAtomValue(settingsAtom);
	const [settingsModal, setSettingsModal] = useAtom(settingsModalAtom);

	const handleChangeProfilesPath = async () => {
		const path = await open({
			recursive: true,
			directory: true,
			defaultPath: settings().profilesPath,
		});

		if (!path) return;
		const normalizedPath = await normalize(path);

		const store = await Store.get("store.json");
		if (!store) return;
		await store.set("profilesPath", normalizedPath);
	};

	const handleChangeZenPath = async () => {
		const path = await open({
			recursive: true,
			defaultPath: settings().zenPath,
			filters: [
				{
					name: "zen.exe",
					extensions: ["exe"],
				},
			],
		});

		if (!path) return;
		const normalizedPath = await normalize(path);

		const store = await Store.get("store.json");
		if (!store) return;
		await store.set("zenPath", normalizedPath);
	};

	const handleResetSettings = async () => {
		const store = await Store.get("store.json");
		if (!store) return;
		await store.reset();
	};

	return (
		<Modal title="Настройки" open={settingsModal()} onClose={setSettingsModal}>
			<div
				class="flex cursor-pointer justify-center flex-col hover:bg-zinc-900 p-4 rounded-xl transition-colors"
				role="menu"
				tabIndex={0}
				onClick={handleChangeProfilesPath}
				onKeyPress={getHotkeyHandler([["enter", handleChangeProfilesPath]])}
			>
				<h1>Путь до профилей Zen</h1>
				<p class="text-ellipsis overflow-hidden">{settings().profilesPath}</p>
			</div>
			<div
				class="flex cursor-pointer justify-center flex-col hover:bg-zinc-900 p-4 rounded-xl transition-colors"
				role="menu"
				tabIndex={0}
				onClick={handleChangeZenPath}
				onKeyPress={getHotkeyHandler([["enter", handleChangeZenPath]])}
			>
				<h1>Путь до Zen</h1>
				<p class="text-ellipsis overflow-hidden">{settings().zenPath}</p>
			</div>
			<Button
				icon={<RotateCcw class="size-4" />}
				class="mt-auto"
				onClick={handleResetSettings}
			>
				Сбросить настройки
			</Button>
		</Modal>
	);
};
