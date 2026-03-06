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
