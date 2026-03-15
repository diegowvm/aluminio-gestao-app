import { describe, it, expect, beforeAll } from "vitest";
import * as dbPerf from "../server/db-performance";

describe("Performance Metrics", () => {
  const modeloVersaoId = 999; // Use ID que não existe para evitar conflitos

  it("should calculate confusion matrix", async () => {
    const matrix = await dbPerf.getConfusionMatrix(modeloVersaoId);
    expect(matrix).toBeDefined();
    expect(matrix.classArray).toBeDefined();
    expect(matrix.matrixData).toBeDefined();
  });

  it("should get metricas por classe", async () => {
    const metricas = await dbPerf.getMetricasPorClasse(modeloVersaoId);
    expect(Array.isArray(metricas)).toBe(true);
  });

  it("should get desempenho geral", async () => {
    const desempenho = await dbPerf.getDesempenhoGeral(modeloVersaoId);
    expect(desempenho).toBeDefined();
    expect(desempenho.totalAnalises).toBeGreaterThanOrEqual(0);
    expect(desempenho.acertos).toBeGreaterThanOrEqual(0);
    expect(desempenho.erros).toBeGreaterThanOrEqual(0);
  });

  it("should get acuracia time series", async () => {
    const timeSeries = await dbPerf.getAcuraciaTimeSeries(modeloVersaoId, 30);
    expect(Array.isArray(timeSeries)).toBe(true);
  });

  it("should get historico desempenho", async () => {
    const historico = await dbPerf.getHistoricoDesempenho(modeloVersaoId, 10, 0);
    expect(Array.isArray(historico)).toBe(true);
  });

  it("should add historico desempenho entry", async () => {
    const result = await dbPerf.addHistoricoDesempenho(
      modeloVersaoId,
      85.5,
      100,
      85,
      15,
      250,
      "Teste de performance"
    );
    expect(result).toBeDefined();
  });

  it("should compare versions", async () => {
    const comparison = await dbPerf.compararVersoes(1, 1);
    expect(comparison).toBeNull(); // Será null se não houver versão 1 e 1 diferentes
  });

  it("should handle null db gracefully", async () => {
    // Testes de null safety
    const matrix = await dbPerf.getConfusionMatrix(999);
    expect(matrix.classArray).toEqual([]);
    expect(matrix.matrixData).toEqual({});
  });
});
