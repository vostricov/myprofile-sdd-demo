import {
  Check,
  ChevronDown,
  Edit3,
  X,
  type LucideProps,
} from "lucide-react";

type IconProps = Omit<LucideProps, "aria-hidden" | "focusable" | "strokeWidth">;

const defaultIconProps = {
  "aria-hidden": true,
  focusable: false,
  strokeWidth: 2,
} as const;

export function CheckIcon(props: IconProps) {
  return <Check {...defaultIconProps} {...props} />;
}

export function ChevronDownIcon(props: IconProps) {
  return <ChevronDown {...defaultIconProps} {...props} />;
}

export function CloseIcon(props: IconProps) {
  return <X {...defaultIconProps} {...props} />;
}

export function EditIcon(props: IconProps) {
  return <Edit3 {...defaultIconProps} {...props} />;
}
