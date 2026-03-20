import { IconButton, type IconButtonProps } from "./IconButton.tsx";

type CloseButtonSize = "sm" | "md";

const sizeStyles: Record<CloseButtonSize, { button: string; icon: string }> = {
  sm: { button: "size-8 lg:size-5 rounded-full", icon: "size-4 lg:size-3" },
  md: { button: "size-10 lg:size-8 rounded-lg", icon: "size-4" },
};

export function CloseButton({
  label,
  size = "md",
  ...props
}: { size?: CloseButtonSize } & Omit<IconButtonProps, "children">) {
  const s = sizeStyles[size];

  return (
    <IconButton className={s.button} label={label} {...props}>
      <svg
        aria-hidden="true"
        className={s.icon}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    </IconButton>
  );
}
