import { ScrollView, Text, View, TextInput, Pressable, FlatList, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { StatCard } from "@/components/stat-card";
import { ProfileCard } from "@/components/profile-card";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";

export default function DashboardScreen() {
  const router = useRouter();
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: perfis, isLoading } = trpc.perfis.list.useQuery();
  const { data: searchResults } = trpc.perfis.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const totalPerfis = perfis?.length || 0;
  const recentPerfis = perfis?.slice(0, 3) || [];
  const displayPerfis = (searchQuery.length > 0 ? searchResults : recentPerfis) || [];

  const handleSearch = () => {
    if (searchQuery.length > 0) {
      router.push({
        pathname: "/(tabs)/search",
        params: { query: searchQuery },
      });
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Gestão de Perfis</Text>
            <Text className="text-sm text-muted">Catálogo técnico de alumínio</Text>
          </View>

          {/* Estatísticas */}
          <StatCard value={totalPerfis} label="Perfis Cadastrados" />

          {/* Busca Rápida */}
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Busca Rápida</Text>
            <View className="flex-row gap-2">
              <TextInput
                placeholder="Código ou nome..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 bg-surface border border-border rounded-lg px-3 py-3 text-foreground"
                placeholderTextColor="#64748B"
              />
              <Pressable
                onPress={handleSearch}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
                className="bg-primary rounded-lg px-4 py-3 justify-center"
              >
                <Text className="text-white font-semibold">🔍</Text>
              </Pressable>
            </View>
          </View>

          {/* Ações Rápidas */}
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Ações Rápidas</Text>
            <View className="flex-row flex-wrap gap-2">
              <Pressable
                onPress={() => router.push("/(tabs)/register")}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
                className="flex-1 min-w-[45%] bg-primary rounded-lg p-4 items-center gap-2"
              >
                <Text className="text-2xl">➕</Text>
                <Text className="text-white font-semibold text-sm">Novo Perfil</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push("/(tabs)/search")}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
                className="flex-1 min-w-[45%] bg-surface border border-border rounded-lg p-4 items-center gap-2"
              >
                <Text className="text-2xl">🔎</Text>
                <Text className="text-foreground font-semibold text-sm">Buscar</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push("/(tabs)/location")}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
                className="flex-1 min-w-[45%] bg-surface border border-border rounded-lg p-4 items-center gap-2"
              >
                <Text className="text-2xl">📍</Text>
                <Text className="text-foreground font-semibold text-sm">Localização</Text>
              </Pressable>

              <Pressable
                onPress={() => {}}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
                className="flex-1 min-w-[45%] bg-surface border border-border rounded-lg p-4 items-center gap-2"
              >
                <Text className="text-2xl">⚙️</Text>
                <Text className="text-foreground font-semibold text-sm">Configurações</Text>
              </Pressable>
            </View>
          </View>

          {/* Últimos Acessados */}
          {displayPerfis && displayPerfis.length > 0 && (
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">
                {searchQuery.length > 0 ? "Resultados da Busca" : "Últimos Perfis"}
              </Text>
              {isLoading ? (
                <ActivityIndicator color={colors.primary} size="large" />
              ) : (
                <FlatList
                  data={displayPerfis}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <View className="mb-2">
                      <ProfileCard
                        codigo={item.codigoPerfil}
                        nome={item.nomePerfil}
                        altura={item.alturaMm}
                        largura={item.larguraMm}
                        espessura={item.espessuraMm}
                        imagem={item.imagemSecao}
                        onPress={() =>
                          router.push({
                            pathname: "/(tabs)/search",
                            params: { perfilId: item.id.toString() },
                          })
                        }
                      />
                    </View>
                  )}
                />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
