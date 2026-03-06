import { View, Text } from "react-native";
import { cn } from "@/lib/utils";

interface StatCardProps {
  value: string | number;
  label: string;
  className?: string;
}

export function StatCard({ value, label, className }: StatCardProps) {
  return (
    <View className={cn("bg-surface rounded-lg p-4 border border-border", className)}>
      <Text className="text-3xl font-bold text-primary">{value}</Text>
      <Text className="text-sm text-muted mt-1">{label}</Text>
    </View>
  );
}
