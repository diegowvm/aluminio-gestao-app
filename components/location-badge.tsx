import { View, Text } from "react-native";
import { cn } from "@/lib/utils";

interface LocationBadgeProps {
  setor?: string;
  prateleira?: number;
  gaveta?: number;
  className?: string;
}

export function LocationBadge({ setor, prateleira, gaveta, className }: LocationBadgeProps) {
  if (!setor && !prateleira && !gaveta) {
    return (
      <View className={cn("bg-warning/10 rounded-lg px-3 py-2", className)}>
        <Text className="text-sm text-warning font-medium">Sem localização</Text>
      </View>
    );
  }

  const location = [setor && `Setor ${setor}`, prateleira && `Prat. ${prateleira}`, gaveta && `Gav. ${gaveta}`]
    .filter(Boolean)
    .join(" - ");

  return (
    <View className={cn("bg-primary/10 rounded-lg px-3 py-2", className)}>
      <Text className="text-sm text-primary font-medium">{location}</Text>
    </View>
  );
}
