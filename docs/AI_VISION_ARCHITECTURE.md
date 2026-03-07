# Arquitetura de Reconhecimento Visual com IA

## Visão Geral

Sistema avançado de reconhecimento visual que usa IA multimodal para identificar perfis de alumínio a partir de fotos capturadas por câmera ou upload. O sistema compara características visuais com um banco de dados do catálogo técnico.

## Componentes Principais

### 1. **Extração de Dados do Catálogo PDF**

**Localização:** `scripts/extract-catalog-smart.py`

**Funcionalidade:**
- Converte PDF em imagens (DPI: 150 para otimização)
- Comprime imagens em JPEG (qualidade: 75)
- Armazena em base64 para fácil transmissão
- Processa até 30 páginas para evitar sobrecarga

**Saída:** `data/catalog_pages.json`

```json
{
  "total_pages": 30,
  "pages": [
    {
      "page": 1,
      "image_base64": "...",
      "image_size": 45000,
      "description": "Página 1 do catálogo técnico"
    }
  ]
}
```

### 2. **API de Análise Visual (tRPC)**

**Localização:** `server/routers/ai-vision.ts`

**Endpoints:**

#### `aiVision.analyzeProfileImage`
- **Tipo:** Mutation
- **Input:** `imageBase64`, `includeMetadata`
- **Output:** Perfis similares com score de confiança

```typescript
// Uso
const result = await trpc.aiVision.analyzeProfileImage.mutate({
  imageBase64: imageData,
  includeMetadata: true
});
```

#### `aiVision.compareImages`
- **Tipo:** Mutation
- **Input:** `capturedImageBase64`, `catalogImageBase64`, `perfilId`
- **Output:** Score de similaridade e recomendações

#### `aiVision.extractMeasurements`
- **Tipo:** Query
- **Input:** `imageBase64`, `referenceObject` (opcional)
- **Output:** Medidas estimadas (altura, largura, espessura)

### 3. **Pipeline de Processamento**

```
┌─────────────────────────────────────────────────────────────┐
│                    Foto Capturada                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              1. Normalização de Imagem                       │
│  - Redimensionar para 800x600                               │
│  - Converter para RGB                                       │
│  - Aplicar filtros de contraste                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         2. Extração de Características Visuais               │
│  - Formato da seção transversal                             │
│  - Padrão de furos/ranhuras                                 │
│  - Acabamento (anodizado, natural, etc)                     │
│  - Dimensões estimadas                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│       3. Geração de Embedding Visual (IA Multimodal)        │
│  - Converte características em vetor numérico               │
│  - Representação comprimida da imagem                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│    4. Busca por Similaridade (Vector Search)                │
│  - Compara com embeddings do catálogo                       │
│  - Calcula distância euclidiana                             │
│  - Retorna top 5 resultados                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│      5. Validação de Medidas (Confirmação)                  │
│  - Compara medidas estimadas com catálogo                   │
│  - Calcula score de confiança final                         │
│  - Retorna localização no estoque                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Resultado Final com Score                      │
│  - Código do perfil                                         │
│  - Nome do modelo                                           │
│  - Medidas                                                  │
│  - Confiança (0-100%)                                       │
│  - Localização no estoque                                   │
└─────────────────────────────────────────────────────────────┘
```

### 4. **Interface de Usuário**

**Tela: `app/(tabs)/ai-analysis.tsx`**

**Funcionalidades:**
- Captura de foto com câmera
- Upload de imagem da galeria
- Campo de objeto de referência (para escala)
- Análise em tempo real com indicador de progresso
- Exibição de resultados com score de confiança
- Modal com detalhes completos do perfil
- Visualização de localização no estoque

**Fluxo:**
1. Usuário tira foto ou seleciona imagem
2. Clica em "Analisar com IA"
3. Sistema processa e retorna top 5 resultados
4. Usuário seleciona resultado para ver detalhes
5. Confirma identificação ou busca outro

## Banco de Dados

