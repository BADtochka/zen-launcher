import { Command } from '@tauri-apps/plugin-shell';

export const powerAction = (type: 'shutdown' | 'reboot' | 'sleep') => {
  const args: string[] = [];

  switch (type) {
    case 'shutdown':
      args.push('/s', '/t', '0');
      break;

    case 'reboot':
      args.push('/r', '/t', '0');
      break;

    case 'sleep':
      return Command.create('rundll32.exe', ['powrprof.dll,SetSuspendState', '0,1,0']).execute();
  }

  const command = Command.create('shutdown', args);
  return command.execute();
};
