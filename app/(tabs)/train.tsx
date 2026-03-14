import { useState, useEffect } from "react";
import { ScrollView, Text, View, Pressable, ActivityIndicator, Alert, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import * as ImagePicker from "expo-image-picker";

interface TrainingStats {
  total: number;
  porClasse: Record<string, number>;
}

export default function TrainScreen() {
  const colors = useColors();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPerfil, setSelectedPerfil] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [trainingStats, setTrainingStats] = useState<TrainingStats | null>(null);
  const [acuraciaStats, setAcuraciaStats] = useState<any>(null);

  const { data: allPerfis = [] } = trpc.perfis.list.useQuery();
  const { data: stats } = trpc.training.getTrainingStats.useQuery();
  const { data: acuracia } = trpc.training.getAcuraciaStats.useQuery();

  useEffect(() => {
    if (stats) setTrainingStats(stats);
    if (acuracia) setAcuraciaStats(acuracia);
  }, [stats, acuracia]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
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
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao capturar foto");
    }
  };

  const handleAddTrainingData = async () => {
    if (!selectedImage || !selectedPerfil) {
      Alert.alert("Erro", "Selecione uma imagem e um perfil");
      return;
    }

    setIsUploading(true);
    try {
      // Em produção, fazer upload da imagem para S3 e obter URL
      const imagemUri = selectedImage; // Usar URI local por enquanto

      const mutation = trpc.training.addTrainingData.useMutation();
      await mutation.mutateAsync({
        perfilId: selectedPerfil.id,
        imagemUri,
        classe: selectedPerfil.codigoPerfil,
        angulo: "frontal",
        iluminacao: "natural",
        qualidade: 95,
        notas: "Imagem de treinamento adicionada pelo usuário",
      });

      Alert.alert("Sucesso", `Imagem adicionada para ${selectedPerfil.codigoPerfil}`);
      setSelectedImage(null);
      setSelectedPerfil(null);
    } catch (error) {
      Alert.alert("Erro", "Falha ao adicionar dados de treinamento");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-2xl font-bold text-foreground">Treinar Modelo</Text>
            <Text className="text-sm text-muted">Adicione fotos para melhorar a IA</Text>
          </View>

          {/* Estatísticas */}
          {trainingStats && (
            <View className="bg-surface rounded-lg p-4 border border-border gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted">Total de Imagens</Text>
                <Text className="text-2xl font-bold text-primary">{trainingStats.total}</Text>
              </View>
              <View className="h-px bg-border" />
              <Text className="text-xs text-muted font-semibold">Imagens por Classe:</Text>
              {Object.entries(trainingStats.porClasse).slice(0, 5).map(([classe, count]) => (
                <View key={classe} className="flex-row justify-between items-center">
                  <Text className="text-xs text-foreground">{classe}</Text>
                  <Text className="text-xs font-semibold text-primary">{count} fotos</Text>
                </View>
              ))}
            </View>
          )}

          {/* Acurácia */}
          {acuraciaStats && (
            <View className="bg-success/10 rounded-lg p-4 border border-success gap-2">
              <Text className="text-sm font-semibold text-success">Acurácia Atual</Text>
              <Text className="text-3xl font-bold text-success">{acuraciaStats.acuraciaMedia}%</Text>
              <Text className="text-xs text-success/70">
                {acuraciaStats.acertos} acertos em {acuraciaStats.total} análises
              </Text>
            </View>
          )}

          {/* Seleção de Imagem */}
          {selectedImage && (
            <View className="bg-surface rounded-lg overflow-hidden border border-border">
              <Text className="text-sm font-semibold text-foreground p-3 bg-surface">Imagem Selecionada</Text>
              <View className="h-48 bg-muted/10 items-center justify-center">
                <Text className="text-muted text-sm">Imagem carregada</Text>
              </View>
              <Pressable
                onPress={() => setSelectedImage(null)}
                className="bg-error/10 p-2 items-center"
              >
                <Text className="text-error text-sm font-semibold">Remover Imagem</Text>
              </Pressable>
            </View>
          )}

          {/* Botões de Captura */}
          <View className="gap-2">
            <Pressable
              onPress={takePhoto}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              className="bg-primary rounded-lg p-4 items-center flex-row justify-center gap-2"
            >
              <Text className="text-2xl">📷</Text>
              <Text className="text-white font-semibold">Tirar Foto</Text>
            </Pressable>

            <Pressable
              onPress={pickImage}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              className="bg-surface border border-border rounded-lg p-4 items-center flex-row justify-center gap-2"
            >
              <Text className="text-2xl">🖼️</Text>
              <Text className="text-foreground font-semibold">Galeria</Text>
            </Pressable>
          </View>

          {/* Seleção de Perfil */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Selecione o Perfil</Text>
            <Pressable
              onPress={() => {
                // Mostrar picker de perfis
                const perfis = allPerfis.slice(0, 10);
                const options = perfis.map((p) => p.nomePerfil || p.codigoPerfil);
                // Simular seleção (em produção usar ActionSheetIOS ou similar)
                if (perfis.length > 0) {
                  setSelectedPerfil(perfis[0]);
                }
              }}
              className="bg-surface border border-border rounded-lg p-3"
            >
              <Text className="text-foreground font-semibold">
                {selectedPerfil ? `${selectedPerfil.codigoPerfil} - ${selectedPerfil.nomePerfil}` : "Clique para selecionar"}
              </Text>
            </Pressable>
          </View>

          {/* Lista de Perfis Disponíveis */}
          {!selectedPerfil && (
            <View className="gap-2">
              <Text className="text-xs text-muted">Perfis Disponíveis (primeiros 5):</Text>
              {allPerfis.slice(0, 5).map((perfil) => (
                <Pressable
                  key={perfil.id}
                  onPress={() => setSelectedPerfil(perfil)}
                  className="bg-surface border border-border rounded-lg p-3 flex-row justify-between items-center"
                >
                  <View>
                    <Text className="text-sm font-semibold text-foreground">{perfil.codigoPerfil}</Text>
                    <Text className="text-xs text-muted">{perfil.nomePerfil}</Text>
                  </View>
                  <Text className="text-lg">→</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Botão Adicionar */}
          <Pressable
            onPress={handleAddTrainingData}
            disabled={!selectedImage || !selectedPerfil || isUploading}
            style={({ pressed }) => ({
              opacity: pressed && !isUploading ? 0.7 : 1,
            })}
            className={`rounded-lg p-4 items-center flex-row justify-center gap-2 ${
              selectedImage && selectedPerfil && !isUploading ? "bg-success" : "bg-success/50"
            }`}
          >
            {isUploading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-2xl">✓</Text>
                <Text className="text-white font-semibold">Adicionar Imagem de Treinamento</Text>
              </>
            )}
          </Pressable>

          {/* Instruções */}
          <View className="bg-primary/10 rounded-lg p-4 border border-primary/20 gap-2">
            <Text className="text-sm font-semibold text-primary">Como Treinar o Modelo</Text>
            <Text className="text-xs text-primary/80">
              1. Tire fotos de diferentes ângulos e iluminações{"\n"}
              2. Selecione o perfil correto{"\n"}
              3. Adicione a imagem ao conjunto de treinamento{"\n"}
              4. Repita para diferentes perfis{"\n"}
              5. Exporte os dados e retreine no TeachableMachine
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
