# Design da Interface - Gestão de Perfis de Alumínio

## Visão Geral

Aplicativo móvel para gestão e identificação de perfis de alumínio em ambiente industrial. O design prioriza rapidez de uso, responsividade para celular e tablet, e navegação intuitiva com foco em um único propósito por tela.

**Plataformas:** iOS (SafeArea), Android (EdgeToEdge), Web (Responsivo)  
**Orientação:** Portrait (9:16)  
**Padrão:** Navegação por abas (Tab Bar) com 4 seções principais

---

## Paleta de Cores

| Elemento | Cor | Uso |
|----------|-----|-----|
| **Primary** | `#2563EB` (Azul Industrial) | Botões principais, destaques, ações |
| **Background** | `#FFFFFF` (Claro) / `#0F172A` (Escuro) | Fundo das telas |
| **Surface** | `#F8FAFC` (Claro) / `#1E293B` (Escuro) | Cards, superfícies elevadas |
| **Foreground** | `#0F172A` (Claro) / `#F1F5F9` (Escuro) | Texto principal |
| **Muted** | `#64748B` (Claro) / `#94A3B8` (Escuro) | Texto secundário |
| **Border** | `#E2E8F0` (Claro) / `#334155` (Escuro) | Divisores, bordas |
| **Success** | `#10B981` | Estados de sucesso |
| **Warning** | `#F59E0B` | Alertas, avisos |
| **Error** | `#EF4444` | Erros, validações |

---

## Arquitetura de Telas

### 1. Dashboard (Home)
**Rota:** `/(tabs)/index.tsx`  
**Propósito:** Visão geral do sistema, busca rápida e acesso às principais funcionalidades

**Conteúdo:**
- **Header:** Título "Gestão de Perfis", ícone de configurações
- **Estatísticas:** 
  - Total de perfis cadastrados (grande, destaque)
  - Setores com estoque
  - Últimos perfis adicionados
- **Busca Rápida:** Campo de entrada com ícone de lupa, busca por código ou nome
- **Ações Rápidas:** 4 botões em grid (2x2):
  - Novo Perfil (ícone +)
  - Buscar Perfil (ícone 🔍)
  - Localização (ícone 📍)
  - Configurações (ícone ⚙️)
- **Últimos Acessados:** Lista horizontal de 3-4 perfis recentes

**Componentes:**
- `StatCard` (exibe número + label)
- `QuickActionButton` (ícone + texto)
- `ProfilePreview` (card com código, nome, imagem pequena)

---

### 2. Cadastro de Perfil
**Rota:** `/(tabs)/register.tsx`  
**Propósito:** Adicionar novo perfil ao catálogo

**Conteúdo:**
- **Header:** "Novo Perfil" com botão voltar
- **Formulário em ScrollView:**
  - **Código do Perfil** (obrigatório)
    - Input text, máx 50 caracteres
    - Validação: não pode duplicar
  - **Nome do Perfil** (obrigatório)
    - Input text, máx 100 caracteres
  - **Linha** (opcional)
    - Input text, máx 50 caracteres
  - **Medidas:**
    - Altura (mm) - Input numérico
    - Largura (mm) - Input numérico
    - Espessura (mm) - Input numérico
  - **Upload de Desenho Técnico** (obrigatório)
    - Área de drop/tap para upload
    - Mostra preview da imagem
    - Formatos: JPG, PNG, PDF
  - **Observações** (opcional)
    - TextArea, máx 500 caracteres
- **Botões:**
  - "Salvar Perfil" (primário, azul)
  - "Cancelar" (secundário, cinza)

**Validações:**
- Código: obrigatório, único
- Nome: obrigatório
- Medidas: números positivos
- Desenho: arquivo válido, máx 10MB

---

### 3. Localização no Estoque
**Rota:** `/(tabs)/location.tsx`  
**Propósito:** Registrar e visualizar localização dos perfis no estoque

**Conteúdo:**
- **Header:** "Localização no Estoque"
- **Seleção de Perfil:**
  - Dropdown/Picker com lista de perfis
  - Ou busca por código
- **Formulário:**
  - **Setor** (obrigatório)
    - Picker/Select (A, B, C, D, etc.)
  - **Prateleira** (obrigatório)
    - Input numérico (1-20)
  - **Gaveta** (obrigatório)
    - Input numérico (1-10)
  - **Observações** (opcional)
    - TextArea (ex: "Próximo à janela", "Lado esquerdo")
- **Visualização:**
  - Card mostrando localização atual do perfil selecionado
  - Ícone de localização com endereço formatado
- **Botões:**
  - "Atualizar Localização" (primário)
  - "Limpar" (secundário)

---

### 4. Busca e Visualização
**Rota:** `/(tabs)/search.tsx`  
**Propósito:** Buscar perfis e visualizar detalhes completos

**Conteúdo:**
- **Header:** "Buscar Perfil"
- **Busca:**
  - Campo de entrada com ícone de lupa
  - Sugestões enquanto digita
  - Filtros: Por código / Por nome / Todos
- **Resultados:**
  - Lista (FlatList) de perfis encontrados
  - Cada item mostra:
    - Código (destaque)
    - Nome
    - Medidas resumidas (H×L×E)
    - Thumbnail do desenho
    - Localização (setor/prateleira/gaveta)
