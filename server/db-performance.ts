import { getDb } from "./db";
import { confusionMatrix, metricasPorClasse, historicoDesempenho, analiseHistorico, perfis } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Adicionar entrada na matriz de confusão
 */
export async function addConfusionMatrixEntry(
  modeloVersaoId: number,
  perfilRealId: number,
  perfilPredId: number
) {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await db
    .select()
    .from(confusionMatrix)
    .where(
      eq(confusionMatrix.modeloVersaoId, modeloVersaoId) &&
      eq(confusionMatrix.perfilRealId, perfilRealId) &&
      eq(confusionMatrix.perfilPredId, perfilPredId)
    )
    .limit(1);

  if (existing.length > 0) {
    return await db
      .update(confusionMatrix)
      .set({ quantidade: existing[0].quantidade + 1 })
      .where(eq(confusionMatrix.id, existing[0].id));
  } else {
    return await db.insert(confusionMatrix).values({
      modeloVersaoId,
      perfilRealId,
      perfilPredId,
      quantidade: 1,
    });
  }
}

/**
 * Obter matriz de confusão completa para uma versão do modelo
 */
export async function getConfusionMatrix(modeloVersaoId: number) {
  const db = await getDb();
  if (!db) return { classArray: [], matrixData: {} };
  
  const matrix = await db
    .select()
    .from(confusionMatrix)
    .where(eq(confusionMatrix.modeloVersaoId, modeloVersaoId));

  // Transformar em formato de matriz
  const classes = new Set<number>();
  matrix.forEach((entry) => {
    classes.add(entry.perfilRealId);
    classes.add(entry.perfilPredId);
  });

  const classArray = Array.from(classes).sort((a, b) => a - b);
  const matrixData: Record<number, Record<number, number>> = {};

  classArray.forEach((classId) => {
    matrixData[classId] = {};
    classArray.forEach((predId) => {
      const entry = matrix.find(
        (m) => m.perfilRealId === classId && m.perfilPredId === predId
      );
      matrixData[classId][predId] = entry?.quantidade || 0;
    });
  });

  return { classArray, matrixData };
}

/**
 * Calcular e salvar métricas por classe
 */
export async function calculateAndSaveMetricasPorClasse(
  modeloVersaoId: number,
  perfilId: number
) {
  const db = await getDb();
  if (!db) return null;
  
  // Buscar dados de análise para este perfil
  const analises = await db
    .select()
    .from(analiseHistorico)
    .where(eq(analiseHistorico.perfilRealId, perfilId));

  if (analises.length === 0) {
    return null;
  }

  // Calcular métricas
  const acertos = analises.filter((a) => a.acertou === true).length;
  const totalAnalises = analises.length;
  
  // Precision = acertos / total de predições para esta classe
  const precision = (acertos / totalAnalises) * 100;
  
  // Recall = acertos / total de análises reais desta classe
  const recall = (acertos / totalAnalises) * 100;
  
  // F1-Score = 2 * (precision * recall) / (precision + recall)
  const f1Score = precision === 0 && recall === 0 
    ? 0 
    : (2 * (precision * recall)) / (precision + recall);

  // Salvar ou atualizar
  const existing = await db
    .select()
    .from(metricasPorClasse)
    .where(
      eq(metricasPorClasse.modeloVersaoId, modeloVersaoId) &&
      eq(metricasPorClasse.perfilId, perfilId)
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(metricasPorClasse)
      .set({
        precision: precision.toString(),
        recall: recall.toString(),
        f1Score: f1Score.toString(),
        suporte: totalAnalises,
      })
      .where(eq(metricasPorClasse.id, existing[0].id));
  } else {
    await db.insert(metricasPorClasse).values({
      modeloVersaoId,
      perfilId,
      precision: precision.toString(),
      recall: recall.toString(),
      f1Score: f1Score.toString(),
      suporte: totalAnalises,
    });
  }

  return { precision, recall, f1Score, suporte: totalAnalises };
}

/**
 * Obter todas as métricas por classe para uma versão
 */
export async function getMetricasPorClasse(modeloVersaoId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const metricas = await db
    .select({
      id: metricasPorClasse.id,
      perfilId: metricasPorClasse.perfilId,
      codigoPerfil: perfis.codigoPerfil,
      nomePerfil: perfis.nomePerfil,
      precision: metricasPorClasse.precision,
      recall: metricasPorClasse.recall,
      f1Score: metricasPorClasse.f1Score,
      suporte: metricasPorClasse.suporte,
    })
    .from(metricasPorClasse)
    .leftJoin(perfis, eq(metricasPorClasse.perfilId, perfis.id))
    .where(eq(metricasPorClasse.modeloVersaoId, modeloVersaoId));

  return metricas;
}

