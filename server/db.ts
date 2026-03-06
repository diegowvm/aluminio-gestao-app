import { eq, like, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, perfis, InsertPerfil, Perfil, localizacoes, InsertLocalizacao, Localizacao, catalogoTecnico, InsertCatalogoTecnico, CatalogoTecnico } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============= PERFIS =============

export async function createPerfil(data: InsertPerfil): Promise<Perfil | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(perfis).values(data);
    const id = (result as any)[0]?.insertId || (result as any).insertId;
    if (!id) return null;
    const created = await db.select().from(perfis).where(eq(perfis.id, id)).limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create perfil:", error);
    throw error;
  }
}

export async function getPerfis(): Promise<Perfil[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(perfis).orderBy(desc(perfis.criadoEm));
  } catch (error) {
    console.error("[Database] Failed to get perfis:", error);
    return [];
  }
}

export async function getPerfilById(id: number): Promise<Perfil | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(perfis).where(eq(perfis.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get perfil:", error);
    return null;
  }
}

export async function searchPerfis(query: string): Promise<Perfil[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const searchTerm = `%${query}%`;
    return await db
      .select()
      .from(perfis)
      .where(
        query.length > 0
          ? like(perfis.codigoPerfil, searchTerm) || like(perfis.nomePerfil, searchTerm)
          : undefined
      )
      .orderBy(desc(perfis.criadoEm));
  } catch (error) {
    console.error("[Database] Failed to search perfis:", error);
    return [];
  }
}

export async function updatePerfil(id: number, data: Partial<InsertPerfil>): Promise<Perfil | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(perfis).set(data).where(eq(perfis.id, id));
    return await getPerfilById(id);
  } catch (error) {
    console.error("[Database] Failed to update perfil:", error);
    throw error;
  }
}

export async function deletePerfil(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(perfis).where(eq(perfis.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete perfil:", error);
    throw error;
  }
}

// ============= LOCALIZACOES =============

export async function createLocalizacao(data: InsertLocalizacao): Promise<Localizacao | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(localizacoes).values(data);
    const id = (result as any)[0]?.insertId || (result as any).insertId;
    if (!id) return null;
    const created = await db.select().from(localizacoes).where(eq(localizacoes.id, id)).limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create localizacao:", error);
    throw error;
  }
}

export async function getLocalizacaoByPerfilId(perfilId: number): Promise<Localizacao | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(localizacoes)
      .where(eq(localizacoes.perfilId, perfilId))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get localizacao:", error);
    return null;
  }
}

export async function updateLocalizacao(id: number, data: Partial<InsertLocalizacao>): Promise<Localizacao | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(localizacoes).set(data).where(eq(localizacoes.id, id));
    const result = await db.select().from(localizacoes).where(eq(localizacoes.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to update localizacao:", error);
    throw error;
  }
}

// ============= CATALOGO TECNICO =============

export async function createCatalogoTecnico(data: InsertCatalogoTecnico): Promise<CatalogoTecnico | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(catalogoTecnico).values(data);
    const id = (result as any)[0]?.insertId || (result as any).insertId;
    if (!id) return null;
    const created = await db.select().from(catalogoTecnico).where(eq(catalogoTecnico.id, id)).limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create catalogo tecnico:", error);
    throw error;
  }
}

export async function getCatalogoTecnicoByPerfilId(perfilId: number): Promise<CatalogoTecnico | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(catalogoTecnico)
      .where(eq(catalogoTecnico.perfilId, perfilId))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get catalogo tecnico:", error);
    return null;
  }
}

export async function updateCatalogoTecnico(id: number, data: Partial<InsertCatalogoTecnico>): Promise<CatalogoTecnico | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(catalogoTecnico).set(data).where(eq(catalogoTecnico.id, id));
    const result = await db.select().from(catalogoTecnico).where(eq(catalogoTecnico.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to update catalogo tecnico:", error);
    throw error;
  }
}
