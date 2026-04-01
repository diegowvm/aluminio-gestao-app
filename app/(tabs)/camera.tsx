import { ScrollView, Text, View, Pressable, ActivityIndicator, Modal, Image, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

export default function CameraScreen() {
  const colors = useColors();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  // Mutation para reconhecimento com LLM Multimodal
  const recognizeMutation = trpc.visionRecognitionLLM.analyzeWithLLM.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setShowResult(true);
      setIsAnalyzing(false);
    },
    onError: (error) => {
      Alert.alert("Erro", "Falha ao reconhecer perfil. Tente novamente.");
      setIsAnalyzing(false);
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão", "Permissão de câmera necessária");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert("Erro", "Selecione uma imagem primeiro");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const base64 = reader.result as string;
        recognizeMutation.mutate({
          imageBase64: base64,
          referenceObject: "moeda",
          catalogContext: true,
        });
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      Alert.alert("Erro", "Erro ao processar imagem");
      setIsAnalyzing(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Reconhecer Perfil</Text>
            <Text className="text-sm text-muted">Tire uma foto ou selecione uma imagem</Text>
            <Text className="text-xs text-primary font-semibold">✨ Powered by AI Multimodal</Text>
          </View>

          {/* Preview da Imagem */}
          {selectedImage ? (
            <View className="bg-surface rounded-lg overflow-hidden border-2 border-primary">
              <Image
                source={{ uri: selectedImage }}
                style={{ width: "100%", height: 300 }}
                resizeMode="contain"
              />
            </View>
          ) : (
            <View className="bg-surface rounded-lg h-64 items-center justify-center border-2 border-dashed border-border">
              <Text className="text-muted text-center">Nenhuma imagem selecionada</Text>
            </View>
          )}

          {/* Botões de Ação */}
          <View className="gap-3">
            <Pressable
              onPress={takePhoto}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text className="text-center font-semibold text-background">📷 Tirar Foto</Text>
            </Pressable>

            <Pressable
              onPress={pickImage}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text className="text-center font-semibold text-foreground">📁 Selecionar Arquivo</Text>
            </Pressable>

            {selectedImage && (
              <Pressable
                onPress={analyzeImage}
                disabled={isAnalyzing}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.success,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    opacity: pressed || isAnalyzing ? 0.7 : 1,
                  },
                ]}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text className="text-center font-bold text-background text-lg">
                    🔍 Analisar com IA
                  </Text>
                )}
              </Pressable>
            )}
          </View>

          {/* Dicas */}
          <View className="bg-surface rounded-lg p-4 gap-2 border border-border">
            <Text className="font-semibold text-foreground">💡 Dicas para melhor resultado:</Text>
            <Text className="text-xs text-muted">• Boa iluminação e contraste</Text>
            <Text className="text-xs text-muted">• Foto frontal do perfil</Text>
            <Text className="text-xs text-muted">• Inclua objeto de referência (moeda, régua)</Text>
            <Text className="text-xs text-primary font-semibold mt-2">Precisão esperada: 95%+</Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal de Resultado */}
      <Modal visible={showResult} animationType="slide" transparent>
        <ScreenContainer className="p-4 bg-background/95">
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View className="gap-6 mt-8">
              {/* Header do Resultado */}
              <View className="gap-2">
                <Text className="text-3xl font-bold text-foreground">Resultado</Text>
                <Text className="text-xs text-primary">Análise com IA Multimodal</Text>
              </View>

              {/* Resultado Principal */}
              {result && result.success && (
                <View className="bg-success/10 rounded-lg p-6 gap-4 border-2 border-success">
                  <View className="gap-2">
                    <Text className="text-sm text-muted">Perfil Identificado</Text>
                    <Text className="text-3xl font-bold text-success">{result.codigoPerfil}</Text>
                  </View>

                  <View className="flex-row justify-between">
                    <View>
                      <Text className="text-xs text-muted">Confiança (IA)</Text>
                      <Text className="text-2xl font-bold text-success">
                        {result.confidenceScore}%
                      </Text>
                    </View>
                    <View>
                      <Text className="text-xs text-muted">Tipo</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {result.nomePerfil}
                      </Text>
                    </View>
                  </View>

                  {result.medidas && (
                    <View className="gap-2 pt-4 border-t border-success/30">
                      <Text className="text-sm font-semibold text-foreground">Medidas (mm)</Text>
                      <Text className="text-sm font-mono text-muted">
                        {result.medidas.altura} × {result.medidas.largura} × {result.medidas.espessura}
                      </Text>
                    </View>
                  )}

                  {result.caracteristicas && (
                    <View className="gap-2 pt-4 border-t border-success/30">
                      <Text className="text-sm font-semibold text-foreground">Características</Text>
                      {result.caracteristicas.formato && (
                        <Text className="text-sm text-muted">
                          Formato: {result.caracteristicas.formato}
                        </Text>
                      )}
                      {result.caracteristicas.acabamento && (
                        <Text className="text-sm text-muted">
                          Acabamento: {result.caracteristicas.acabamento}
                        </Text>
                      )}
                      {result.caracteristicas.cor && (
                        <Text className="text-sm text-muted">
                          Cor: {result.caracteristicas.cor}
                        </Text>
                      )}
                    </View>
                  )}

                  {result.topMatches && result.topMatches.length > 1 && (
                    <View className="gap-2 pt-4 border-t border-success/30">
                      <Text className="text-sm font-semibold text-foreground">Alternativas</Text>
                      {result.topMatches.slice(1, 3).map((match: any, idx: number) => (
                        <View key={idx} className="flex-row justify-between">
                          <Text className="text-sm text-muted">{match.codigo}</Text>
                          <Text className="text-sm font-semibold text-foreground">{match.confianca}%</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {result && !result.success && (
                <View className="bg-error/10 rounded-lg p-6 gap-4 border-2 border-error">
                  <Text className="text-lg font-bold text-error">Erro na análise</Text>
                  <Text className="text-sm text-muted">{result.nomePerfil}</Text>
                </View>
              )}

              {/* Botões */}
              <View className="gap-3">
                <Pressable
                  onPress={() => {
                    setShowResult(false);
                    setSelectedImage(null);
                    setResult(null);
                  }}
                  style={({ pressed }) => [
                    {
                      backgroundColor: colors.primary,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text className="text-center font-semibold text-background">✓ Confirmar</Text>
                </Pressable>

                <Pressable
                  onPress={() => setShowResult(false)}
                  style={({ pressed }) => [
                    {
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text className="text-center font-semibold text-foreground">← Voltar</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </ScreenContainer>
      </Modal>
    </ScreenContainer>
  );
}
