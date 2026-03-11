import { useState, useRef, useEffect } from "react";
import { ScrollView, Text, View, Pressable, ActivityIndicator, FlatList, Modal, Image, Alert } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { ProfileCard } from "@/components/profile-card";
import { LocationBadge } from "@/components/location-badge";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import * as ImagePicker from "expo-image-picker";
import { visionRecognitionService } from "@/lib/vision-recognition-service";

// Tipos para resultados de busca
interface SearchResult {
  id: number;
  codigoPerfil: string;
  nomePerfil: string;
  alturaMm?: string | null;
  larguraMm?: string | null;
  espessuraMm?: string | null;
  imagemSecao?: string | null;
  linha?: string | null;
  observacoes?: string | null;
  criadoEm: Date | string;
  atualizadoEm?: Date | string;
}

export default function CameraScreen() {
  const colors = useColors();
  const [modelReady, setModelReady] = useState(false);

  // Inicializar modelo ao montar componente
  useEffect(() => {
    const initModel = async () => {
      const initialized = await visionRecognitionService.initialize();
      setModelReady(initialized);
      console.log("[Camera] Modelo TeachableMachine:", initialized ? "✓ Pronto" : "✗ Erro");
    };
    initModel();
  }, []);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPerfil, setSelectedPerfil] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const { data: localizacao } = trpc.localizacoes.getByPerfilId.useQuery(
    { perfilId: selectedPerfil?.id || 0 },
    { enabled: selectedPerfil !== null }
  );

  const { data: allPerfis = [] } = trpc.perfis.list.useQuery();

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        await searchByImage(imageUri);
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao selecionar imagem");
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        await searchByImage(imageUri);
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao capturar foto");
    }
  };

  const searchByImage = async (imageUri: string) => {
    setIsSearching(true);
    try {
      console.log("[Camera] Iniciando reconhecimento visual...");
      
      // Usar serviço de reconhecimento visual com modelo TeachableMachine
      const result = await visionRecognitionService.recognizeImage(imageUri);
      
      if (!result) {
        Alert.alert("Erro", "Falha ao analisar imagem");
        setSearchResults([]);
        return;
      }

      console.log(`[Camera] Reconhecimento: ${result.topPrediction.className} (${result.confidence}%)`);
      
      // Buscar perfil pelo código reconhecido
      const recognizedCode = result.topPrediction.className;
      const matchedProfile = allPerfis?.find(
        p => p.codigoPerfil?.toUpperCase() === recognizedCode.toUpperCase()
      );

      if (matchedProfile && result.matched) {
        // Se encontrou match com confiança alta
        setSearchResults([{
          ...matchedProfile,
          criadoEm: matchedProfile.criadoEm instanceof Date 
            ? matchedProfile.criadoEm.toISOString() 
            : matchedProfile.criadoEm
        }]);
        
        Alert.alert(
          "✓ Identificado!",
          `${matchedProfile.codigoPerfil} - ${matchedProfile.nomePerfil}\nConfiança: ${result.confidence}%`
        );
      } else {
        // Se confiança baixa ou não encontrou, retornar top 5 similares
        const topSimilar = result.allPredictions.slice(0, 5).map(pred => 
          allPerfis?.find(p => p.codigoPerfil?.toUpperCase() === pred.className.toUpperCase())
        ).filter(Boolean) as SearchResult[];

        if (topSimilar.length > 0) {
          setSearchResults(topSimilar.map(p => ({
            ...p,
            criadoEm: p.criadoEm instanceof Date ? p.criadoEm.toISOString() : p.criadoEm
          })));
          
          Alert.alert(
            "⚠ Confiança Baixa",
            `Melhor match: ${result.topPrediction.className} (${result.confidence}%)\nMostrando perfis similares...`
          );
        } else {
          Alert.alert("Nenhum resultado", "Nenhum perfil similar encontrado");
          setSearchResults([]);
        }
      }
    } catch (error) {
      console.error("[Camera] Erro:", error);
      Alert.alert("Erro", "Falha ao buscar perfis similares");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPerfil = (perfil: SearchResult) => {
    setSelectedPerfil(perfil);
    setShowDetailModal(true);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Buscar por Foto</Text>
            <Text className="text-sm text-muted">Tire uma foto do perfil para identificá-lo</Text>
          </View>

          {/* Imagem Selecionada */}
          {selectedImage && (
            <View className="bg-surface rounded-lg overflow-hidden border border-border">
              <Image source={{ uri: selectedImage }} className="w-full h-48" resizeMode="cover" />
              <Pressable
                onPress={() => setSelectedImage(null)}
                className="bg-error/10 p-2 items-center"
              >
                <Text className="text-error text-sm font-semibold">Limpar Imagem</Text>
              </Pressable>
            </View>
          )}

          {/* Status do Modelo */}
          {!modelReady && (
            <View className="bg-warning/10 border border-warning rounded-lg p-3">
              <Text className="text-warning text-sm font-semibold">⚠ Carregando modelo de IA...</Text>
            </View>
          )}
          {modelReady && (
            <View className="bg-success/10 border border-success rounded-lg p-3">
              <Text className="text-success text-sm font-semibold">✓ Modelo de IA pronto</Text>
              <Text className="text-success text-xs mt-1">
                Classes: {visionRecognitionService.getLabels().join(", ")}
              </Text>
            </View>
          )}

          {/* Botões de Ação */}
          <View className="gap-2">
            <Pressable
              onPress={takePhoto}
              disabled={!modelReady || isSearching}
              style={({ pressed }) => ({
                opacity: pressed && modelReady && !isSearching ? 0.7 : 1,
              })}
              className={`rounded-lg p-4 items-center flex-row justify-center gap-2 ${
                modelReady && !isSearching ? "bg-primary" : "bg-primary/50"
              }`}
            >
              {isSearching ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-2xl">📷</Text>
                  <Text className="text-white font-semibold">Tirar Foto</Text>
                </>
              )}
            </Pressable>

            <Pressable
              onPress={pickImage}
              disabled={!modelReady || isSearching}
              style={({ pressed }) => ({
                opacity: pressed && modelReady && !isSearching ? 0.7 : 1,
              })}
              className={`border rounded-lg p-4 items-center flex-row justify-center gap-2 ${
                modelReady && !isSearching
                  ? "bg-surface border-border"
                  : "bg-surface/50 border-border/50"
              }`}
            >
              {isSearching ? (
                <ActivityIndicator color={colors.foreground} />
              ) : (
                <>
                  <Text className="text-2xl">🖼️</Text>
                  <Text className="text-foreground font-semibold">Galeria</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Resultados */}
          {isSearching && (
            <View className="items-center justify-center py-8">
              <ActivityIndicator color={colors.primary} size="large" />
              <Text className="text-muted mt-2">Analisando imagem...</Text>
            </View>
          )}

          {!isSearching && searchResults.length > 0 && (
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">
                {searchResults.length} perfil{searchResults.length !== 1 ? "s" : ""} similar{searchResults.length !== 1 ? "es" : ""} encontrado{searchResults.length !== 1 ? "s" : ""}
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
          )}

          {!isSearching && selectedImage && searchResults.length === 0 && (
            <View className="items-center justify-center py-8">
              <Text className="text-muted text-center">Nenhum perfil similar encontrado</Text>
            </View>
          )}

          {!selectedImage && (
            <View className="items-center justify-center py-12 bg-surface rounded-lg border border-border">
              <Text className="text-4xl mb-4">📸</Text>
              <Text className="text-foreground font-semibold text-center">Selecione uma imagem</Text>
              <Text className="text-muted text-sm text-center mt-2">
                Use a câmera ou galeria para buscar perfis similares
              </Text>
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
