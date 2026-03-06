import { View, Text, TextInput, TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function FormInput({ label, error, containerClassName, ...props }: FormInputProps) {
  return (
    <View className={cn("gap-1", containerClassName)}>
      {label && <Text className="text-sm font-medium text-foreground">{label}</Text>}
      <TextInput
        {...props}
        className={cn(
          "bg-surface border border-border rounded-lg px-3 py-3 text-foreground",
          error && "border-error",
          props.className
        )}
        placeholderTextColor="#64748B"
      />
      {error && <Text className="text-xs text-error">{error}</Text>}
    </View>
  );
}
