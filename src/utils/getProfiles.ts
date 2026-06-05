import { exists, readDir, readTextFile } from "@tauri-apps/plugin-fs";
import { getObjectKeys, tryCatch } from "badlib";
import { parse } from "ini";
import type { ParsedProfile, Profile } from "../types/Profile";

export const getProfiles = async (profilesPath: string, zenPath: string) => {
	const isProfilesExist = await exists(profilesPath);
	const isZenExist = await exists(zenPath);

	if (!isProfilesExist) {
		console.error(`Profiles dir ${profilesPath} not found or not accessable`);
		return [];
	}

	if (!isZenExist) {
		console.error("Zen file not found or not accessable");
		return [];
	}

	const { data: profilesFile, error } = await tryCatch(
		readTextFile(`${profilesPath}/profiles.ini`),
	);
	if (error) {
		const dir = await readDir(profilesPath);
		console.error(error);
		console.error(dir);
		return [];
	}

	const parsedProfilesFile = parse(profilesFile);

	const parsedProfiles = getObjectKeys<ParsedProfile>(parsedProfilesFile)
		.map((key) => {
			if (
				key.includes("Profile") &&
				parsedProfilesFile[key].Name &&
				!parsedProfilesFile[key].Name.includes("Default")
			) {
				const profile: Profile = {
					name: parsedProfilesFile[key].Name,
					path: parsedProfilesFile[key].Path,
					priority: Number(key.charAt(key.length - 1)),
				};

				return profile;
			}

			return null;
		})
		.filter((profile) => !!profile);

	return parsedProfiles;
};
