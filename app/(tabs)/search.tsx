import { ScrollView, Text, View, TextInput, Pressable, FlatList, ActivityIndicator, Modal, Image } from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { ProfileCard } from "@/components/profile-card";
import { LocationBadge } from "@/components/location-badge";
import { trpc } from "@/lib/trpc";
import { useLocalSearchParams } from "expo-router";
import { useColors } from "@/hooks/use-colors";

export default function SearchScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState((params.query as string) || "");
  const [selectedPerfil, setSelectedPerfil] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { data: searchResults, isLoading } = trpc.perfis.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const { data: localizacao } = trpc.localizacoes.getByPerfilId.useQuery(
    { perfilId: selectedPerfil?.id || 0 },
    { enabled: selectedPerfil !== null }
  );

  const handleSelectPerfil = (perfil: any) => {
    setSelectedPerfil(perfil);
    setShowDetailModal(true);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Buscar Perfil</Text>
            <Text className="text-sm text-muted">Encontre perfis por código ou nome</Text>
          </View>

          {/* Campo de Busca */}
          <View className="flex-row gap-2">
            <TextInput
              placeholder="Código ou nome..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 bg-surface border border-border rounded-lg px-3 py-3 text-foreground"
              placeholderTextColor="#64748B"
            />
          </View>

          {/* Resultados */}
          {searchQuery.length === 0 ? (
            <View className="items-center justify-center py-8">
              <Text className="text-muted text-center">Digite para buscar perfis</Text>
            </View>
          ) : isLoading ? (
            <ActivityIndicator color={colors.primary} size="large" />
          ) : searchResults && searchResults.length > 0 ? (
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">
                {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""} encontrado{searchResults.length !== 1 ? "s" : ""}
              </Text>
              <FlatList
                data={searchResults}
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
                      onPress={() => handleSelectPerfil(item)}
                    />
                  </View>
                )}
              />
            </View>
          ) : (
            <View className="items-center justify-center py-8">
              <Text className="text-muted text-center">Nenhum perfil encontrado</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal de Detalhes */}
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <ScreenContainer className="p-4">
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            <View className="gap-4">
              {/* Header Modal */}
              <View className="flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-foreground">Detalhes do Perfil</Text>
                <Pressable
                  onPress={() => setShowDetailModal(false)}
                  style={({ pressed }) => ({
                    opacity: pressed ? 0.7 : 1,
                  })}
                  className="bg-surface border border-border rounded-lg p-2"
                >
                  <Text className="text-foreground text-lg">✕</Text>
                </Pressable>
              </View>

              {selectedPerfil && (
                <View className="gap-4">
                  {/* Imagem */}
                  {selectedPerfil.imagemSecao && (
                    <View className="bg-surface rounded-lg overflow-hidden">
                      <Image
                        source={{ uri: selectedPerfil.imagemSecao }}
                        className="w-full h-48"
                        resizeMode="cover"
                      />
                    </View>
                  )}

                  {/* Informações Básicas */}
                  <View className="gap-2">
                    <View>
                      <Text className="text-xs text-muted font-medium">CÓDIGO</Text>
                      <Text className="text-lg font-bold text-primary">{selectedPerfil.codigoPerfil}</Text>
                    </View>
                    <View>
                      <Text className="text-xs text-muted font-medium">NOME</Text>
                      <Text className="text-base text-foreground">{selectedPerfil.nomePerfil}</Text>
                    </View>
                    {selectedPerfil.linha && (
                      <View>
                        <Text className="text-xs text-muted font-medium">LINHA</Text>
                        <Text className="text-base text-foreground">{selectedPerfil.linha}</Text>
                      </View>
                    )}
                  </View>

                  {/* Medidas */}
                  <View className="gap-2">
                    <Text className="text-sm font-medium text-foreground">Medidas (mm)</Text>
                    <View className="flex-row gap-2">
                      {selectedPerfil.alturaMm && (
                        <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
                          <Text className="text-xs text-muted">Altura</Text>
                          <Text className="text-lg font-bold text-foreground">{selectedPerfil.alturaMm}</Text>
                        </View>
                      )}
                      {selectedPerfil.larguraMm && (
                        <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
                          <Text className="text-xs text-muted">Largura</Text>
                          <Text className="text-lg font-bold text-foreground">{selectedPerfil.larguraMm}</Text>
                        </View>
                      )}
                      {selectedPerfil.espessuraMm && (
                        <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
                          <Text className="text-xs text-muted">Espessura</Text>
                          <Text className="text-lg font-bold text-foreground">{selectedPerfil.espessuraMm}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Localização */}
                  {localizacao && (
                    <View className="gap-2">
                      <Text className="text-sm font-medium text-foreground">Localização no Estoque</Text>
                      <LocationBadge
                        setor={localizacao.setor}
                        prateleira={localizacao.prateleira}
                        gaveta={localizacao.gaveta}
                      />
                      {localizacao.observacoes && (
                        <Text className="text-xs text-muted italic">{localizacao.observacoes}</Text>
                      )}
                    </View>
                  )}

                  {/* Observações */}
                  {selectedPerfil.observacoes && (
                    <View className="gap-2">
                      <Text className="text-sm font-medium text-foreground">Observações</Text>
                      <Text className="text-sm text-muted">{selectedPerfil.observacoes}</Text>
                    </View>
                  )}

                  {/* Data de Criação */}
                  <View className="gap-2">
                    <Text className="text-xs text-muted font-medium">CADASTRADO EM</Text>
                    <Text className="text-sm text-foreground">
                      {new Date(selectedPerfil.criadoEm).toLocaleDateString("pt-BR")}
                    </Text>
                  </View>
                </View>
              )}

              {/* Botão Fechar */}
              <Pressable
                onPress={() => setShowDetailModal(false)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
                className="bg-primary rounded-lg py-3 items-center mt-4"
              >
                <Text className="text-white font-semibold">Fechar</Text>
              </Pressable>
            </View>
          </ScrollView>
        </ScreenContainer>
      </Modal>
    </ScreenContainer>
  );
}
