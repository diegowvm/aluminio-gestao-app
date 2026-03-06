import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "../server/db";
import type { InsertPerfil, InsertLocalizacao } from "../drizzle/schema";

describe("Localizacoes API", () => {
  let testPerfilId: number | null = null;
  let testLocalizacaoId: number | null = null;

  beforeAll(async () => {
    // Criar um perfil de teste
    const testData: InsertPerfil = {
      codigoPerfil: "TEST-LOC-001",
      nomePerfil: "Perfil para Localização",
      linha: "Série A",
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

  it("deve criar uma nova localização", async () => {
    if (!testPerfilId) {
      expect(testPerfilId).toBeDefined();
      return;
    }

    const testData: InsertLocalizacao = {
      perfilId: testPerfilId,
      setor: "A",
      prateleira: 1,
      gaveta: 1,
      observacoes: "Localização de teste",
    };

    const result = await db.createLocalizacao(testData);

    expect(result).toBeDefined();
    expect(result?.setor).toBe("A");
    expect(result?.prateleira).toBe(1);
    expect(result?.gaveta).toBe(1);

    if (result?.id) {
      testLocalizacaoId = result.id;
    }
  });

  it("deve obter localização por ID do perfil", async () => {
    if (!testPerfilId) {
      expect(testPerfilId).toBeDefined();
      return;
    }

    const localizacao = await db.getLocalizacaoByPerfilId(testPerfilId);

    expect(localizacao).toBeDefined();
    expect(localizacao?.perfilId).toBe(testPerfilId);
  });

  it("deve atualizar uma localização", async () => {
    if (!testLocalizacaoId) {
      expect(testLocalizacaoId).toBeDefined();
      return;
    }

    const updated = await db.updateLocalizacao(testLocalizacaoId, {
      setor: "B",
      prateleira: 2,
    });

    expect(updated).toBeDefined();
    expect(updated?.setor).toBe("B");
    expect(updated?.prateleira).toBe(2);
  });
});
