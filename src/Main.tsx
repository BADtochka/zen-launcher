import { BaseDirectory, exists, readDir, readTextFile } from '@tauri-apps/plugin-fs';
import { parse } from 'ini';
import { createEffect, createSignal } from 'solid-js';
import { Profile } from './types/Profile';
import { getObjectKeys } from './utils/getObjectKeys';

export const Main = () => {
  const [profiles, setProfiles] = createSignal<Profile[]>([]);

  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //   setGreetMsg(await invoke('greet', { name: name() }));
  // }

  createEffect(async () => {
    const PROFILE_PATH = 'AppData\\Roaming\\zen\\profiles.ini';
    const isProfilesExist = await exists(PROFILE_PATH, { baseDir: BaseDirectory.Home });
    const isZenExist = await readDir('.', { baseDir: BaseDirectory.Data });
    console.log(isZenExist);

    // TODO!: add state if zen profiles not exist
    if (!isProfilesExist) return;
    const profilesFile = await readTextFile(PROFILE_PATH, { baseDir: BaseDirectory.Home });
    const parsedProfilesFile = parse(profilesFile);

    getObjectKeys(parsedProfilesFile).map((key) => {
      if (
        typeof key === 'string' &&
        key.includes('Profile') &&
        parsedProfilesFile[key].Name &&
        !parsedProfilesFile[key].Name.includes('Default')
      ) {
        setProfiles((prev) => [...prev, parsedProfilesFile[key]]);
      }
    });
  });

  return (
    <div class='flex h-screen w-full items-center justify-center gap-4'>
      {profiles().map((profile) => (
        <div
          class='flex size-50 cursor-pointer flex-col items-center justify-end rounded-lg border border-transparent bg-zinc-800 p-4
            transition-colors hover:border-zinc-600'
        >
          <h1 class='my-auto flex size-25 items-center justify-center rounded-full bg-zinc-700 text-5xl'>
            {profile.Name.charAt(0)}
          </h1>
          <h2 class='text-xl'>{profile.Name}</h2>
        </div>
      ))}
    </div>
  );
};
