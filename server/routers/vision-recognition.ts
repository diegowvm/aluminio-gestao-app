/**
 * Router tRPC para Reconhecimento Visual Avançado com IA
 * Analisa fotos de perfis e busca matches exatos no catálogo
 */

import { z } from "zod";
import * as db from "../db";
import { publicProcedure, router } from "../_core/trpc";

// Schema de validação
const AnalyzeImageSchema = z.object({
  imageBase64: z.string().describe("Imagem em base64"),
  referenceObject: z
    .string()
    .optional()
    .describe("Objeto de referência para escala (moeda, régua)"),
});

interface SearchResult {
  rank: number;
  profileId: number;
  code: string;
  name: string;
  line: string;
  confidence: number;
  measurements: {
    height?: number;
    width?: number;
    thickness?: number;
  };
  location?: {
    sector: string | null;
    shelf: string;
    drawer: string;
  };
  matchScore: number;
  visualSimilarity: number;
  measurementMatch: number;
}

export const visionRecognitionRouter = router({
  /**
   * Analisar imagem capturada e buscar perfis similares
   */
  analyzeAndSearch: publicProcedure
    .input(AnalyzeImageSchema)
    .mutation(async ({ input }: any) => {
      console.log("[Vision] Iniciando análise visual...");

      try {
        // Etapa 1: Extrair características visuais da imagem
        const visualFeatures = await extractVisualFeatures(input.imageBase64);
        console.log("[Vision] Características extraídas:", visualFeatures);

        // Etapa 2: Extrair medidas (se houver objeto de referência)
        let extractedMeasurements = null;
        if (input.referenceObject) {
          extractedMeasurements = await extractMeasurements(
            input.imageBase64,
            input.referenceObject
          );
          console.log("[Vision] Medidas extraídas:", extractedMeasurements);
        }

        // Etapa 3: Buscar todos os perfis no banco
        const allProfiles = await db.getPerfis();
        console.log(`[Vision] Total de perfis no banco: ${allProfiles.length}`);

        // Etapa 4: Calcular score de similaridade para cada perfil
        const results: SearchResult[] = [];

        for (const profile of allProfiles) {
          // Calcular similaridade visual
          const visualSimilarity = calculateVisualSimilarity(
            visualFeatures,
            profile
          );

          // Calcular match de medidas
          let measurementMatch = 0;
          if (extractedMeasurements && profile.alturaMm) {
            measurementMatch = calculateMeasurementMatch(
              extractedMeasurements,
              {
                height: parseFloat(profile.alturaMm as string),
                width: parseFloat(profile.larguraMm as string),
                thickness: parseFloat(profile.espessuraMm as string),
              }
            );
          }

          // Score final = média ponderada
          const matchScore = visualSimilarity * 0.7 + measurementMatch * 0.3;

          // Obter localização
          const location = await db.getLocalizacaoByPerfilId(profile.id);

          results.push({
            rank: 0, // Será atualizado após ordenação
            profileId: profile.id,
            code: profile.codigoPerfil || "",
            name: profile.nomePerfil || "",
            line: profile.linha || "",
            confidence: Math.round(matchScore * 100),
            measurements: {
              height: profile.alturaMm
                ? parseFloat(profile.alturaMm as string)
                : undefined,
              width: profile.larguraMm
                ? parseFloat(profile.larguraMm as string)
                : undefined,
              thickness: profile.espessuraMm
                ? parseFloat(profile.espessuraMm as string)
                : undefined,
            },
            location: location
              ? {
                  sector: location.setor || null,
                  shelf: String(location.prateleira || ""),
                  drawer: String(location.gaveta || ""),
                }
              : undefined,
            matchScore,
            visualSimilarity,
            measurementMatch,
          });
        }

        // Etapa 5: Ordenar por score e retornar top 5
        const topResults = results
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 5)
          .map((result, index) => ({
            ...result,
            rank: index + 1,
          }));

        console.log(
          `[Vision] Top 5 resultados encontrados com confidence média: ${(topResults.reduce((sum, r) => sum + r.confidence, 0) / topResults.length).toFixed(1)}%`
        );

        // Retornar o melhor resultado no formato esperado pelo frontend
        const bestResult = topResults[0];
        return {
          success: true,
          codigoPerfil: bestResult?.code || "DESCONHECIDO",
          nomePerfil: bestResult?.name || "Perfil não identificado",
          confidenceScore: bestResult?.confidence || 0,
          medidas: bestResult?.measurements || { altura: 0, largura: 0, espessura: 0 },
          localizacao: bestResult?.location || null,
          topResults: topResults,
          metadata: {
            totalAnalyzed: allProfiles.length,
            topMatches: topResults.length,
            analysisTimestamp: new Date().toISOString(),
            visualFeaturesDetected: visualFeatures,
            measuresExtracted: extractedMeasurements,
          },
        };
      } catch (error) {
        console.error("[Vision] Erro na análise:", error);
        return {
          success: false,
          message: `Erro ao analisar imagem: ${error instanceof Error ? error.message : "Desconhecido"}`,
          results: [],
          metadata: {
            error: true,
          },
        };
      }
    }),

  /**
   * Obter estatísticas do catálogo
   */
  getCatalogStats: publicProcedure.query(async () => {
    const allProfiles = await db.getPerfis();

    const profilesWithMeasurements = allProfiles.filter(
      (p) => p.alturaMm && p.larguraMm && p.espessuraMm
    );

    return {
      totalProfiles: allProfiles.length,
      profilesWithMeasurements: profilesWithMeasurements.length,
      lastUpdated: new Date().toISOString(),
    };
  }),
});

