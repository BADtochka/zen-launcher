import { cn } from "badlib";
import type { JSXElement } from "solid-js";

type ButtonProps = {
	onClick: () => void;
	class?: string;
	icon?: JSXElement;
	children?: JSXElement;
};

export const Button = (props: ButtonProps) => {
	return (
		<div
			role="menu"
			class={cn(
				"flex cursor-pointer items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2",
				props.class,
			)}
			tabIndex={0}
			onClick={props.onClick}
			onKeyPress={props.onClick}
		>
			{props.icon}
			{props.children && <p>{props.children}</p>}
		</div>
	);
};
