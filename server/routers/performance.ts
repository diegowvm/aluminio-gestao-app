import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import * as dbPerf from "../db-performance";

export const performanceRouter = router({
  /**
   * Obter matriz de confusão para uma versão do modelo
   */
  getConfusionMatrix: publicProcedure
    .input(z.object({ modeloVersaoId: z.number() }))
    .query(async ({ input }) => {
      return await dbPerf.getConfusionMatrix(input.modeloVersaoId);
    }),

  /**
   * Obter todas as métricas por classe
   */
  getMetricasPorClasse: publicProcedure
    .input(z.object({ modeloVersaoId: z.number() }))
    .query(async ({ input }) => {
      return await dbPerf.getMetricasPorClasse(input.modeloVersaoId);
    }),

  /**
   * Obter histórico de desempenho
   */
  getHistoricoDesempenho: publicProcedure
    .input(
      z.object({
        modeloVersaoId: z.number(),
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return await dbPerf.getHistoricoDesempenho(
        input.modeloVersaoId,
        input.limit,
        input.offset
      );
    }),

  /**
   * Obter estatísticas gerais de desempenho
   */
  getDesempenhoGeral: publicProcedure
    .input(z.object({ modeloVersaoId: z.number() }))
    .query(async ({ input }) => {
      return await dbPerf.getDesempenhoGeral(input.modeloVersaoId);
    }),

  /**
   * Obter série temporal de acurácia
   */
  getAcuraciaTimeSeries: publicProcedure
    .input(
      z.object({
        modeloVersaoId: z.number(),
        dias: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      return await dbPerf.getAcuraciaTimeSeries(input.modeloVersaoId, input.dias);
    }),

  /**
   * Comparar performance entre versões
   */
  compararVersoes: publicProcedure
    .input(
      z.object({
        modeloVersaoId1: z.number(),
        modeloVersaoId2: z.number(),
      })
    )
    .query(async ({ input }) => {
      return await dbPerf.compararVersoes(
        input.modeloVersaoId1,
        input.modeloVersaoId2
      );
    }),

  /**
   * Adicionar entrada de histórico de desempenho
   */
  addHistoricoDesempenho: publicProcedure
    .input(
      z.object({
        modeloVersaoId: z.number(),
        acuraciaMedia: z.number(),
        totalAnalises: z.number(),
        acertos: z.number(),
        erros: z.number(),
        tempoMedioProcessamento: z.number(),
        notas: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await dbPerf.addHistoricoDesempenho(
        input.modeloVersaoId,
        input.acuraciaMedia,
        input.totalAnalises,
        input.acertos,
        input.erros,
        input.tempoMedioProcessamento,
        input.notas
      );
    }),
});
