import { describe, it, expect, beforeAll } from "vitest";
import { visionRecognitionService } from "../lib/vision-recognition-service";

describe("TeachableMachine Vision Recognition", () => {
  beforeAll(async () => {
    // Inicializar serviço
    await visionRecognitionService.initialize();
  });

  it("deve carregar modelo com sucesso", async () => {
    const labels = visionRecognitionService.getLabels();
    expect(labels).toBeDefined();
    expect(labels.length).toBeGreaterThan(0);
    console.log("Classes disponíveis:", labels);
  });

  it("deve ter 10 classes treinadas", () => {
    const labels = visionRecognitionService.getLabels();
    expect(labels.length).toBe(10);
  });

  it("deve conter classes de perfis reais", () => {
    const labels = visionRecognitionService.getLabels();
    const expectedClasses = ["AL-225", "CG-300", "VZ-080VT", "SA-005"];
    
    expectedClasses.forEach(className => {
      expect(labels).toContain(className);
    });
  });

  it("deve retornar resultado de reconhecimento", async () => {
    // Simular com imagem fictícia (em produção seria uma foto real)
    const result = await visionRecognitionService.recognizeImage("fake-image-uri");
    
    expect(result).toBeDefined();
    expect(result?.topPrediction).toBeDefined();
    expect(result?.topPrediction.className).toBeDefined();
    expect(result?.confidence).toBeGreaterThanOrEqual(0);
    expect(result?.confidence).toBeLessThanOrEqual(100);
  });

  it("deve retornar múltiplas predições", async () => {
    const result = await visionRecognitionService.recognizeImage("fake-image-uri");
    
    expect(result?.allPredictions).toBeDefined();
    expect(result?.allPredictions.length).toBeGreaterThan(0);
    expect(result?.allPredictions.length).toBeLessThanOrEqual(10);
  });

  it("deve ordenar predições por probabilidade", async () => {
    const result = await visionRecognitionService.recognizeImage("fake-image-uri");
    
    if (result && result.allPredictions.length > 1) {
      for (let i = 0; i < result.allPredictions.length - 1; i++) {
        expect(result.allPredictions[i].probability).toBeGreaterThanOrEqual(
          result.allPredictions[i + 1].probability
        );
      }
    }
  });

  it("deve ter timestamp no resultado", async () => {
    const result = await visionRecognitionService.recognizeImage("fake-image-uri");
    
    expect(result?.timestamp).toBeDefined();
    expect(result?.timestamp).toBeGreaterThan(0);
  });

  it("deve indicar match quando confiança > 60%", async () => {
    const result = await visionRecognitionService.recognizeImage("fake-image-uri");
    
    expect(result?.matched).toBeDefined();
    if (result && result.confidence > 60) {
      expect(result.matched).toBe(true);
    }
  });
});
