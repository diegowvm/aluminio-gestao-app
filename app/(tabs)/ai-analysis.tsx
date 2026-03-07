import { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  FlatList,
  Modal,
  Image,
  Alert,
  TextInput,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { ProfileCard } from "@/components/profile-card";
import { LocationBadge } from "@/components/location-badge";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import * as ImagePicker from "expo-image-picker";

interface AnalysisResult {
  id: number;
  codigoPerfil: string;
  nomePerfil: string;
  alturaMm?: string | null;
  larguraMm?: string | null;
  espessuraMm?: string | null;
  confidence: number;
  similarity_score: number;
  localizacao?: {
    setor: string;
    prateleira: number;
    gaveta: number;
    observacoes?: string;
  } | null;
}

export default function AIAnalysisScreen() {
  const colors = useColors();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [referenceObject, setReferenceObject] = useState("");

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
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao capturar foto");
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert("Erro", "Selecione uma imagem primeiro");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Simular análise com IA
      // Em produção, enviaria a imagem para a API
      if (allPerfis && allPerfis.length > 0) {
        // Simular ranking de similaridade
        const results = allPerfis
          .map((p, index) => ({
            ...p,
            confidence: Math.max(0.5, 1 - index * 0.15),
            similarity_score: Math.max(0.5, 1 - index * 0.15),
          }))
          .sort((a, b) => b.similarity_score - a.similarity_score)
          .slice(0, 5);

        setAnalysisResults(results as AnalysisResult[]);
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao analisar imagem");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectResult = (result: AnalysisResult) => {
    setSelectedResult(result);
    setShowDetailModal(true);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "#22C55E"; // Verde
    if (confidence >= 0.6) return "#F59E0B"; // Amarelo
    return "#EF4444"; // Vermelho
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Análise Visual com IA</Text>
            <Text className="text-sm text-muted">Reconhecimento avançado de perfis de alumínio</Text>
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

          {/* Objeto de Referência */}
          {selectedImage && (
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">Objeto de Referência (opcional)</Text>
              <TextInput
                placeholder="Ex: moeda, régua, etc."
                value={referenceObject}
                onChangeText={setReferenceObject}
                className="bg-surface border border-border rounded-lg p-3 text-foreground"
                placeholderTextColor={colors.muted}
              />
              <Text className="text-xs text-muted">
                Ajuda a estimar as medidas com mais precisão
              </Text>
            </View>
          )}

          {/* Botões de Ação */}
          <View className="gap-2">
            <Pressable
              onPress={takePhoto}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
              className="bg-primary rounded-lg p-4 items-center flex-row justify-center gap-2"
            >
              <Text className="text-2xl">📷</Text>
              <Text className="text-white font-semibold">Tirar Foto</Text>
            </Pressable>

            <Pressable
              onPress={pickImage}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
              })}
              className="bg-surface border border-border rounded-lg p-4 items-center flex-row justify-center gap-2"
            >
              <Text className="text-2xl">🖼️</Text>
              <Text className="text-foreground font-semibold">Galeria</Text>
            </Pressable>

            {selectedImage && (
              <Pressable
                onPress={analyzeImage}
                disabled={isAnalyzing}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                })}
                className="bg-purple-600 rounded-lg p-4 items-center flex-row justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <ActivityIndicator color="white" />
                    <Text className="text-white font-semibold">Analisando...</Text>
                  </>
                ) : (
                  <>
                    <Text className="text-2xl">🤖</Text>
                    <Text className="text-white font-semibold">Analisar com IA</Text>
                  </>
                )}
              </Pressable>
            )}
          </View>

          {/* Resultados */}
          {!isAnalyzing && analysisResults.length > 0 && (
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">
                {analysisResults.length} resultado{analysisResults.length !== 1 ? "s" : ""} encontrado{analysisResults.length !== 1 ? "s" : ""}
              </Text>

              <FlatList
                data={analysisResults}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleSelectResult(item)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                    })}
                    className="mb-2 bg-surface rounded-lg p-3 border border-border"
                  >
                    <View className="flex-row justify-between items-start gap-2">
                      <View className="flex-1">
                        <Text className="text-base font-bold text-primary">{item.codigoPerfil}</Text>
                        <Text className="text-sm text-foreground">{item.nomePerfil}</Text>
                        <Text className="text-xs text-muted mt-1">
                          {item.alturaMm && `${item.alturaMm} × ${item.larguraMm} × ${item.espessuraMm} mm`}
                        </Text>
                      </View>
                      <View className="items-center gap-1">
                        <View
                          className="rounded-full px-2 py-1"
                          style={{ backgroundColor: getConfidenceColor(item.confidence) + "20" }}
                        >
                          <Text
                            className="text-xs font-bold"
                            style={{ color: getConfidenceColor(item.confidence) }}
                          >
                            {Math.round(item.confidence * 100)}%
                          </Text>
                        </View>
                        <Text className="text-xs text-muted">Confiança</Text>
                      </View>
                    </View>
                  </Pressable>
                )}
              />
            </View>
          )}

          {!isAnalyzing && selectedImage && analysisResults.length === 0 && (
            <View className="items-center justify-center py-8">
              <Text className="text-muted text-center">Clique em "Analisar com IA" para buscar perfis similares</Text>
            </View>
          )}

          {!selectedImage && (
            <View className="items-center justify-center py-12 bg-surface rounded-lg border border-border">
              <Text className="text-4xl mb-4">🤖</Text>
              <Text className="text-foreground font-semibold text-center">Análise Inteligente</Text>
              <Text className="text-muted text-sm text-center mt-2">
                Use IA para reconhecer perfis de alumínio com alta precisão
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
                <Text className="text-2xl font-bold text-foreground">Detalhes da Análise</Text>
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

              {selectedResult && (
                <View className="gap-4">
                  {/* Confiança */}
                  <View className="bg-surface rounded-lg p-4 border border-border">
                    <Text className="text-xs text-muted font-medium mb-2">CONFIANÇA DA ANÁLISE</Text>
                    <View className="flex-row items-center gap-2">
                      <View className="flex-1 bg-border rounded-full h-2 overflow-hidden">
                        <View
                          className="h-full"
                          style={{
                            width: `${selectedResult.confidence * 100}%`,
                            backgroundColor: getConfidenceColor(selectedResult.confidence),
                          }}
                        />
                      </View>
                      <Text className="text-lg font-bold" style={{ color: getConfidenceColor(selectedResult.confidence) }}>
                        {Math.round(selectedResult.confidence * 100)}%
                      </Text>
                    </View>
                  </View>

                  {/* Informações Básicas */}
                  <View className="gap-2">
                    <View>
                      <Text className="text-xs text-muted font-medium">CÓDIGO</Text>
                      <Text className="text-lg font-bold text-primary">{selectedResult.codigoPerfil}</Text>
                    </View>
                    <View>
                      <Text className="text-xs text-muted font-medium">NOME</Text>
                      <Text className="text-base text-foreground">{selectedResult.nomePerfil}</Text>
                    </View>
                  </View>

                  {/* Medidas */}
                  {(selectedResult.alturaMm || selectedResult.larguraMm || selectedResult.espessuraMm) && (
                    <View className="gap-2">
                      <Text className="text-sm font-medium text-foreground">Medidas (mm)</Text>
                      <View className="flex-row gap-2">
                        {selectedResult.alturaMm && (
                          <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
                            <Text className="text-xs text-muted">Altura</Text>
                            <Text className="text-lg font-bold text-foreground">{selectedResult.alturaMm}</Text>
                          </View>
                        )}
                        {selectedResult.larguraMm && (
                          <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
                            <Text className="text-xs text-muted">Largura</Text>
                            <Text className="text-lg font-bold text-foreground">{selectedResult.larguraMm}</Text>
                          </View>
                        )}
                        {selectedResult.espessuraMm && (
                          <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
                            <Text className="text-xs text-muted">Espessura</Text>
                            <Text className="text-lg font-bold text-foreground">{selectedResult.espessuraMm}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Localização */}
                  {selectedResult.localizacao && (
                    <View className="gap-2">
                      <Text className="text-sm font-medium text-foreground">Localização no Estoque</Text>
                      <LocationBadge
                        setor={selectedResult.localizacao.setor}
                        prateleira={selectedResult.localizacao.prateleira}
                        gaveta={selectedResult.localizacao.gaveta}
                      />
                      {selectedResult.localizacao.observacoes && (
                        <Text className="text-xs text-muted italic">{selectedResult.localizacao.observacoes}</Text>
                      )}
                    </View>
                  )}

                  {/* Ações */}
                  <View className="gap-2 mt-4">
                    <Pressable
                      onPress={() => setShowDetailModal(false)}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1,
                      })}
                      className="bg-primary rounded-lg py-3 items-center"
                    >
                      <Text className="text-white font-semibold">Confirmar Identificação</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => setShowDetailModal(false)}
                      style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1,
                      })}
                      className="bg-surface border border-border rounded-lg py-3 items-center"
                    >
                      <Text className="text-foreground font-semibold">Buscar Outro</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </ScreenContainer>
      </Modal>
    </ScreenContainer>
  );
}
