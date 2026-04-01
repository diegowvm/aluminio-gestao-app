import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { visionRecognitionRouter } from "./routers/vision-recognition";
import { visionRecognitionLLMRouter } from "./routers/vision-recognition-llm";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Perfis de Alumínio
  perfis: router({
    list: publicProcedure.query(() => db.getPerfis()),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getPerfilById(input.id)),

    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(({ input }) => db.searchPerfis(input.query)),

    create: publicProcedure
      .input(
        z.object({
          codigoPerfil: z.string().min(1).max(50),
          nomePerfil: z.string().min(1).max(100),
          linha: z.string().max(50).optional(),
          alturaMm: z.string().optional(),
          larguraMm: z.string().optional(),
          espessuraMm: z.string().optional(),
          imagemSecao: z.string().optional(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(({ input }) => db.createPerfil(input)),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          codigoPerfil: z.string().min(1).max(50).optional(),
          nomePerfil: z.string().min(1).max(100).optional(),
          linha: z.string().max(50).optional(),
          alturaMm: z.string().optional(),
          larguraMm: z.string().optional(),
          espessuraMm: z.string().optional(),
          imagemSecao: z.string().optional(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updatePerfil(id, data);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deletePerfil(input.id)),
  }),

  // Localizações no Estoque
  localizacoes: router({
    getByPerfilId: publicProcedure
      .input(z.object({ perfilId: z.number() }))
      .query(({ input }) => db.getLocalizacaoByPerfilId(input.perfilId)),

    create: publicProcedure
      .input(
        z.object({
          perfilId: z.number(),
          setor: z.string().min(1).max(10),
          prateleira: z.number().int().min(1),
          gaveta: z.number().int().min(1),
          observacoes: z.string().optional(),
        })
      )
      .mutation(({ input }) => db.createLocalizacao(input)),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          setor: z.string().min(1).max(10).optional(),
          prateleira: z.number().int().min(1).optional(),
          gaveta: z.number().int().min(1).optional(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateLocalizacao(id, data);
      }),
  }),

  // Busca por Imagem
  imageSearch: router({
    searchByImage: publicProcedure
      .input(
        z.object({
          imageBase64: z.string(),
          limit: z.number().int().positive().default(5),
        })
      )
      .query(async ({ input }) => {
        try {
          const allPerfis = await db.getPerfis();
          if (allPerfis.length === 0) {
            return {
              results: [],
              message: "Nenhum perfil encontrado",
            };
          }
          // Retornar os primeiros perfis como similares
          return {
            results: allPerfis.slice(0, input.limit),
            totalMatches: Math.min(input.limit, allPerfis.length),
          };
        } catch (error) {
          console.error("Erro na busca por imagem:", error);
          throw new Error("Falha ao buscar perfis similares");
        }
      }),
  }),

  // Catálogo Técnico
  catalogoTecnico: router({
    getByPerfilId: publicProcedure
      .input(z.object({ perfilId: z.number() }))
      .query(({ input }) => db.getCatalogoTecnicoByPerfilId(input.perfilId)),

    create: publicProcedure
      .input(
        z.object({
          perfilId: z.number(),
          pdfOrigem: z.string().optional(),
          medidasCompletas: z.string().optional(),
          desenhoTecnico: z.string().optional(),
        })
      )
      .mutation(({ input }) => db.createCatalogoTecnico(input)),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          pdfOrigem: z.string().optional(),
          medidasCompletas: z.string().optional(),
          desenhoTecnico: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateCatalogoTecnico(id, data);
      }),
  }),

  // Vision Recognition - Reconhecimento visual profundo com busca exata
  visionRecognition: visionRecognitionRouter,

  // Vision Recognition com LLM - Reconhecimento visual com LLM Multimodal
  visionRecognitionLLM: visionRecognitionLLMRouter,
});

export type AppRouter = typeof appRouter;

/**
 * Função auxiliar para obter localização de um perfil
 */
export async function getLocalizacaoByPerfilId(perfilId: number) {
  try {
    return await db.getLocalizacaoByPerfilId(perfilId);
  } catch {
    return null;
  }
}
