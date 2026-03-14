import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  addTrainingData,
  addModelFeedback,
  addAnaliseHistorico,
  getAnaliseHistorico,
  getAcuraciaStats,
  getTrainingDataByPerfil,
  getTrainingDataStats,
  addModeloVersao,
  getModeloVersaoAtiva,
  getModeloVersoes,
  exportTrainingDataAsCSV,
  exportFeedbackAsCSV,
} from "../db-training";

export const trainingRouter = router({
  /**
   * Adicionar dados de treinamento
   */
  addTrainingData: publicProcedure
    .input(
      z.object({
        perfilId: z.number(),
        imagemUri: z.string(),
        classe: z.string(),
        angulo: z.string().optional(),
        iluminacao: z.string().optional(),
        qualidade: z.number().optional(),
        notas: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      return await addTrainingData(input);
    }),

  /**
   * Registrar feedback de análise
   */
  addFeedback: publicProcedure
    .input(
      z.object({
        analiseId: z.number(),
        perfilReconhecidoId: z.number().optional(),
        perfilRealId: z.number(),
        confiancaAnterior: z.number().optional(),
        correto: z.boolean(),
        imagemUri: z.string().optional(),
        notas: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      return await addModelFeedback(input);
    }),

  /**
   * Registrar análise no histórico
   */
  addAnalise: publicProcedure
    .input(
      z.object({
        imagemUri: z.string(),
        perfilReconhecidoId: z.number().optional(),
        perfilRealId: z.number().optional(),
        confianca: z.number(),
        acertou: z.boolean().optional(),
        tempoProcessamento: z.number().optional(),
        modeloVersao: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      return await addAnaliseHistorico(input);
    }),

  /**
   * Obter histórico de análises
   */
  getHistorico: publicProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }: any) => {
      return await getAnaliseHistorico(input.limit, input.offset);
    }),

  /**
   * Obter estatísticas de acurácia
   */
  getAcuraciaStats: publicProcedure.query(async () => {
    return await getAcuraciaStats();
  }),

  /**
   * Obter dados de treinamento por perfil
   */
  getTrainingDataByPerfil: publicProcedure
    .input(z.object({ perfilId: z.number() }))
    .query(async ({ input }: any) => {
      return await getTrainingDataByPerfil(input.perfilId);
    }),

  /**
   * Obter estatísticas de dados de treinamento
   */
  getTrainingStats: publicProcedure.query(async () => {
    return await getTrainingDataStats();
  }),

  /**
   * Registrar nova versão do modelo
   */
  addModelVersion: publicProcedure
    .input(
      z.object({
        versao: z.string(),
        modelUrl: z.string(),
        weightsUrl: z.string(),
        metadataUrl: z.string(),
        acuraciaMedia: z.number().optional(),
        totalClasses: z.number().optional(),
        totalImagensTreinamento: z.number().optional(),
        notas: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      return await addModeloVersao(input);
    }),

  /**
   * Obter versão ativa do modelo
   */
  getActiveModelVersion: publicProcedure.query(async () => {
    return await getModeloVersaoAtiva();
  }),

  /**
   * Obter histórico de versões do modelo
   */
  getModelVersions: publicProcedure.query(async () => {
    return await getModeloVersoes();
  }),

  /**
   * Exportar dados de treinamento como CSV
   */
  exportTrainingDataCSV: publicProcedure.query(async () => {
    return await exportTrainingDataAsCSV();
  }),

  /**
   * Exportar feedback como CSV
   */
  exportFeedbackCSV: publicProcedure.query(async () => {
    return await exportFeedbackAsCSV();
  }),
});