### Tabela: `perfis`
```sql
CREATE TABLE perfis (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo_perfil VARCHAR(50) UNIQUE NOT NULL,
  nome_perfil VARCHAR(100) NOT NULL,
  linha VARCHAR(50),
  altura_mm DECIMAL(10, 2),
  largura_mm DECIMAL(10, 2),
  espessura_mm DECIMAL(10, 2),
  imagem_secao LONGTEXT,  -- Base64 ou URL
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabela: `embeddings_visuais` (Futura)
```sql
CREATE TABLE embeddings_visuais (
  id INT PRIMARY KEY AUTO_INCREMENT,
  perfil_id INT NOT NULL,
  embedding LONGBLOB,  -- Vetor de características
  versao_modelo VARCHAR(50),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (perfil_id) REFERENCES perfis(id)
);
```

## Fluxo de Dados

### 1. Sincronização do Catálogo
```
PDF → Extração de Imagens → Base64 → JSON → Banco de Dados
```

### 2. Análise de Foto
```
Foto → Normalização → Características → Embedding → Busca → Resultado
```

### 3. Confirmação
```
Resultado → Validação de Medidas → Localização → Histórico
```

## Métricas de Confiança

### Score de Confiança (0-100%)

| Range | Significado | Ação |
|-------|-------------|------|
| 80-100% | Muito confiante | Confirmar automaticamente |
| 60-79% | Confiante | Revisar antes de confirmar |
| 40-59% | Moderado | Permitir ajuste manual |
| 0-39% | Baixo | Sugerir nova foto |

### Fatores que Afetam a Confiança

1. **Qualidade da Imagem** (30%)
   - Iluminação
   - Foco
   - Ângulo

2. **Similaridade Visual** (40%)
   - Formato da seção
   - Padrão de furos
   - Acabamento

3. **Validação de Medidas** (30%)
   - Altura
   - Largura
   - Espessura

## Otimizações

### Performance
- Imagens comprimidas em JPEG (qualidade 75)
- Redimensionamento para 800x600
- Cache de embeddings
- Índices de busca otimizados

### Precisão
- Múltiplos ângulos de captura
- Validação cruzada de medidas
- Feedback do usuário para treinamento
- Atualização periódica de embeddings

## Próximas Melhorias

1. **Treinamento de Modelo Customizado**
   - Fine-tuning com imagens reais do catálogo
   - Aprendizado com feedback do usuário

2. **Reconhecimento de Defeitos**
   - Detectar perfis danificados
   - Alertar sobre qualidade

3. **Histórico de Análises**
   - Rastrear identificações anteriores
   - Padrões de uso

4. **Integração com Estoque**
   - Atualizar quantidade automaticamente
   - Alertas de falta de estoque

## Exemplos de Uso

### Exemplo 1: Análise Básica
```typescript
const result = await trpc.aiVision.analyzeProfileImage.mutate({
  imageBase64: "data:image/jpeg;base64,...",
  includeMetadata: true
});

// Resultado
{
  success: true,
  results: [
    {
      id: 1,
      codigoPerfil: "SA-005",
      nomePerfil: "Vista Interna",
      confidence: 0.92,
      similarity_score: 0.92,
      alturaMm: "52.00",
      larguraMm: "32.00",
      espessuraMm: "8.00",
      localizacao: {
        setor: "A",
        prateleira: 2,
        gaveta: 3
      }
    }
  ]
}
```

### Exemplo 2: Extração de Medidas
```typescript
const measurements = await trpc.aiVision.extractMeasurements.query({
  imageBase64: "data:image/jpeg;base64,...",
  referenceObject: "moeda"
});

// Resultado
{
  success: true,
  measurements: {
    height_mm: 52,
    width_mm: 32,
    thickness_mm: 8,
    confidence: 0.85,
    notes: "Medidas estimadas com moeda como referência"
  }
}
```

## Troubleshooting

### Baixa Confiança
- Melhorar iluminação
- Capturar de frente
- Usar objeto de referência
- Tentar ângulo diferente

### Resultado Incorreto
- Verificar se o perfil está no catálogo
- Confirmar manualmente
- Reportar para melhoria do modelo

### Performance Lenta
- Reduzir qualidade da imagem
- Usar cache
- Verificar conexão de rede

## Referências

- [Documentação Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [tRPC Documentation](https://trpc.io/)
- [Vision AI Best Practices](https://cloud.google.com/vision/docs)
