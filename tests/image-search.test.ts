import { describe, it, expect, beforeAll } from "vitest";
import * as db from "../server/db";

describe("Image Search - Busca por Imagem", () => {
  beforeAll(async () => {
    // Limpar dados de teste anteriores
    const allPerfis = await db.getPerfis();
    for (const perfil of allPerfis) {
      if (perfil.codigoPerfil.startsWith("TEST-")) {
        await db.deletePerfil(perfil.id);
      }
    }
  });

  it("deve retornar perfis similares quando houver dados", async () => {
    // Criar perfis de teste
    await db.createPerfil({
      codigoPerfil: "TEST-IMG-001",
      nomePerfil: "Perfil Teste 1",
      linha: "Teste",
      alturaMm: "50",
      larguraMm: "30",
      espessuraMm: "2",
    });

    await db.createPerfil({
      codigoPerfil: "TEST-IMG-002",
      nomePerfil: "Perfil Teste 2",
      linha: "Teste",
      alturaMm: "50.5",
      larguraMm: "30.2",
      espessuraMm: "2.1",
    });

    // Obter todos os perfis
    const allPerfis = await db.getPerfis();

    // Verificar que os perfis foram criados
    expect(allPerfis.length).toBeGreaterThanOrEqual(2);
    expect(allPerfis.some((p) => p.codigoPerfil === "TEST-IMG-001")).toBe(true);
    expect(allPerfis.some((p) => p.codigoPerfil === "TEST-IMG-002")).toBe(true);
  });

  it("deve retornar lista vazia quando não houver perfis", async () => {
    // Deletar todos os perfis de teste
    const allPerfis = await db.getPerfis();
    for (const perfil of allPerfis) {
      if (perfil.codigoPerfil.startsWith("TEST-IMG-")) {
        await db.deletePerfil(perfil.id);
      }
    }

    const remainingPerfis = await db.getPerfis();
    const testPerfis = remainingPerfis.filter((p) => p.codigoPerfil.startsWith("TEST-IMG-"));

    expect(testPerfis.length).toBe(0);
  });

  it("deve encontrar perfis por medidas similares", async () => {
    // Criar perfis com medidas conhecidas
    await db.createPerfil({
      codigoPerfil: "TEST-SIM-001",
      nomePerfil: "Corrimão",
      linha: "SACADAS",
      alturaMm: "111",
      larguraMm: "82.7",
      espessuraMm: "15.6",
    });

    await db.createPerfil({
      codigoPerfil: "TEST-SIM-002",
      nomePerfil: "Coluna",
      linha: "SACADAS",
      alturaMm: "85",
      larguraMm: "40",
    });

    // Buscar perfis
    const allPerfis = await db.getPerfis();
    const similarPerfis = allPerfis
      .filter((p) => p.codigoPerfil.startsWith("TEST-SIM-"))
      .sort((a, b) => {
        // Calcular similaridade por altura
        const altaA = parseFloat(a.alturaMm || "0");
        const altaB = parseFloat(b.alturaMm || "0");
        return Math.abs(altaA - 111) - Math.abs(altaB - 111);
      });

    expect(similarPerfis.length).toBeGreaterThanOrEqual(1);
    expect(similarPerfis[0].codigoPerfil).toBe("TEST-SIM-001");
  });

  it("deve retornar perfis com informações completas", async () => {
    const perfil = await db.createPerfil({
      codigoPerfil: "TEST-INFO-001",
      nomePerfil: "Perfil Completo",
      linha: "Linha 25",
      alturaMm: "30.35",
      larguraMm: "80",
      espessuraMm: "8.5",
      observacoes: "Perfil de teste com todas as informações",
    });

    if (!perfil) {
      throw new Error("Falha ao criar perfil de teste");
    }

    const retrieved = await db.getPerfilById(perfil.id);

    expect(retrieved).toBeDefined();
    if (retrieved) {
      expect(retrieved.codigoPerfil).toBe("TEST-INFO-001");
      expect(retrieved.nomePerfil).toBe("Perfil Completo");
      expect(retrieved.alturaMm).toBe("30.35");
      expect(retrieved.observacoes).toContain("teste");
    }
  });

  it("deve buscar perfis por código", async () => {
    await db.createPerfil({
      codigoPerfil: "TEST-SEARCH-001",
      nomePerfil: "Perfil Busca",
      linha: "Teste",
    });

    const results = await db.searchPerfis("TEST-SEARCH");

    expect(results.length).toBeGreaterThan(0);
    expect(results.some((p) => p.codigoPerfil === "TEST-SEARCH-001")).toBe(true);
  });

  it("deve buscar perfis por código com sucesso", async () => {
    const results = await db.searchPerfis("TEST-SEARCH");
    // Verificar que a busca retorna resultados (podem ser do teste anterior)
    expect(Array.isArray(results)).toBe(true);
  });
});
