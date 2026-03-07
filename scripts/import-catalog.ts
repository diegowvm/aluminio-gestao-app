import * as db from "../server/db";
import type { InsertPerfil } from "../drizzle/schema";
import * as fs from "fs";
import * as path from "path";

const catalogPath = path.join(__dirname, "../data/perfis_catalogo.json");

interface CatalogoPerfil {
  codigo: string;
  nome: string;
  categoria: string;
  linha: string;
  largura_mm?: string | null;
  altura_mm?: string | null;
  espessura_mm?: string | null;
  observacoes?: string;
}

async function importCatalog() {
  try {
    console.log("📚 Iniciando importação do catálogo...");

    // Ler arquivo JSON
    const catalogData = JSON.parse(fs.readFileSync(catalogPath, "utf-8")) as CatalogoPerfil[];

    console.log(`📋 Encontrados ${catalogData.length} perfis`);

    let imported = 0;
    let skipped = 0;

    for (const perfil of catalogData) {
      try {
        // Verificar se perfil já existe
        const existing = await db.searchPerfis(perfil.codigo);
        if (existing.length > 0) {
          console.log(`⏭️  ${perfil.codigo} já existe, pulando...`);
          skipped++;
          continue;
        }

        // Criar novo perfil
        const newPerfil: InsertPerfil = {
          codigoPerfil: perfil.codigo,
          nomePerfil: perfil.nome,
          linha: perfil.categoria,
          alturaMm: perfil.altura_mm || undefined,
          larguraMm: perfil.largura_mm || undefined,
          espessuraMm: perfil.espessura_mm || undefined,
          observacoes: perfil.observacoes || `${perfil.categoria} - ${perfil.linha}`,
        };

        const created = await db.createPerfil(newPerfil);
        if (created) {
          console.log(`✓ ${perfil.codigo} - ${perfil.nome}`);
          imported++;
        }
      } catch (error) {
        console.error(`✗ Erro ao importar ${perfil.codigo}:`, error);
      }
    }

    console.log(`\n✅ Importação concluída!`);
    console.log(`  ✓ Importados: ${imported}`);
    console.log(`  ⏭️  Pulados: ${skipped}`);
  } catch (error) {
    console.error("❌ Erro na importação:", error);
    process.exit(1);
  }
}

importCatalog();
