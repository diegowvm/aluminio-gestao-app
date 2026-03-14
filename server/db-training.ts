import { getDb } from "./db";
import { trainingData, modelFeedback, analiseHistorico, modeloVersoes, perfis } from "../drizzle/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

/**
 * Adicionar dados de treinamento (imagem + classe)
 */
export async function addTrainingData(data: {
  perfilId: number;
  imagemUri: string;
  classe: string;
  angulo?: string;
  iluminacao?: string;
  qualidade?: number;
  notas?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const result = await db.insert(trainingData).values({
    perfilId: data.perfilId,
    imagemUri: data.imagemUri,
    classe: data.classe,
    angulo: data.angulo,
    iluminacao: data.iluminacao,
    qualidade: data.qualidade,
    notas: data.notas,
  });

  return result;
}

/**
 * Registrar feedback do usuário sobre análise
 */
export async function addModelFeedback(data: {
  analiseId: number;
  perfilReconhecidoId?: number;
  perfilRealId: number;
  confiancaAnterior?: number;
  correto: boolean;
  imagemUri?: string;
  notas?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const result = await db.insert(modelFeedback).values({
    analiseId: data.analiseId,
    perfilReconhecidoId: data.perfilReconhecidoId,
    perfilRealId: data.perfilRealId,
    confiancaAnterior: data.confiancaAnterior,
    correto: data.correto,
    imagemUri: data.imagemUri,
    notas: data.notas,
  });

  return result;
}

/**
 * Registrar análise no histórico
 */
export async function addAnaliseHistorico(data: {
  imagemUri: string;
  perfilReconhecidoId?: number;
  perfilRealId?: number;
  confianca: number;
  acertou?: boolean;
  tempoProcessamento?: number;
  modeloVersao?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const result = await db.insert(analiseHistorico).values({
    imagemUri: data.imagemUri,
    perfilReconhecidoId: data.perfilReconhecidoId,
    perfilRealId: data.perfilRealId,
    confianca: data.confianca,
    acertou: data.acertou,
    tempoProcessamento: data.tempoProcessamento,
    modeloVersao: data.modeloVersao || "v1.0",
  });

  return result;
}

/**
 * Obter histórico de análises
 */
export async function getAnaliseHistorico(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const result = await db
    .select()
    .from(analiseHistorico)
    .orderBy(desc(analiseHistorico.criadoEm))
    .limit(limit)
    .offset(offset);

  return result;
}

/**
 * Obter estatísticas de acurácia
 */
export async function getAcuraciaStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const historico = await db.select().from(analiseHistorico);

  const total = historico.length;
  const acertos = historico.filter((h) => h.acertou === true).length;
  const acuraciaMedia = total > 0 ? Math.round((acertos / total) * 100) : 0;

  // Agrupar por perfil
  const porPerfil: Record<string, { total: number; acertos: number; acuracia: number }> = {};

  for (const h of historico as typeof analiseHistorico.$inferSelect[]) {
    const perfilId = h.perfilReconhecidoId?.toString() || "desconhecido";
    if (!porPerfil[perfilId]) {
      porPerfil[perfilId] = { total: 0, acertos: 0, acuracia: 0 };
    }
    porPerfil[perfilId].total++;
    if (h.acertou) porPerfil[perfilId].acertos++;
    porPerfil[perfilId].acuracia = Math.round((porPerfil[perfilId].acertos / porPerfil[perfilId].total) * 100);
  }

  return {
    total,
    acertos,
    acuraciaMedia,
    porPerfil,
  };
}

/**
 * Obter dados de treinamento por perfil
 */
export async function getTrainingDataByPerfil(perfilId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const result = await db.select().from(trainingData).where(eq(trainingData.perfilId, perfilId));

  return result;
}

/**
 * Obter total de imagens de treinamento por classe
 */
export async function getTrainingDataStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const data = await db.select().from(trainingData);

  const porClasse: Record<string, number> = {};
  for (const item of data) {
    porClasse[item.classe] = (porClasse[item.classe] || 0) + 1;
  }

  return {
    total: data.length,
    porClasse,
  };
}

/**
 * Registrar nova versão do modelo
 */
export async function addModeloVersao(data: {
  versao: string;
  modelUrl: string;
  weightsUrl: string;
  metadataUrl: string;
  acuraciaMedia?: number;
  totalClasses?: number;
  totalImagensTreinamento?: number;
  notas?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  // Desativar versão anterior
  await db.update(modeloVersoes).set({ ativa: false });

  // Adicionar nova versão como ativa
  const result = await db.insert(modeloVersoes).values({
    versao: data.versao,
    modelUrl: data.modelUrl,
    weightsUrl: data.weightsUrl,
    metadataUrl: data.metadataUrl,
    acuraciaMedia: data.acuraciaMedia ? data.acuraciaMedia.toString() : undefined,
    totalClasses: data.totalClasses,
    totalImagensTreinamento: data.totalImagensTreinamento,
    notas: data.notas,
    ativa: true,
  });

  return result;
}

/**
 * Obter versão ativa do modelo
 */
export async function getModeloVersaoAtiva() {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const result = await db.select().from(modeloVersoes).where(eq(modeloVersoes.ativa, true)).limit(1);

  return result[0] || null;
}

/**
 * Obter histórico de versões do modelo
 */
export async function getModeloVersoes() {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const result = await db.select().from(modeloVersoes).orderBy(desc(modeloVersoes.criadoEm));

  return result;
}

/**
 * Exportar dados de treinamento em formato CSV
 */
export async function exportTrainingDataAsCSV() {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const data = await db.select().from(trainingData);

  let csv = "id,perfilId,classe,angulo,iluminacao,qualidade,notas,criadoEm\n";

  for (const row of data) {
    csv += `${row.id},"${row.perfilId}","${row.classe}","${row.angulo || ""}","${row.iluminacao || ""}","${row.qualidade || ""}","${(row.notas || "").replace(/"/g, '""')}","${row.criadoEm}"\n`;
  }

  return csv;
}

/**
 * Exportar feedback em formato CSV
 */
export async function exportFeedbackAsCSV() {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const data = await db.select().from(modelFeedback);

  let csv = "id,analiseId,perfilReconhecidoId,perfilRealId,confiancaAnterior,correto,notas,criadoEm\n";

  for (const row of data) {
    csv += `${row.id},"${row.analiseId}","${row.perfilReconhecidoId || ""}","${row.perfilRealId}","${row.confiancaAnterior || ""}","${row.correto}","${(row.notas || "").replace(/"/g, '""')}","${row.criadoEm}"\n`;
  }

  return csv;
}
