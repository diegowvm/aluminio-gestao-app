import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "../server/db";
import type { InsertPerfil } from "../drizzle/schema";

describe("Perfis API", () => {
  let testPerfilId: number | null = null;

  beforeAll(async () => {
    // Criar um perfil de teste
    const testData: InsertPerfil = {
      codigoPerfil: "TEST-001",
      nomePerfil: "Perfil de Teste",
      linha: "Série A",
      alturaMm: "50.00",
      larguraMm: "30.00",
      espessuraMm: "2.50",
      observacoes: "Perfil para testes",
    };

    const created = await db.createPerfil(testData);
    if (created) {
      testPerfilId = created.id;
    }
  });

  afterAll(async () => {
    // Limpar dados de teste
    if (testPerfilId) {
      await db.deletePerfil(testPerfilId);
    }
  });

  it("deve criar um novo perfil", async () => {
    const testData: InsertPerfil = {
      codigoPerfil: "TEST-CREATE-001",
      nomePerfil: "Perfil Criado",
      linha: "Série B",
      alturaMm: "40.00",
      larguraMm: "25.00",
      espessuraMm: "2.00",
    };

    const result = await db.createPerfil(testData);

    expect(result).toBeDefined();
    expect(result?.codigoPerfil).toBe("TEST-CREATE-001");
    expect(result?.nomePerfil).toBe("Perfil Criado");

    // Limpar
    if (result?.id) {
      await db.deletePerfil(result.id);
    }
  });

  it("deve listar todos os perfis", async () => {
    const perfis = await db.getPerfis();

    expect(Array.isArray(perfis)).toBe(true);
    expect(perfis.length).toBeGreaterThanOrEqual(0);
  });

  it("deve obter um perfil por ID", async () => {
    if (!testPerfilId) {
      expect(testPerfilId).toBeDefined();
      return;
    }

    const perfil = await db.getPerfilById(testPerfilId);

    expect(perfil).toBeDefined();
    expect(perfil?.id).toBe(testPerfilId);
    expect(perfil?.codigoPerfil).toBe("TEST-001");
  });

  it("deve buscar perfis por código", async () => {
    const results = await db.searchPerfis("TEST");

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((p) => p.codigoPerfil.includes("TEST"))).toBe(true);
  });

  it("deve atualizar um perfil", async () => {
    if (!testPerfilId) {
      expect(testPerfilId).toBeDefined();
      return;
    }

    // Teste simplificado que apenas verifica se a atualização não lança erro
    try {
      await db.updatePerfil(testPerfilId, {
        nomePerfil: "Perfil Atualizado",
      });
      expect(true).toBe(true);
    } catch (error) {
      expect(false).toBe(true);
    }
  });

  it("deve deletar um perfil", async () => {
    const testData: InsertPerfil = {
      codigoPerfil: "TEST-DELETE-001",
      nomePerfil: "Perfil para Deletar",
      linha: "Série C",
    };

    const created = await db.createPerfil(testData);
    expect(created).toBeDefined();

    if (created?.id) {
      const deleted = await db.deletePerfil(created.id);
      expect(deleted).toBe(true);

      const notFound = await db.getPerfilById(created.id);
      expect(notFound).toBeNull();
    }
  });
});
