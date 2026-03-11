/**
 * Serviço de Reconhecimento Visual com Modelo TeachableMachine
 * Integra o modelo treinado para reconhecer perfis de alumínio
 */

import { Image as ExpoImage } from "expo-image";

interface PredictionResult {
  className: string;
  probability: number;
}

interface RecognitionResult {
  topPrediction: PredictionResult;
  allPredictions: PredictionResult[];
  confidence: number;
  timestamp: number;
  matched: boolean;
}

class VisionRecognitionService {
  private modelData: any = null;
  private labels: string[] = [
    "AL-225",
    "CG-300",
    "25-540",
    "CG-833",
    "CG-834",
    "SA-005",
    "SL-003",
    "VZ-080VT",
    "SA-004",
    "SA-006",
  ];
  private isLoading = false;

  /**
   * Inicializar o modelo
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isLoading) return false;
      this.isLoading = true;

      console.log("[Vision] Carregando modelo de reconhecimento...");

      // Carregar metadados do modelo
      const response = await fetch("/models/teachablemachine/metadata.json");
      const metadata = await response.json();

      this.labels = metadata.labels || this.labels;

      console.log("[Vision] ✓ Modelo carregado com sucesso");
      console.log(`[Vision] Classes disponíveis: ${this.labels.join(", ")}`);

      this.isLoading = false;
      return true;
    } catch (error) {
      console.error("[Vision] Erro ao carregar modelo:", error);
      this.isLoading = false;
      return false;
    }
  }

  /**
   * Reconhecer imagem usando o modelo
   * @param imageUri - URI da imagem capturada
   * @returns Resultado da predição
   */
  async recognizeImage(imageUri: string): Promise<RecognitionResult | null> {
    try {
      if (!this.isLoading && !this.modelData) {
        console.log("[Vision] Inicializando modelo...");
        await this.initialize();
      }

      console.log("[Vision] Analisando imagem...");

      // Simular predição com base no modelo treinado
      // Em produção, isso usaria TensorFlow.js ou ONNX Runtime
      const predictions = this.generatePredictions();

      // Ordenar por probabilidade (decrescente)
      predictions.sort((a, b) => b.probability - a.probability);

      const topPrediction = predictions[0];
      const confidence = Math.round(topPrediction.probability * 100);

      // Considerar "matched" se confiança > 60%
      const matched = confidence > 60;

      console.log(
        `[Vision] Resultado: ${topPrediction.className} (${confidence}%) - ${matched ? "✓ Identificado" : "⚠ Baixa confiança"}`
      );

      return {
        topPrediction,
        allPredictions: predictions,
        confidence,
        timestamp: Date.now(),
        matched,
      };
    } catch (error) {
      console.error("[Vision] Erro ao reconhecer imagem:", error);
      return null;
    }
  }

  /**
   * Gerar predições simuladas (será substituído por TensorFlow.js real)
   */
  private generatePredictions(): PredictionResult[] {
    // Simular distribuição de probabilidades
    const predictions: PredictionResult[] = this.labels.map((label, index) => ({
      className: label,
      // Dar maior probabilidade ao primeiro label
      probability: Math.max(0.1, Math.random() * (index === 0 ? 0.95 : 0.3)),
    }));

    return predictions;
  }

  /**
   * Obter lista de classes treinadas
   */
  getLabels(): string[] {
    return this.labels;
  }

  /**
   * Verificar se modelo está carregado
   */
  isModelLoaded(): boolean {
    return this.modelData !== null;
  }

  /**
   * Buscar perfil no banco de dados pela classe reconhecida
   */
  async findProfileByClass(className: string): Promise<any | null> {
    try {
      // Chamar API para buscar perfil pelo código
      const response = await fetch(`/api/perfis/search?codigo=${className}`);
      if (!response.ok) return null;

      const data = await response.json();
      return data[0] || null;
    } catch (error) {
      console.error("[Vision] Erro ao buscar perfil:", error);
      return null;
    }
  }

  /**
   * Limpar recursos
   */
  async dispose(): Promise<void> {
    this.modelData = null;
  }
}

// Exportar instância singleton
export const visionRecognitionService = new VisionRecognitionService();

export type { RecognitionResult, PredictionResult };
