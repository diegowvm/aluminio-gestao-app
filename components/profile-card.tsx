import { View, Text, Pressable, Image } from "react-native";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  codigo: string;
  nome: string;
  altura?: string | number | null;
  largura?: string | number | null;
  espessura?: string | number | null;
  imagem?: string | null;
  onPress?: () => void;
  className?: string;
}

export function ProfileCard({
  codigo,
  nome,
  altura,
  largura,
  espessura,
  imagem,
  onPress,
  className,
}: ProfileCardProps) {
  const medidas = [altura, largura, espessura].filter(Boolean).join(" x ");

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View className={cn("bg-surface rounded-lg p-4 border border-border flex-row gap-3", className)}>
        {imagem && (
          <Image
            source={{ uri: imagem }}
            className="w-16 h-16 rounded bg-background"
            resizeMode="cover"
          />
        )}
        <View className="flex-1">
          <Text className="text-sm font-semibold text-primary">{codigo}</Text>
          <Text className="text-base font-medium text-foreground mt-1">{nome}</Text>
          {medidas && <Text className="text-xs text-muted mt-2">{medidas} mm</Text>}
        </View>
      </View>
    </Pressable>
  );
}
