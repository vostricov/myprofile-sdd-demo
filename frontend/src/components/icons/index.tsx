import {
  Check,
  ChevronDown,
  Edit3,
  Eye,
  Moon,
  RotateCcw,
  Save,
  Sun,
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

export function EyeIcon(props: IconProps) {
  return <Eye {...defaultIconProps} {...props} />;
}

export function MoonIcon(props: IconProps) {
  return <Moon {...defaultIconProps} {...props} />;
}

export function SaveIcon(props: IconProps) {
  return <Save {...defaultIconProps} {...props} />;
}

export function SunIcon(props: IconProps) {
  return <Sun {...defaultIconProps} {...props} />;
}

export function UndoIcon(props: IconProps) {
  return <RotateCcw {...defaultIconProps} {...props} />;
}
