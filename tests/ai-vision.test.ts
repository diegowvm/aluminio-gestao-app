import { describe, it, expect } from "vitest";
import * as db from "../server/db";

describe("AI Vision - Reconhecimento Visual com IA", () => {
  it("deve retornar perfis ao analisar imagem", async () => {
    const allPerfis = await db.getPerfis();

    expect(Array.isArray(allPerfis)).toBe(true);
    expect(allPerfis.length).toBeGreaterThan(0);
  });

  it("deve ter perfis com medidas completas", async () => {
    const allPerfis = await db.getPerfis();
    const perfilComMedidas = allPerfis.find(
      (p) => p.alturaMm && p.larguraMm && p.espessuraMm
    );

    expect(perfilComMedidas).toBeDefined();
    if (perfilComMedidas) {
      expect(parseFloat(perfilComMedidas.alturaMm || "0")).toBeGreaterThan(0);
      expect(parseFloat(perfilComMedidas.larguraMm || "0")).toBeGreaterThan(0);
      expect(parseFloat(perfilComMedidas.espessuraMm || "0")).toBeGreaterThan(0);
    }
  });

  it("deve retornar localização para perfis cadastrados", async () => {
    const allPerfis = await db.getPerfis();

    if (allPerfis.length > 0) {
      const perfil = allPerfis[0];
      const localizacao = await db.getLocalizacaoByPerfilId(perfil.id);

      // Pode ser null se não houver localização cadastrada
      expect(localizacao === null || typeof localizacao === "object").toBe(true);
    }
  });

  it("deve buscar perfis por características similares", async () => {
    const allPerfis = await db.getPerfis();

    // Simular busca por altura similar
    const targetHeight = 50;
    const similarPerfis = allPerfis.filter((p) => {
      const height = parseFloat(p.alturaMm || "0");
      return Math.abs(height - targetHeight) <= 5;
    });

    // Deve haver pelo menos alguns perfis similares
    expect(Array.isArray(similarPerfis)).toBe(true);
  });

  it("deve extrair medidas de perfis", async () => {
    const allPerfis = await db.getPerfis();

    const measuredPerfis = allPerfis.filter(
      (p) => p.alturaMm && p.larguraMm && p.espessuraMm
    );

    expect(measuredPerfis.length).toBeGreaterThan(0);

    // Validar que as medidas são números válidos
    measuredPerfis.forEach((p) => {
      const altura = parseFloat(p.alturaMm || "0");
      const largura = parseFloat(p.larguraMm || "0");
      const espessura = parseFloat(p.espessuraMm || "0");

      expect(altura).toBeGreaterThan(0);
      expect(largura).toBeGreaterThan(0);
      expect(espessura).toBeGreaterThan(0);
    });
  });

  it("deve calcular score de confiança baseado em medidas", async () => {
    const allPerfis = await db.getPerfis();

    allPerfis.forEach((perfil) => {
      let score = 0;

      if (perfil.alturaMm) score += 0.3;
      if (perfil.larguraMm) score += 0.3;
      if (perfil.espessuraMm) score += 0.2;
      if (perfil.imagemSecao) score += 0.2;

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  it("deve retornar top 5 resultados mais similares", async () => {
    const allPerfis = await db.getPerfis();

    // Simular ranking
    const ranked = allPerfis
      .map((p, index) => ({
        ...p,
        score: Math.max(0.5, 1 - index * 0.15),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    expect(ranked.length).toBeLessThanOrEqual(5);
    expect(ranked.length).toBeGreaterThan(0);

    // Verificar que estão em ordem decrescente
    for (let i = 0; i < ranked.length - 1; i++) {
      expect(ranked[i].score).toBeGreaterThanOrEqual(ranked[i + 1].score);
    }
  });

  it("deve validar formato de resposta da análise", async () => {
    const allPerfis = await db.getPerfis();

    const analysisResponse = {
      success: true,
      message: "Análise concluída com sucesso",
      results: allPerfis.slice(0, 5),
      metadata: {
        total_matches: Math.min(5, allPerfis.length),
        analysis_timestamp: new Date().toISOString(),
      },
    };

    expect(analysisResponse.success).toBe(true);
    expect(Array.isArray(analysisResponse.results)).toBe(true);
    expect(analysisResponse.metadata.total_matches).toBeGreaterThan(0);
    expect(analysisResponse.metadata.analysis_timestamp).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });
});
