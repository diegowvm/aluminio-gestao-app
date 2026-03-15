import { ScrollView, Text, View, Pressable, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

export default function DashboardScreen() {
  const colors = useColors();
  const router = useRouter();

  // Query para listar perfis
  const perfisQuery = trpc.perfis.list.useQuery();

  if (perfisQuery.isLoading) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const totalPerfis = perfisQuery.data?.length || 0;

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-8">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-4xl font-bold text-foreground">Gestão de Perfis</Text>
            <Text className="text-base text-muted">Reconhecimento de alumínio</Text>
          </View>

          {/* Estatísticas */}
          <View className="bg-surface rounded-2xl p-6 gap-4 shadow-sm border border-border">
            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Total de Perfis</Text>
              <Text className="text-5xl font-bold text-primary">{totalPerfis}</Text>
            </View>
            <Text className="text-xs text-muted">Perfis cadastrados no catálogo</Text>
          </View>

          {/* Botão Principal */}
          <Pressable
            onPress={() => router.push("/(tabs)/camera")}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                paddingVertical: 16,
                paddingHorizontal: 24,
                borderRadius: 12,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text className="text-center text-lg font-semibold text-background">
              📷 Reconhecer Perfil
            </Text>
          </Pressable>

          {/* Instruções */}
          <View className="bg-surface rounded-lg p-4 gap-3 border border-border">
            <Text className="font-semibold text-foreground">Como usar:</Text>
            <View className="gap-2">
              <Text className="text-sm text-muted">1. Clique em "Reconhecer"</Text>
              <Text className="text-sm text-muted">2. Tire uma foto do perfil</Text>
              <Text className="text-sm text-muted">3. A IA identificará o modelo</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