- **Ao Clicar em um Perfil:**
  - Abre modal/tela de detalhes com:
    - Código, nome, linha
    - Imagem grande do desenho
    - Medidas completas
    - Localização (com ícone 📍)
    - Data de criação
    - Botões: Editar, Deletar, Compartilhar

---

### 5. Configurações (Bônus)
**Rota:** `/(tabs)/settings.tsx`  
**Propósito:** Ajustes do aplicativo

**Conteúdo:**
- Tema (Claro/Escuro/Auto)
- Sobre o app
- Versão
- Feedback

---

## Fluxos de Usuário

### Fluxo 1: Cadastrar Novo Perfil
```
Dashboard 
  → Toca "Novo Perfil" 
  → Tela de Cadastro 
  → Preenche formulário 
  → Faz upload do desenho 
  → Toca "Salvar" 
  → Sucesso (toast/modal) 
  → Volta ao Dashboard
```

### Fluxo 2: Registrar Localização
```
Dashboard 
  → Toca "Localização" 
  → Seleciona perfil 
  → Preenche setor/prateleira/gaveta 
  → Toca "Atualizar" 
  → Sucesso 
  → Mostra localização confirmada
```

### Fluxo 3: Buscar Perfil
```
Dashboard 
  → Toca "Buscar" OU digita na busca rápida 
  → Tela de Busca 
  → Digita código/nome 
  → Resultados aparecem 
  → Toca em um perfil 
  → Modal com detalhes 
  → Visualiza desenho em tela cheia
```

### Fluxo 4: Editar Localização Existente
```
Busca 
  → Abre detalhes do perfil 
  → Toca "Editar Localização" 
  → Tela de Localização com dados preenchidos 
  → Altera valores 
  → Toca "Atualizar" 
  → Sucesso
```

---

## Componentes Reutilizáveis

| Componente | Uso | Props |
|------------|-----|-------|
| `ScreenContainer` | Wrapper de todas as telas | `className`, `edges` |
| `StatCard` | Exibe número + label | `value`, `label`, `icon` |
| `ProfileCard` | Card de perfil em lista | `codigo`, `nome`, `medidas`, `imagem` |
| `LocationBadge` | Mostra localização | `setor`, `prateleira`, `gaveta` |
| `FormInput` | Input com label | `label`, `value`, `onChange`, `error` |
| `FormSelect` | Picker/Select | `label`, `options`, `value`, `onChange` |
| `ImageUpload` | Upload com preview | `onUpload`, `maxSize` |
| `ConfirmModal` | Modal de confirmação | `title`, `message`, `onConfirm`, `onCancel` |

---

## Padrões de Interação

### Feedback Visual
- **Botão Pressionado:** Escala 0.97, opacidade 0.9
- **Sucesso:** Toast verde com ícone ✓ (2s)
- **Erro:** Toast vermelho com ícone ✗ (3s)
- **Carregamento:** Spinner circular (cor primária)

### Haptics (Vibração)
- Tap em botão primário: `impactAsync(Light)`
- Sucesso: `notificationAsync(Success)`
- Erro: `notificationAsync(Error)`

### Navegação
- Tab Bar sempre visível (exceto em modais fullscreen)
- Breadcrumb ou botão voltar em telas secundárias
- Transição suave entre telas (fade/slide)

---

## Responsividade

### Mobile (< 600px)
- Tela cheia com padding 16px
- Botões ocupam 100% da largura
- Imagens redimensionam para largura disponível

### Tablet (600px - 1024px)
- Conteúdo centralizado com máx 600px
- Dois cards lado a lado quando possível
- Imagens maiores

### Web (> 1024px)
- Layout desktop com sidebar
- Tabela de perfis em vez de lista
- Pré-visualização de detalhes ao lado

---

## Acessibilidade

- Contraste: WCAG AA (4.5:1 para texto)
- Tamanho de toque: mínimo 44×44pt
- Labels em todos os inputs
- Suporte a leitura de tela (VoiceOver/TalkBack)
- Sem dependência de cor apenas

---

## Prototipagem

Wireframes básicos:

```
Dashboard:
┌─────────────────────────┐
│ Gestão de Perfis    ⚙️   │
├─────────────────────────┤
│  Total: 1.234 perfis    │
│  ┌──────────────────┐   │
│  │ Busca rápida... 🔍│   │
│  └──────────────────┘   │
├─────────────────────────┤
│ ┌─────────┬─────────┐   │
│ │ Novo    │ Buscar  │   │
│ │ Perfil  │ Perfil  │   │
│ ├─────────┼─────────┤   │
│ │Localiz. │Configur.│   │
│ └─────────┴─────────┘   │
├─────────────────────────┤
│ Últimos Acessados       │
│ [Perfil 1] [Perfil 2]   │
└─────────────────────────┘
```

---

## Próximos Passos

1. Implementar telas em React Native com NativeWind
2. Integrar banco de dados (Drizzle ORM + MySQL)
3. Criar API tRPC para CRUD
4. Adicionar upload de imagens (S3)
5. Implementar busca com filtros
6. Testes end-to-end
7. Deploy e publicação
