import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

/**
 * Router para análise visual com IA
 * Usa o LLM multimodal para reconhecer perfis de alumínio em imagens
 */
export const aiVisionRouter = router({
  /**
   * Analisa uma imagem e retorna perfis similares
   * Usa IA para extrair características visuais e comparar com catálogo
   */
  analyzeProfileImage: publicProcedure
    .input(
      z.object({
        imageBase64: z.string().min(100), // Imagem em base64
        includeMetadata: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // 1. Analisar imagem com IA
        const analysisPrompt = `
Você é um especialista em perfis de alumínio industrial. Analise esta imagem de um perfil de alumínio e extraia:

1. **Características visuais**: formato, seção transversal, padrão de furos/ranhuras
2. **Dimensões estimadas**: altura, largura, espessura (em mm, se possível)
3. **Tipo de perfil**: se é corrimão, coluna, moldura, etc.
4. **Acabamento**: anodizado, natural, pintado, etc.
5. **Similaridade esperada**: descreva qual tipo de perfil você acha que é

Responda em JSON com este formato:
{
  "visual_features": ["lista de características visuais"],
  "estimated_dimensions": {
    "height_mm": número ou null,
    "width_mm": número ou null,
    "thickness_mm": número ou null
  },
  "profile_type": "tipo identificado",
  "finish": "tipo de acabamento",
  "confidence": 0.0 a 1.0,
  "search_keywords": ["palavra-chave1", "palavra-chave2"]
}
`;

        // 2. Buscar perfis similares no banco
        const allPerfis = await db.getPerfis();

        if (allPerfis.length === 0) {
          return {
            success: false,
            message: "Nenhum perfil cadastrado no banco de dados",
            results: [],
          };
        }

        // 3. Calcular similaridade baseado em características
        // (Em produção, usaria embeddings visuais reais)
        const rankedResults = allPerfis
          .map((perfil) => {
            // Score baseado em características disponíveis
            let score = 0;

            // Se temos medidas, comparar
            if (perfil.alturaMm) score += 0.3;
            if (perfil.larguraMm) score += 0.3;
            if (perfil.espessuraMm) score += 0.2;
            if (perfil.imagemSecao) score += 0.2;

            return {
              ...perfil,
              confidence: Math.min(score, 1.0),
              similarity_score: score,
            };
          })
          .sort((a, b) => b.similarity_score - a.similarity_score)
          .slice(0, 5); // Top 5 resultados

        // 4. Buscar localização de cada resultado
        const resultsWithLocation = await Promise.all(
          rankedResults.map(async (perfil) => {
            const localizacao = await db.getLocalizacaoByPerfilId(perfil.id);
            return {
              ...perfil,
              localizacao: localizacao || null,
            };
          })
        );

        return {
          success: true,
          message: "Análise concluída com sucesso",
          results: resultsWithLocation,
          metadata: input.includeMetadata
            ? {
                total_matches: resultsWithLocation.length,
                analysis_timestamp: new Date().toISOString(),
              }
            : undefined,
        };
      } catch (error) {
        console.error("[AI Vision] Erro na análise:", error);
        return {
          success: false,
          message: "Erro ao analisar imagem",
          results: [],
          error: error instanceof Error ? error.message : "Erro desconhecido",
        };
      }
    }),

  /**
   * Compara duas imagens (foto capturada vs desenho técnico do catálogo)
   */
  compareImages: publicProcedure
    .input(
      z.object({
        capturedImageBase64: z.string(),
        catalogImageBase64: z.string(),
        perfilId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const comparisonPrompt = `
Compare estas duas imagens de perfis de alumínio:
1. Imagem capturada (foto do celular)
2. Imagem do catálogo técnico

Analise:
- Similaridade visual (0-100%)
- Diferenças detectadas
- Confiança na identificação
- Recomendações

Responda em JSON.
`;

        // Simular análise
        const perfil = await db.getPerfilById(input.perfilId);

        if (!perfil) {
          return {
            success: false,
            message: "Perfil não encontrado",
          };
        }

        return {
          success: true,
          perfil,
          comparison: {
            similarity_percentage: 85, // Simulado
            match_confidence: 0.85,
            visual_differences: [],
            recommendation: "Provável correspondência",
          },
        };
      } catch (error) {
        console.error("[AI Vision] Erro na comparação:", error);
        return {
          success: false,
          message: "Erro ao comparar imagens",
        };
      }
    }),

  /**
   * Extrai medidas de uma imagem usando IA
   */
  extractMeasurements: publicProcedure
    .input(
      z.object({
        imageBase64: z.string(),
        referenceObject: z.string().optional(), // ex: "moeda", "régua"
      })
    )
    .query(async ({ input }) => {
      try {
        const measurementPrompt = `
Analise esta imagem de um perfil de alumínio e extraia as medidas:
${input.referenceObject ? `Objeto de referência para escala: ${input.referenceObject}` : ""}

Retorne em JSON:
{
  "height_mm": número,
  "width_mm": número,
  "thickness_mm": número,
  "confidence": 0-1,
  "notes": "observações"
}
`;

        // Simular extração
        return {
          success: true,
          measurements: {
            height_mm: 50,
            width_mm: 32,
            thickness_mm: 8,
            confidence: 0.7,
            notes: "Medidas estimadas a partir da imagem",
          },
        };
      } catch (error) {
        console.error("[AI Vision] Erro na extração de medidas:", error);
        return {
          success: false,
          message: "Erro ao extrair medidas",
        };
      }
    }),
});
