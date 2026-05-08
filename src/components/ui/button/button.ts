import { cva, type VariantProps } from "class-variance-authority";

export const button = cva(
  "flex items-center justify-center cursor-pointer rounded-lg px-3.5 py-2.5 text-sm font-semibold tracking-wide focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95 transition duration-300 " +
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
  {
    variants: {
      intent: {
        primary:
          "bg-[var(--accent)] text-[var(--surface)] shadow-sm hover:bg-[var(--accent-strong)] focus-visible:outline-[var(--focus-ring)] active:bg-[var(--accent-strong)]",
        secondary:
          "border border-[var(--accent)] bg-transparent text-[var(--accent)] hover:bg-[var(--accent-soft)]",
        unstyled: "",
      },
    },
    defaultVariants: {
      intent: "primary",
    },
  },
);

export type ButtonVariants = VariantProps<typeof button>;
