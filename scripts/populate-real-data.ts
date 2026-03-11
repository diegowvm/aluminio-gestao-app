import { getDb } from "../server/db";
import { perfis } from "../drizzle/schema";
import * as fs from "fs";
import * as path from "path";

const PROFILES_JSON = path.join(__dirname, "../data/real_catalog/profiles.json");

interface Profile {
  code: string;
  name: string;
  measurements: string;
  line: string;
  page: number;
}

interface CatalogData {
  total_profiles: number;
  total_pages: number;
  extraction_date: string;
  profiles: Profile[];
}

async function populateRealData() {
  try {
    console.log("🔄 Iniciando população de dados reais...\n");

    // 1. Ler arquivo JSON com perfis extraídos
    console.log("[1/4] Lendo dados extraídos do PDF...");
    const catalogData: CatalogData = JSON.parse(
      fs.readFileSync(PROFILES_JSON, "utf-8")
    );
    console.log(`✓ ${catalogData.total_profiles} perfis carregados\n`);

    // 2. Limpar dados fictícios do banco
    console.log("[2/4] Limpando dados de teste do banco...");
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(perfis).execute();
    console.log(`✓ Banco de dados limpo\n`);

    // 3. Popular com dados reais
    console.log("[3/4] Populando com 303 perfis reais...");
    let successCount = 0;
    let errorCount = 0;

    for (const profile of catalogData.profiles) {
      try {
        // Extrair medidas (formato: "85 x 40" ou "85.5 x 40.2")
        const measurementMatch = profile.measurements.match(
          /(\d+[.,]?\d*)\s*(?:x|X)\s*(\d+[.,]?\d*)/
        );

        const altura = measurementMatch ? parseFloat(measurementMatch[1]) : 0;
        const largura = measurementMatch ? parseFloat(measurementMatch[2]) : 0;

        await db.insert(perfis).values({
          codigoPerfil: profile.code,
          nomePerfil: profile.name || profile.code,
          linha: profile.line || "Padrão",
          alturaMm: altura.toString(),
          larguraMm: largura.toString(),
          espessuraMm: "0",
          imagemSecao: `/images/page_${String(profile.page).padStart(3, "0")}.png`,
          criadoEm: new Date(),
        });

        successCount++;
        if (successCount % 50 === 0) {
          console.log(`  ✓ ${successCount} perfis inseridos...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`  ✗ Erro ao inserir ${profile.code}:`, error);
      }
    }

    console.log(`✓ ${successCount} perfis inseridos com sucesso`);
    if (errorCount > 0) {
      console.log(`⚠ ${errorCount} perfis com erro\n`);
    } else {
      console.log("");
    }

    // 4. Verificar dados inseridos
    console.log("[4/4] Verificando dados inseridos...");
    const allProfiles = await db.select().from(perfis).execute();
    console.log(`✓ Total de perfis no banco: ${allProfiles.length}\n`);

    console.log("============================================================");
    console.log("✅ POPULAÇÃO DE DADOS CONCLUÍDA COM SUCESSO");
    console.log("============================================================");
    console.log(`Total de perfis reais: ${successCount}`);
    console.log(`Data de extração: ${catalogData.extraction_date}`);
    console.log(`Primeiros 5 perfis:`);
    allProfiles.slice(0, 5).forEach((p: any) => {
      console.log(
        `  • ${p.codigoPerfil}: ${p.nomePerfil} (${p.alturaMm}x${p.larguraMm}mm)`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro durante população de dados:", error);
    process.exit(1);
  }
}

populateRealData();
