import { cn } from "badlib";
import { X } from "lucide-solid";
import type { Component, JSXElement } from "solid-js";
import { Portal } from "solid-js/web";
import { Button } from "./Button";

type ModalProps = {
	onClose: (value: false) => void;
	title?: string;
	open?: boolean;
	children?: JSXElement;
};

export const Modal: Component<ModalProps> = (props) => {
	const open = () => props.open;
	const onClose = () => props.onClose;
	const children = () => props.children;
	const title = () => props.title;

	return (
		<Portal>
			<div
				class={cn(
					"absolute top-0 flex inset-0 items-center justify-center opacity-100",
					{
						"opacity-0 pointer-events-none": !open(),
					},
				)}
			>
				<div class="h-4/5 max-w-100 w-full bg-zinc-800 flex flex-col overflow-hidden rounded-xl z-10">
					<div class="flex items-center justify-between bg-zinc-900/50 px-4 py-2">
						{title() && <h1 class="font-medium text-lg"> {title()}</h1>}
						<Button class="p-2" icon={<X />} onClick={() => onClose()(false)} />
					</div>
					<div class="flex flex-col gap-2 overflow-auto p-4 h-full">
						{children()}
					</div>
				</div>
				<div
					class="inset-0 bg-zinc-900/80 absolute"
					onClick={() => onClose()(false)}
				/>
			</div>
		</Portal>
	);
};
