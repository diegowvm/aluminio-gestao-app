import { describe, it, expect, beforeAll } from "vitest";
import * as dbTraining from "../server/db-training";

describe("Training System", () => {
  it("should add training data", async () => {
    const result = await dbTraining.addTrainingData({
      perfilId: 1,
      imagemUri: "s3://bucket/training/img1.jpg",
      classe: "AL-225",
      angulo: "frontal",
      iluminacao: "natural",
      qualidade: 95,
      notas: "Imagem de treinamento teste",
    });

    expect(result).toBeDefined();
  });

  it("should add model feedback", async () => {
    const result = await dbTraining.addModelFeedback({
      analiseId: 1,
      perfilReconhecidoId: 1,
      perfilRealId: 1,
      confiancaAnterior: 85,
      correto: true,
      imagemUri: "s3://bucket/analysis/img1.jpg",
      notas: "Reconhecimento correto",
    });

    expect(result).toBeDefined();
  });

  it("should add analysis to history", async () => {
    const result = await dbTraining.addAnaliseHistorico({
      imagemUri: "s3://bucket/analysis/img2.jpg",
      perfilReconhecidoId: 2,
      perfilRealId: 2,
      confianca: 92,
      acertou: true,
      tempoProcessamento: 250,
      modeloVersao: "v1.0",
    });

    expect(result).toBeDefined();
  });

  it("should get analysis history", async () => {
    const result = await dbTraining.getAnaliseHistorico(10, 0);

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get accuracy stats", async () => {
    const result = await dbTraining.getAcuraciaStats();

    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("acertos");
    expect(result).toHaveProperty("acuraciaMedia");
    expect(result).toHaveProperty("porPerfil");
  });

  it("should get training data stats", async () => {
    const result = await dbTraining.getTrainingDataStats();

    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("porClasse");
  });

  it("should add model version", async () => {
    const result = await dbTraining.addModeloVersao({
      versao: "v1.1",
      modelUrl: "s3://bucket/models/v1.1/model.json",
      weightsUrl: "s3://bucket/models/v1.1/weights.bin",
      metadataUrl: "s3://bucket/models/v1.1/metadata.json",
      acuraciaMedia: 92.5,
      totalClasses: 10,
      totalImagensTreinamento: 500,
      notas: "Versão melhorada com 500 imagens",
    });

    expect(result).toBeDefined();
  });

  it("should get active model version", async () => {
    const result = await dbTraining.getModeloVersaoAtiva();

    if (result) {
      expect(result).toHaveProperty("versao");
      expect(result.ativa).toBe(true);
    }
  });

  it("should export training data as CSV", async () => {
    const result = await dbTraining.exportTrainingDataAsCSV();

    expect(typeof result).toBe("string");
    expect(result).toContain("id,perfilId,classe");
  });

  it("should export feedback as CSV", async () => {
    const result = await dbTraining.exportFeedbackAsCSV();

    expect(typeof result).toBe("string");
    expect(result).toContain("id,analiseId");
  });
});
