import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de Perfis de Alumínio
 * Armazena informações técnicas dos perfis do catálogo
 */
export const perfis = mysqlTable("perfis", {
  id: int("id").autoincrement().primaryKey(),
  codigoPerfil: varchar("codigoPerfil", { length: 50 }).notNull().unique(),
  nomePerfil: varchar("nomePerfil", { length: 100 }).notNull(),
  linha: varchar("linha", { length: 50 }),
  alturaMm: decimal("alturaMm", { precision: 10, scale: 2 }),
  larguraMm: decimal("larguraMm", { precision: 10, scale: 2 }),
  espessuraMm: decimal("espessuraMm", { precision: 10, scale: 2 }),
  imagemSecao: varchar("imagemSecao", { length: 500 }), // URL da imagem armazenada em S3
  observacoes: text("observacoes"),
  criadoEm: timestamp("criadoEm").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizadoEm").defaultNow().onUpdateNow().notNull(),
});

export type Perfil = typeof perfis.$inferSelect;
export type InsertPerfil = typeof perfis.$inferInsert;

/**
 * Tabela de Localizações no Estoque
 * Armazena a localização física de cada perfil no estoque
 */
export const localizacoes = mysqlTable("localizacoes", {
  id: int("id").autoincrement().primaryKey(),
  perfilId: int("perfilId").notNull(),
  setor: varchar("setor", { length: 10 }).notNull(),
  prateleira: int("prateleira").notNull(),
  gaveta: int("gaveta").notNull(),
  observacoes: text("observacoes"),
  criadoEm: timestamp("criadoEm").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizadoEm").defaultNow().onUpdateNow().notNull(),
});

export type Localizacao = typeof localizacoes.$inferSelect;
export type InsertLocalizacao = typeof localizacoes.$inferInsert;

/**
 * Tabela de Catálogo Técnico
 * Armazena referências a documentos técnicos e PDFs dos perfis
 */
export const catalogoTecnico = mysqlTable("catalogoTecnico", {
  id: int("id").autoincrement().primaryKey(),
  perfilId: int("perfilId").notNull(),
  pdfOrigem: varchar("pdfOrigem", { length: 500 }), // URL do PDF original
  medidasCompletas: text("medidasCompletas"), // JSON com medidas detalhadas
  desenhoTecnico: varchar("desenhoTecnico", { length: 500 }), // URL do desenho técnico
  criadoEm: timestamp("criadoEm").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizadoEm").defaultNow().onUpdateNow().notNull(),
});

export type CatalogoTecnico = typeof catalogoTecnico.$inferSelect;
export type InsertCatalogoTecnico = typeof catalogoTecnico.$inferInsert;

/**
 * Tabela de Dados de Treinamento
 * Armazena imagens e dados para treinar e melhorar o modelo de IA
 */
export const trainingData = mysqlTable("trainingData", {
  id: int("id").autoincrement().primaryKey(),
  perfilId: int("perfilId").notNull(), // Perfil que a imagem representa
  imagemUri: varchar("imagemUri", { length: 500 }).notNull(), // URL da imagem em S3
  classe: varchar("classe", { length: 50 }).notNull(), // Código do perfil (ex: AL-225)
  angulo: varchar("angulo", { length: 50 }), // Ângulo da câmera (frontal, lateral, etc)
  iluminacao: varchar("iluminacao", { length: 50 }), // Condições de iluminação
  qualidade: int("qualidade"), // Score de qualidade 0-100
  notas: text("notas"), // Observações do usuário
  criadoEm: timestamp("criadoEm").defaultNow().notNull(),
});

export type TrainingData = typeof trainingData.$inferSelect;
export type InsertTrainingData = typeof trainingData.$inferInsert;

/**
 * Tabela de Feedback de Análises
 * Armazena validação do usuário sobre resultados de reconhecimento
 */
export const modelFeedback = mysqlTable("modelFeedback", {
  id: int("id").autoincrement().primaryKey(),
  analiseId: int("analiseId").notNull(), // ID da análise
  perfilReconhecidoId: int("perfilReconhecidoId"), // Perfil que a IA reconheceu
  perfilRealId: int("perfilRealId").notNull(), // Perfil correto (feedback do usuário)
  confiancaAnterior: int("confiancaAnterior"), // Score de confiança da IA (0-100)
  correto: boolean("correto").notNull(), // true se reconhecimento estava correto
  imagemUri: varchar("imagemUri", { length: 500 }), // URL da imagem analisada
  notas: text("notas"), // Observações do usuário
  criadoEm: timestamp("criadoEm").defaultNow().notNull(),
});

export type ModelFeedback = typeof modelFeedback.$inferSelect;
export type InsertModelFeedback = typeof modelFeedback.$inferInsert;

/**
 * Tabela de Histórico de Análises
 * Rastreia todas as análises de reconhecimento visual realizadas
 */
export const analiseHistorico = mysqlTable("analiseHistorico", {
  id: int("id").autoincrement().primaryKey(),
  imagemUri: varchar("imagemUri", { length: 500 }).notNull(), // URL da imagem analisada
  perfilReconhecidoId: int("perfilReconhecidoId"), // Perfil reconhecido pela IA
  perfilRealId: int("perfilRealId"), // Perfil real (se feedback foi dado)
  confianca: int("confianca").notNull(), // Score de confiança (0-100)
  acertou: boolean("acertou"), // true se reconhecimento estava correto
  tempoProcessamento: int("tempoProcessamento"), // Tempo em ms
  modeloVersao: varchar("modeloVersao", { length: 50 }), // Versão do modelo usado
  criadoEm: timestamp("criadoEm").defaultNow().notNull(),
});

export type AnaliseHistorico = typeof analiseHistorico.$inferSelect;
export type InsertAnaliseHistorico = typeof analiseHistorico.$inferInsert;

/**
 * Tabela de Versões de Modelos
 * Rastreia diferentes versões do modelo treinado
 */
export const modeloVersoes = mysqlTable("modeloVersoes", {
  id: int("id").autoincrement().primaryKey(),
  versao: varchar("versao", { length: 50 }).notNull().unique(), // ex: v1.0, v1.1
  modelUrl: varchar("modelUrl", { length: 500 }).notNull(), // URL do model.json
  weightsUrl: varchar("weightsUrl", { length: 500 }).notNull(), // URL do weights.bin
  metadataUrl: varchar("metadataUrl", { length: 500 }).notNull(), // URL do metadata.json
  acuraciaMedia: decimal("acuraciaMedia", { precision: 5, scale: 2 }), // Acurácia média (%)
  totalClasses: int("totalClasses"), // Número de classes
  totalImagensTreinamento: int("totalImagensTreinamento"), // Imagens usadas no treinamento
  notas: text("notas"), // Observações sobre a versão
  ativa: boolean("ativa").default(false).notNull(), // true se é a versão atual
  criadoEm: timestamp("criadoEm").defaultNow().notNull(),
});

export type ModeloVersao = typeof modeloVersoes.$inferSelect;
export type InsertModeloVersao = typeof modeloVersoes.$inferInsert;
