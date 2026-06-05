import { getCurrentWindow } from "@tauri-apps/api/window";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { Command } from "@tauri-apps/plugin-shell";
import { BedSingle, Pen, PowerOff, RotateCcw, Settings } from "lucide-solid";
import { useAtom } from "solid-jotai";
import { createEffect, createSignal, Match, onMount, Switch } from "solid-js";
import { settingsModalAtom } from "./atoms/modals";
import { settingsAtom } from "./atoms/settings";
import { Button } from "./components/Button";
import { PowerActionButton } from "./components/PowerActionButton";
import { SettingsModal } from "./components/SettingsModal";
import { DEFAULT_SETTINGS } from "./constants/settings";
import type { Profile } from "./types/Profile";
import type { StoredSettings } from "./types/Settings";
import { getProfiles } from "./utils/getProfiles";
import { powerAction } from "./utils/powerAction";
import {
	createUnlistenRegistry,
	initStore,
	isSettingsKey,
} from "./utils/store";

export const Main = () => {
	const [profiles, setProfiles] = createSignal<Profile[]>([]);
	const [startupEnabled, setStartupEnabled] = createSignal<boolean>(false);
	const [settings, setSettings] = useAtom(settingsAtom);
	const [storeLoaded, setStoreLoaded] = createSignal(false);
	const [__, setSettingsModal] = useAtom(settingsModalAtom);
	const registerUnlisten = createUnlistenRegistry();

	onMount(async () => {
		const store = await initStore();
		const entries = await store.entries();
		const storedSettings = {
			...DEFAULT_SETTINGS,
			...(Object.fromEntries(entries) as Partial<StoredSettings>),
		};

		setStartupEnabled(await isEnabled());
		setSettings(storedSettings);
		setStoreLoaded(true);

		const unsubscribeStore = await store.onChange<
			StoredSettings[keyof StoredSettings]
		>((key, value) => {
			if (!isSettingsKey(key)) return;
			console.log("[Store]", `Key ${key} updated to `, value);

			setSettings((prev) => ({
				...prev,
				[key]: value ?? DEFAULT_SETTINGS[key],
			}));
		});

		registerUnlisten(unsubscribeStore);
	});

	createEffect(async () => {
		if (!storeLoaded()) return;
		console.log("must update profiles");
		const profiles = await getProfiles(
			settings().profilesPath,
			settings().zenPath,
		);

		setProfiles(profiles);
	});

	const handleProfileSelect = async (profile: Profile) => {
		console.log("run command");
		// 	if (currentProccess()) currentProccess()!.kill();
		const zenCommand = Command.create(settings().zenPath, ["-P", profile.name]);
		zenCommand.addListener("close", () => {
			getCurrentWindow().show();
		});

		zenCommand.addListener("error", () => {
			getCurrentWindow().show();
		});
		// 	const process = await zenCommand.spawn();
		// 	getCurrentWindow().hide();
	};

	const handleStartupToggle = async () => {
		if (startupEnabled()) {
			await disable();
		} else {
			await enable();
		}
		setStartupEnabled(!startupEnabled());
	};

	const handleEditProfiles = () => {
		const startZen = Command.create("zen", ["-P"]);
		startZen.execute();
	};

	const handleOpenSettings = () => {
		setSettingsModal(true);
	};

	return (
		<div class="flex h-screen w-full items-center justify-center gap-4">
			<Switch>
				<Match when={profiles().length > 0}>
					{profiles()
						.sort((a, b) => a.priority - b.priority)
						.map((profile) => (
							<div
								role="menu"
								tabIndex={0}
								class="flex size-50 cursor-pointer flex-col items-center justify-end rounded-lg border border-transparent bg-zinc-800
                  p-4 transition-colors hover:border-zinc-600"
								onClick={() => handleProfileSelect(profile)}
								onKeyPress={() => handleProfileSelect(profile)}
							>
								<h1 class="my-auto flex size-25 items-center justify-center rounded-full bg-zinc-700 text-5xl">
									{profile.name.charAt(0)}
								</h1>
								<h2 class="text-xl">
									{profile.name} ({profile.priority})
								</h2>
							</div>
						))}
				</Match>
				<Match when={profiles().length === 0}>
					<div>Не удалось подгрузить профили</div>
				</Match>
			</Switch>

			<div class="absolute bottom-4 left-1/2 flex -translate-1/2 items-center justify-center gap-2">
				<PowerActionButton
					type="reboot"
					icon={<RotateCcw />}
					onClick={powerAction}
				/>
				<PowerActionButton
					type="shutdown"
					icon={<PowerOff />}
					onClick={powerAction}
				/>
				<PowerActionButton
					type="sleep"
					icon={<BedSingle />}
					onClick={powerAction}
				/>
			</div>
			<div class="absolute right-4 bottom-4 flex items-center gap-4">
				<div class="flex cursor-pointer items-center gap-2 *:cursor-pointer">
					<label class="flex cursor-pointer items-center gap-2">
						<input
							type="checkbox"
							class="peer hidden"
							checked={startupEnabled()}
							onChange={handleStartupToggle}
						/>
						<div class="size-5 rounded-md border-2 border-gray-400 transition peer-checked:border-red-400 peer-checked:bg-red-400"></div>
						<span>Автозагрузка</span>
					</label>
				</div>
				<Button icon={<Pen class="size-4" />} onClick={handleEditProfiles}>
					Редактировать профили
				</Button>
				<Button icon={<Settings />} onClick={handleOpenSettings}>
					Настройки
				</Button>
			</div>
			<SettingsModal />
		</div>
	);
};
