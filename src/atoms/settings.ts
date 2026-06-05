import { atom } from "solid-jotai";
import { DEFAULT_SETTINGS } from "../constants/settings";
import type { StoredSettings } from "../types/Settings";

export const settingsAtom = atom<StoredSettings>(DEFAULT_SETTINGS);
