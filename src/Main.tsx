import { getCurrentWindow } from '@tauri-apps/api/window';
import { disable, enable, isEnabled } from '@tauri-apps/plugin-autostart';
import { BaseDirectory, exists, readTextFile } from '@tauri-apps/plugin-fs';
import { Child, Command } from '@tauri-apps/plugin-shell';
import { parse } from 'ini';
import { BedSingle, LoaderCircle, Pen, PowerOff } from 'lucide-solid';
import { createEffect, createSignal } from 'solid-js';
import { PowerActionButton } from './components/PowerActionButton';
import { ParsedProfile, Profile } from './types/Profile';
import { getObjectKeys } from './utils/getObjectKeys';
import { powerAction } from './utils/powerAction';

export const Main = () => {
  const [profiles, setProfiles] = createSignal<Profile[]>([]);
  const [startupEnabled, setStartupEnabled] = createSignal<boolean>(false);
  const [currentProccess, setCurrentProccess] = createSignal<Child | null>(null);

  createEffect(async () => {
    const PROFILE_PATH = 'zen\\profiles.ini';
    const isProfilesExist = await exists(PROFILE_PATH, { baseDir: BaseDirectory.Data });
    const isZenExist = await exists('C:\\Program Files\\Zen Browser\\zen.exe');

    // TODO!: add state if zen profiles or zen not exist
    if (!isProfilesExist || !isZenExist) return;
    const profilesFile = await readTextFile(PROFILE_PATH, { baseDir: BaseDirectory.Data });
    const parsedProfilesFile = parse(profilesFile);

    getObjectKeys<ParsedProfile>(parsedProfilesFile).map((key) => {
      if (
        key.includes('Profile') &&
        parsedProfilesFile[key].Name &&
        !parsedProfilesFile[key].Name.includes('Default')
      ) {
        const profile: Profile = {
          name: parsedProfilesFile[key].Name,
          path: parsedProfilesFile[key].Path,
          priority: Number(key.charAt(key.length - 1)),
        };

        setProfiles((prev) => [...prev, profile]);
      }
    });
  });

  createEffect(async () => {
    setStartupEnabled(await isEnabled());
  });

  const handleProfileSelect = async (profile: Profile) => {
    if (currentProccess()) currentProccess()!.kill();
    const zenCommand = Command.create('zen', ['-P', profile.name]);

    zenCommand.addListener('close', () => {
      getCurrentWindow().show();
    });

    const process = await zenCommand.spawn();

    setCurrentProccess(process);
    getCurrentWindow().hide();
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
    const startZen = Command.create('zen', ['-P']);
    startZen.execute();
  };

  return (
    <div class='flex h-screen w-full items-center justify-center gap-4'>
      {profiles()
        .sort((a, b) => a.priority - b.priority)
        .map((profile) => (
          <div
            class='flex size-50 cursor-pointer flex-col items-center justify-end rounded-lg border border-transparent bg-zinc-800 p-4
              transition-colors hover:border-zinc-600'
            onClick={() => handleProfileSelect(profile)}
          >
            <h1 class='my-auto flex size-25 items-center justify-center rounded-full bg-zinc-700 text-5xl'>
              {profile.name.charAt(0)}
            </h1>
            <h2 class='text-xl'>
              {profile.name} ({profile.priority})
            </h2>
          </div>
        ))}

      <div class='absolute bottom-4 left-1/2 flex -translate-1/2 items-center justify-center gap-2'>
        <PowerActionButton type='reboot' icon={<LoaderCircle />} onClick={powerAction} />
        <PowerActionButton type='shutdown' icon={<PowerOff />} onClick={powerAction} />
        <PowerActionButton type='sleep' icon={<BedSingle />} onClick={powerAction} />
      </div>
      <div class='absolute right-4 bottom-4 flex items-center gap-4'>
        <div class='flex cursor-pointer items-center gap-2 *:cursor-pointer'>
          <label class='flex cursor-pointer items-center gap-2'>
            <input type='checkbox' class='peer hidden' checked={startupEnabled()} onChange={handleStartupToggle} />
            <div class='size-5 rounded-md border-2 border-gray-400 transition peer-checked:border-red-400 peer-checked:bg-red-400'></div>
            <span>Автозагрузка</span>
          </label>
        </div>
        <div
          class='flex cursor-pointer items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2'
          onClick={handleEditProfiles}
        >
          <Pen class='size-4' />
          <p>Редактировать профили</p>
        </div>
      </div>
    </div>
  );
};
