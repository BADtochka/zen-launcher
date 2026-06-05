type HotkeyItem = [
	hotkey: string,
	handler: (event: KeyboardEvent) => void,
	options?: {
		preventDefault?: boolean;
		stopPropagation?: boolean;
	},
];

const isMac = () =>
	typeof navigator !== "undefined" &&
	/Mac|iPhone|iPad|iPod/.test(navigator.platform);

const normalizeKey = (key: string) =>
	key.toLowerCase() === "esc"
		? "escape"
		: key.toLowerCase() === "space"
			? " "
			: key.toLowerCase() === "[plus]"
				? "+"
				: key.toLowerCase();

function matchHotkey(hotkey: string, event: KeyboardEvent) {
	const parts = hotkey
		.toLowerCase()
		.replace(/\s+/g, "")
		.split("+")
		.map(normalizeKey);

	const needCtrl =
		parts.includes("ctrl") ||
		parts.includes("control") ||
		(!isMac() && parts.includes("mod"));
	const needMeta =
		parts.includes("meta") ||
		parts.includes("cmd") ||
		parts.includes("command") ||
		(isMac() && parts.includes("mod"));
	const needShift = parts.includes("shift");
	const needAlt = parts.includes("alt") || parts.includes("option");

	const mainKey = parts.find(
		(key) =>
			![
				"ctrl",
				"control",
				"meta",
				"cmd",
				"command",
				"mod",
				"shift",
				"alt",
				"option",
			].includes(key),
	);

	return (
		event.ctrlKey === needCtrl &&
		event.metaKey === needMeta &&
		event.shiftKey === needShift &&
		event.altKey === needAlt &&
		(!mainKey || normalizeKey(event.key) === mainKey)
	);
}

export function getHotkeyHandler(hotkeys: HotkeyItem[]) {
	return (event: KeyboardEvent) => {
		for (const [hotkey, handler, options] of hotkeys) {
			if (matchHotkey(hotkey, event)) {
				if (options?.preventDefault !== false) event.preventDefault();
				if (options?.stopPropagation) event.stopPropagation();

				handler(event);
				break;
			}
		}
	};
}
