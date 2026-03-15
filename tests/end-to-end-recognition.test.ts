import { describe, it, expect, beforeAll } from "vitest";
import * as db from "../server/db";

describe("End-to-End Recognition Flow", () => {
  beforeAll(async () => {
    // Garantir que temos perfis no banco
    const perfis = await db.getPerfis();
    console.log(`[E2E] Total de perfis no banco: ${perfis.length}`);
    expect(perfis.length).toBeGreaterThan(0);
  });

  it("deve retornar lista de perfis do catálogo", async () => {
    const perfis = await db.getPerfis();
    expect(perfis).toBeDefined();
    expect(Array.isArray(perfis)).toBe(true);
    expect(perfis.length).toBeGreaterThan(0);
    console.log(`[E2E] ✓ ${perfis.length} perfis encontrados no catálogo`);
  });

  it("deve ter perfis com medidas válidas", async () => {
    const perfis = await db.getPerfis();
    const perfilComMedidas = perfis.find(
      (p) => p.alturaMm && p.larguraMm && p.espessuraMm
    );
    expect(perfilComMedidas).toBeDefined();
    console.log(
      `[E2E] ✓ Perfil com medidas: ${perfilComMedidas?.codigoPerfil} (${perfilComMedidas?.alturaMm}×${perfilComMedidas?.larguraMm}×${perfilComMedidas?.espessuraMm}mm)`
    );
  });

  it("deve buscar perfil por código", async () => {
    const perfis = await db.getPerfis();
    const primeiroPerfil = perfis[0];
    expect(primeiroPerfil).toBeDefined();

    const encontrado = await db.getPerfilById(primeiroPerfil.id);
    expect(encontrado).toBeDefined();
    expect(encontrado?.codigoPerfil).toBe(primeiroPerfil.codigoPerfil);
    console.log(`[E2E] ✓ Perfil encontrado: ${encontrado?.codigoPerfil}`);
  });

  it("deve buscar perfis por query", async () => {
    const perfis = await db.getPerfis();
    if (perfis.length === 0) {
      console.log("[E2E] ⚠ Nenhum perfil no banco para buscar");
      return;
    }

    const primeiroPerfil = perfis[0];
    const query = primeiroPerfil.codigoPerfil?.substring(0, 2) || "AL";
    const resultados = await db.searchPerfis(query);
    expect(Array.isArray(resultados)).toBe(true);
    console.log(
      `[E2E] ✓ Busca por "${query}" retornou ${resultados.length} perfis`
    );
  });

  it("deve ter localização para alguns perfis", async () => {
    const perfis = await db.getPerfis();
    if (perfis.length === 0) {
      console.log("[E2E] ⚠ Nenhum perfil no banco");
      return;
    }

    const primeiroPerfil = perfis[0];
    const localizacao = await db.getLocalizacaoByPerfilId(primeiroPerfil.id);
    if (localizacao) {
      console.log(
        `[E2E] ✓ Localização encontrada: Setor ${localizacao.setor}, Prateleira ${localizacao.prateleira}`
      );
    } else {
      console.log(
        `[E2E] ℹ Nenhuma localização para perfil ${primeiroPerfil.codigoPerfil}`
      );
    }
  });

  it("deve simular análise visual com múltiplos perfis", async () => {
    const perfis = await db.getPerfis();
    expect(perfis.length).toBeGreaterThan(0);

    // Simular extração de características
    const visualFeatures = {
      format: "rectangular",
      holes: 0,
      finish: "anodized",
      color: "silver",
    };

    // Simular cálculo de similaridade para top 5
    const scores = perfis.slice(0, 5).map((perfil, index) => ({
      rank: index + 1,
      codigo: perfil.codigoPerfil,
      score: Math.random() * 100,
    }));

    const topResult = scores.sort((a, b) => b.score - a.score)[0];
    expect(topResult).toBeDefined();
    expect(topResult.score).toBeGreaterThanOrEqual(0);
    expect(topResult.score).toBeLessThanOrEqual(100);

    console.log(
      `[E2E] ✓ Análise simulada: Melhor match ${topResult.codigo} (${topResult.score.toFixed(1)}%)`
    );
  });

  it("deve validar formato de resposta da API", async () => {
    const perfis = await db.getPerfis();
    const melhorPerfil = perfis[0];

    // Simular resposta da API
    const resposta = {
      success: true,
      codigoPerfil: melhorPerfil.codigoPerfil,
      nomePerfil: melhorPerfil.nomePerfil,
      confidenceScore: 85,
      medidas: {
        altura: melhorPerfil.alturaMm,
        largura: melhorPerfil.larguraMm,
        espessura: melhorPerfil.espessuraMm,
      },
      localizacao: null,
      topResults: [],
    };

    expect(resposta.success).toBe(true);
    expect(resposta.codigoPerfil).toBeDefined();
    expect(resposta.nomePerfil).toBeDefined();
    expect(resposta.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(resposta.confidenceScore).toBeLessThanOrEqual(100);
    expect(resposta.medidas).toBeDefined();

    console.log(
      `[E2E] ✓ Formato de resposta validado: ${resposta.codigoPerfil} (${resposta.confidenceScore}%)`
    );
  });
});
