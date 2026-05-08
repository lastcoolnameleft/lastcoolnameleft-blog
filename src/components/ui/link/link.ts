import { cva, type VariantProps } from "class-variance-authority";

const commonFontStyles = "text-sm font-medium";
const commonHoverStyles =
  "hover:text-[var(--accent)] active:text-[var(--accent)]";
const animatedUnderlineStyles =
  "bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat [background-position:0_100%] [background-size:0%_2px] transition-[background-size] duration-250 ease-out hover:[background-size:100%_2px] active:[background-size:100%_2px] group-hover:[background-size:100%_2px]";

export const link = cva(
  "relative inline-block transition duration-250 ease-out before:content-[''] before:absolute before:inset-y-[-10px] before:inset-x-[-7px] active:scale-95",
  {
    variants: {
      variant: {
        default: `${commonFontStyles} underline underline-offset-4 ${commonHoverStyles}`,
        "hover-reveal": `${commonFontStyles} text-[var(--accent)] underline-offset-4 underline decoration-transparent hover:text-[var(--accent-strong)] hover:decoration-current active:decoration-current`,
        "animated-underline": `${commonHoverStyles} ${animatedUnderlineStyles}`,
        plain: `${commonHoverStyles}`,
        unstyled: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type LinkVariants = VariantProps<typeof link>;
