import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "~/lib/client/utils";
import { Button } from "./button";

export const tagVariants = cva(
  "transition-all border inline-flex items-center text-sm pl-2 rounded-md",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        primary:
          "bg-primary border-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive border-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "text-xs h-7",
        md: "text-sm h-8",
        lg: "text-base h-9",
        xl: "text-lg h-10",
      },
      shape: {
        default: "rounded-sm",
        rounded: "rounded-lg",
        square: "rounded-none",
        pill: "rounded-full",
      },
      borderStyle: {
        default: "border-solid",
        none: "border-none",
      },
      textCase: {
        uppercase: "uppercase",
        lowercase: "lowercase",
        capitalize: "capitalize",
      },
      interaction: {
        clickable: "cursor-pointer hover:shadow-md",
        nonClickable: "cursor-default",
      },
      animation: {
        none: "",
        fadeIn: "animate-fadeIn",
        slideIn: "animate-slideIn",
        bounce: "animate-bounce",
      },
      textStyle: {
        normal: "font-normal",
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
        lineThrough: "line-through",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      shape: "default",
      borderStyle: "default",
      textCase: "capitalize",
      interaction: "nonClickable",
      animation: "fadeIn",
      textStyle: "normal",
    },
  }
);

export type Tag = {
  id: string;
  text: string;
};

export type TagProps = {
  tagObj: Tag;
  variant?: VariantProps<typeof tagVariants>["variant"];
  size?: VariantProps<typeof tagVariants>["size"];
  shape?: VariantProps<typeof tagVariants>["shape"];
  borderStyle?: VariantProps<typeof tagVariants>["borderStyle"];
  textCase?: VariantProps<typeof tagVariants>["textCase"];
  interaction?: VariantProps<typeof tagVariants>["interaction"];
  animation?: VariantProps<typeof tagVariants>["animation"];
  textStyle?: VariantProps<typeof tagVariants>["textStyle"];
  onRemoveTag: (id: string) => void;
};

export const Tag: React.FC<TagProps> = ({ tagObj, onRemoveTag, ...rest }) => {
  return (
    <span key={tagObj.id} className={cn(tagVariants(rest))}>
      {tagObj.text}
      <Button
        type="button"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation(); // Prevent event from bubbling up to the tag span
          onRemoveTag(tagObj.id);
        }}
        className={cn("py-1 px-3 h-full hover:bg-transparent")}
      >
        <X size={14} />
      </Button>
    </span>
  );
};
