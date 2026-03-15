import { ScrollView, Text, View, Pressable, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function PerformanceScreen() {
  const colors = useColors();
  const [modeloVersaoId, setModeloVersaoId] = useState(1);
  const [activeTab, setActiveTab] = useState<"acuracia" | "metricas" | "historico">("acuracia");

  // Queries
  const desempenhoQuery = trpc.performance.getDesempenhoGeral.useQuery(
    { modeloVersaoId },
    { enabled: !!modeloVersaoId }
  );

  const acuraciaTimeSeriesQuery = trpc.performance.getAcuraciaTimeSeries.useQuery(
    { modeloVersaoId, dias: 30 },
    { enabled: !!modeloVersaoId }
  );

  const metricasQuery = trpc.performance.getMetricasPorClasse.useQuery(
    { modeloVersaoId },
    { enabled: !!modeloVersaoId }
  );

  const confusionMatrixQuery = trpc.performance.getConfusionMatrix.useQuery(
    { modeloVersaoId },
    { enabled: !!modeloVersaoId }
  );

  const isLoading =
    desempenhoQuery.isLoading ||
    acuraciaTimeSeriesQuery.isLoading ||
    metricasQuery.isLoading ||
    confusionMatrixQuery.isLoading;

  if (isLoading) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-muted">Carregando métricas...</Text>
      </ScreenContainer>
    );
  }

  const desempenho = desempenhoQuery.data;
  const acuraciaTimeSeries = acuraciaTimeSeriesQuery.data || [];
  const metricas = metricasQuery.data || [];
  const confusionMatrix = confusionMatrixQuery.data;

  // Preparar dados para gráficos
  const acuraciaData = {
    labels: acuraciaTimeSeries.slice(-7).map((d) => {
      const date = new Date(d.data);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        data: acuraciaTimeSeries.slice(-7).map((d) => d.acuracia),
        color: () => colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  const metricasData = {
    labels: metricas.slice(0, 5).map((m) => m.codigoPerfil?.substring(0, 6) || "N/A"),
    datasets: [
      {
        data: metricas.slice(0, 5).map((m) => parseFloat(m.f1Score.toString())),
        color: () => colors.success,
      },
    ],
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Desempenho do Modelo</Text>
            <Text className="text-sm text-muted">Análise de precisão e acurácia</Text>
          </View>

          {/* Estatísticas Gerais */}
          <View className="bg-surface rounded-lg p-4 gap-3">
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-xs text-muted">Acurácia Média</Text>
                <Text className="text-2xl font-bold text-success">
                  {desempenho?.acuraciaMedia.toFixed(1)}%
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted">Total de Análises</Text>
                <Text className="text-2xl font-bold text-primary">
                  {desempenho?.totalAnalises}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-xs text-muted">Acertos</Text>
                <Text className="text-xl font-semibold text-success">
                  {desempenho?.acertos}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted">Erros</Text>
                <Text className="text-xl font-semibold text-error">
                  {desempenho?.erros}
                </Text>
              </View>
            </View>
          </View>

          {/* Abas */}
          <View className="flex-row gap-2">
            {(["acuracia", "metricas", "historico"] as const).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor:
                      activeTab === tab ? colors.primary : colors.surface,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  className={`text-center font-semibold text-sm ${
                    activeTab === tab ? "text-background" : "text-foreground"
                  }`}
                >
                  {tab === "acuracia"
                    ? "Acurácia"
                    : tab === "metricas"
                      ? "Métricas"
                      : "Histórico"}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Conteúdo das Abas */}
          {activeTab === "acuracia" && acuraciaData.labels.length > 0 && (
            <View className="bg-surface rounded-lg p-4 gap-3">
              <Text className="text-lg font-semibold text-foreground">
                Acurácia ao Longo do Tempo
              </Text>
              <LineChart
                data={acuraciaData}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  backgroundColor: colors.surface,
                  backgroundGradientFrom: colors.surface,
                  backgroundGradientTo: colors.surface,
                  color: () => colors.border,
                  labelColor: () => colors.muted,
                  strokeWidth: 2,
                  propsForDots: {
                    r: "4",
                    strokeWidth: "2",
                    stroke: colors.primary,
                  },
                }}
                bezier
              />
            </View>
          )}

          {activeTab === "metricas" && metricas.length > 0 && (
            <View className="bg-surface rounded-lg p-4 gap-3">
              <Text className="text-lg font-semibold text-foreground">
                F1-Score por Classe
              </Text>
              <BarChart
                data={metricasData}
                width={screenWidth - 40}
                height={220}
                yAxisLabel=""
                yAxisSuffix="%"
                chartConfig={{
                  backgroundColor: colors.surface,
                  backgroundGradientFrom: colors.surface,
                  backgroundGradientTo: colors.surface,
                  color: () => colors.border,
                  labelColor: () => colors.muted,
                  barPercentage: 0.7,
                }}
              />
              <View className="gap-2 mt-2">
                {metricas.slice(0, 5).map((m, idx) => (
                  <View key={idx} className="flex-row justify-between items-center">
                    <Text className="text-sm text-foreground font-medium">
                      {m.codigoPerfil}
                    </Text>
                    <View className="flex-row gap-3">
                      <Text className="text-xs text-muted">
                        P: {parseFloat(m.precision.toString()).toFixed(1)}%
                      </Text>
                      <Text className="text-xs text-muted">
                        R: {parseFloat(m.recall.toString()).toFixed(1)}%
                      </Text>
                      <Text className="text-xs font-semibold text-success">
                        F1: {parseFloat(m.f1Score.toString()).toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {activeTab === "historico" && acuraciaTimeSeries.length > 0 && (
            <View className="bg-surface rounded-lg p-4 gap-3">
              <Text className="text-lg font-semibold text-foreground">
                Histórico Detalhado
              </Text>
              {acuraciaTimeSeries.slice(-5).map((h, idx) => (
                <View key={idx} className="flex-row justify-between items-center pb-3 border-b border-border">
                  <View>
                    <Text className="text-sm font-medium text-foreground">
                      {new Date(h.data).toLocaleDateString("pt-BR")}
                    </Text>
                    <Text className="text-xs text-muted">
                      {h.totalAnalises} análises
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-lg font-bold text-success">
                      {h.acuracia.toFixed(1)}%
                    </Text>
                    <Text className="text-xs text-muted">
                      {h.acertos}/{h.totalAnalises}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Matriz de Confusão */}
          {confusionMatrix && confusionMatrix.classArray.length > 0 && (
            <View className="bg-surface rounded-lg p-4 gap-3">
              <Text className="text-lg font-semibold text-foreground">
                Matriz de Confusão
              </Text>
              <Text className="text-xs text-muted mb-2">
                Linhas: Real | Colunas: Predito
              </Text>
              <ScrollView horizontal>
                <View>
                  {confusionMatrix.classArray.map((realClass, i) => (
                    <View key={i} className="flex-row">
                      {confusionMatrix.classArray.map((predClass, j) => {
                        const value = confusionMatrix.matrixData[realClass]?.[predClass] || 0;
                        const isCorrect = realClass === predClass;
                        const bgColor = isCorrect
                          ? "bg-success/20"
                          : value > 0
                            ? "bg-warning/20"
                            : "bg-surface";

                        return (
                          <View
                            key={`${i}-${j}`}
                            className={`w-12 h-12 items-center justify-center border border-border ${bgColor}`}
                          >
                            <Text className="text-xs font-semibold text-foreground">
                              {value}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