/**
 * Adicionar entrada no histórico de desempenho
 */
export async function addHistoricoDesempenho(
  modeloVersaoId: number,
  acuraciaMedia: number,
  totalAnalises: number,
  acertos: number,
  erros: number,
  tempoMedioProcessamento: number,
  notas?: string
) {
  const db = await getDb();
  if (!db) return null;
  
  return await db.insert(historicoDesempenho).values({
    modeloVersaoId,
    acuraciaMedia: acuraciaMedia.toString(),
    totalAnalises,
    acertos,
    erros,
    tempoMedioProcessamento,
    notas,
  });
}

/**
 * Obter histórico de desempenho para uma versão
 */
export async function getHistoricoDesempenho(
  modeloVersaoId: number,
  limit: number = 100,
  offset: number = 0
) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(historicoDesempenho)
    .where(eq(historicoDesempenho.modeloVersaoId, modeloVersaoId))
    .orderBy(desc(historicoDesempenho.dataAnalise))
    .limit(limit)
    .offset(offset);
}

/**
 * Calcular estatísticas gerais de desempenho
 */
export async function getDesempenhoGeral(modeloVersaoId: number) {
  const db = await getDb();
  if (!db) return { totalAnalises: 0, acertos: 0, erros: 0, acuraciaMedia: 0, tempoMedioProcessamento: 0 };
  
  const analises = await db
    .select()
    .from(analiseHistorico);

  if (analises.length === 0) {
    return {
      totalAnalises: 0,
      acertos: 0,
      erros: 0,
      acuraciaMedia: 0,
      tempoMedioProcessamento: 0,
    };
  }

  const acertos = analises.filter((a) => a.acertou === true).length;
  const erros = analises.length - acertos;
  const acuraciaMedia = (acertos / analises.length) * 100;
  const tempoMedioProcessamento = Math.round(
    analises.reduce((sum, a) => sum + (a.tempoProcessamento || 0), 0) / analises.length
  );

  return {
    totalAnalises: analises.length,
    acertos,
    erros,
    acuraciaMedia,
    tempoMedioProcessamento,
  };
}

/**
 * Obter dados para gráfico de acurácia ao longo do tempo
 */
export async function getAcuraciaTimeSeries(
  modeloVersaoId: number,
  dias: number = 30
) {
  const db = await getDb();
  if (!db) return [];
  
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - dias);

  const historico = await db
    .select()
    .from(historicoDesempenho)
    .where(
      eq(historicoDesempenho.modeloVersaoId, modeloVersaoId)
    )
    .orderBy(desc(historicoDesempenho.dataAnalise));

  return historico.map((h) => ({
    data: h.dataAnalise,
    acuracia: parseFloat(h.acuraciaMedia.toString()),
    totalAnalises: h.totalAnalises,
    acertos: h.acertos,
  }));
}

/**
 * Comparar performance entre versões
 */
export async function compararVersoes(
  modeloVersaoId1: number,
  modeloVersaoId2: number
) {
  const db = await getDb();
  if (!db) return null;
  
  const historico1 = await db
    .select()
    .from(historicoDesempenho)
    .where(eq(historicoDesempenho.modeloVersaoId, modeloVersaoId1))
    .orderBy(desc(historicoDesempenho.dataAnalise))
    .limit(1);

  const historico2 = await db
    .select()
    .from(historicoDesempenho)
    .where(eq(historicoDesempenho.modeloVersaoId, modeloVersaoId2))
    .orderBy(desc(historicoDesempenho.dataAnalise))
    .limit(1);

  if (historico1.length === 0 || historico2.length === 0) {
    return null;
  }

  const h1 = historico1[0];
  const h2 = historico2[0];

  return {
    versao1: {
      acuracia: parseFloat(h1.acuraciaMedia.toString()),
      acertos: h1.acertos,
      totalAnalises: h1.totalAnalises,
    },
    versao2: {
      acuracia: parseFloat(h2.acuraciaMedia.toString()),
      acertos: h2.acertos,
      totalAnalises: h2.totalAnalises,
    },
    melhoria: parseFloat(h2.acuraciaMedia.toString()) - parseFloat(h1.acuraciaMedia.toString()),
  };
}