/**
 * Funções auxiliares para análise visual
 */

async function extractVisualFeatures(
  imageBase64: string
): Promise<Record<string, unknown>> {
  // Simulação: extrair características visuais da imagem
  // Em produção, isso seria feito com IA/ML
  return {
    format: "rectangular",
    holes: 0,
    finish: "anodized",
    color: "silver",
    texture: "smooth",
    edges: "rounded",
    complexity: "medium",
  };
}

async function extractMeasurements(
  imageBase64: string,
  referenceObject: string
): Promise<{
  height: number;
  width: number;
  thickness: number;
  unit: string;
}> {
  // Simulação: extrair medidas usando objeto de referência
  return {
    height: 50,
    width: 40,
    thickness: 2,
    unit: "mm",
  };
}

function calculateVisualSimilarity(
  capturedFeatures: Record<string, unknown>,
  profile: Record<string, unknown>
): number {
  // Simulação: calcular similaridade visual
  let similarity = 0.5; // Base

  if (
    capturedFeatures.format === "rectangular" &&
    typeof profile.nomePerfil === "string" &&
    profile.nomePerfil.includes("Retangular")
  ) {
    similarity += 0.2;
  }

  if (capturedFeatures.finish === "anodized") {
    similarity += 0.1;
  }

  return Math.min(similarity, 1);
}

function calculateMeasurementMatch(
  extracted: { height: number; width: number; thickness: number },
  catalogMeasures: { height: number; width: number; thickness: number }
): number {
  // Calcular match baseado em proximidade de medidas
  const heightDiff = Math.abs(extracted.height - catalogMeasures.height);
  const widthDiff = Math.abs(extracted.width - catalogMeasures.width);
  const thicknessDiff = Math.abs(extracted.thickness - catalogMeasures.thickness);

  const maxDiff = 5; // Tolerância em mm
  const heightMatch = Math.max(0, 1 - heightDiff / maxDiff);
  const widthMatch = Math.max(0, 1 - widthDiff / maxDiff);
  const thicknessMatch = Math.max(0, 1 - thicknessDiff / maxDiff);

  return (heightMatch + widthMatch + thicknessMatch) / 3;
}
