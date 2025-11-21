import { JSXElement } from 'solid-js';

type PowerAction = 'shutdown' | 'reboot' | 'sleep';

type PowerActionProps = {
  type: PowerAction;
  icon: JSXElement;
  onClick: (type: PowerAction) => void;
};

export const PowerActionButton = (props: PowerActionProps) => {
  const type = () => props.type;
  const icon = () => props.icon;
  const labelByType: Record<PowerAction, string> = {
    reboot: 'Перезагрузка',
    shutdown: 'Выключение',
    sleep: 'Сон',
  };

  return (
    <div
      class='flex aspect-square min-w-30 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border
        border-transparent bg-zinc-800 p-2 transition-colors hover:border-zinc-600'
      onClick={() => props.onClick(type())}
    >
      {icon()}
      <p>{labelByType[type()]}</p>
    </div>
  );
};
