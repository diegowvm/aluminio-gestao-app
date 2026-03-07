# Gestão de Perfis de Alumínio

Aplicativo móvel para gestão e identificação de perfis de alumínio em ambiente industrial. O sistema permite cadastrar perfis, registrar localização no estoque, buscar por código ou nome e visualizar detalhes técnicos.

## Funcionalidades Principais

### Dashboard
- Visualização do total de perfis cadastrados
- Busca rápida por código ou nome
- 4 botões de ação rápida (Novo Perfil, Buscar, Localização, Configurações)
- Lista dos últimos perfis acessados

### Cadastro de Perfil
- Cadastro de novo perfil com código único
- Registro de medidas (altura, largura, espessura em mm)
- Campo para linha/série do perfil
- Observações adicionais
- Validação de formulário em tempo real

### Localização no Estoque
- Seleção de perfil para registrar localização
- Registro de setor, prateleira e gaveta
- Observações sobre a localização
- Visualização da localização atual do perfil

### Busca e Visualização
- Busca por código ou nome do perfil
- Visualização de detalhes completos do perfil
- Exibição de medidas técnicas
- Localização no estoque
- Data de cadastro

## Arquitetura Técnica

### Stack
- **Frontend:** React Native (Expo), TypeScript, NativeWind (Tailwind CSS)
- **Backend:** Node.js, tRPC, Express
- **Banco de Dados:** MySQL/TiDB com Drizzle ORM
- **Testes:** Vitest

### Banco de Dados

#### Tabela PERFIS
- `id` (PK, auto-increment)
- `codigoPerfil` (VARCHAR, UNIQUE)
- `nomePerfil` (VARCHAR)
- `linha` (VARCHAR, opcional)
- `alturaMm` (DECIMAL)
- `larguraMm` (DECIMAL)
- `espessuraMm` (DECIMAL)
- `imagemSecao` (VARCHAR - URL S3)
- `observacoes` (TEXT)
- `criadoEm` (TIMESTAMP)
- `atualizadoEm` (TIMESTAMP)

#### Tabela LOCALIZACOES
- `id` (PK, auto-increment)
- `perfilId` (FK → PERFIS)
- `setor` (VARCHAR)
- `prateleira` (INT)
- `gaveta` (INT)
- `observacoes` (TEXT)
- `criadoEm` (TIMESTAMP)
- `atualizadoEm` (TIMESTAMP)

#### Tabela CATALOGO_TECNICO
- `id` (PK, auto-increment)
- `perfilId` (FK → PERFIS)
- `pdfOrigem` (VARCHAR - URL)
- `medidasCompletas` (TEXT - JSON)
- `desenhoTecnico` (VARCHAR - URL)
- `criadoEm` (TIMESTAMP)
- `atualizadoEm` (TIMESTAMP)

## API tRPC

### Rotas de Perfis
- `perfis.list` - Listar todos os perfis
- `perfis.getById` - Obter perfil por ID
- `perfis.search` - Buscar por código ou nome
- `perfis.create` - Criar novo perfil
- `perfis.update` - Atualizar perfil
- `perfis.delete` - Deletar perfil

### Rotas de Localizações
- `localizacoes.getByPerfilId` - Obter localização de um perfil
- `localizacoes.create` - Registrar localização
- `localizacoes.update` - Atualizar localização

### Rotas de Catálogo Técnico
- `catalogoTecnico.getByPerfilId` - Obter catálogo de um perfil
- `catalogoTecnico.create` - Criar registro de catálogo
- `catalogoTecnico.update` - Atualizar catálogo

## Desenvolvimento

### Instalação
```bash
pnpm install
```

### Executar em Desenvolvimento
```bash
pnpm dev
```

Isso iniciará:
- Metro bundler (Expo) na porta 8081
- Servidor API na porta 3000

### Testes
```bash
pnpm test
```

Executa os testes com Vitest. Atualmente há 9 testes validando:
- Criação de perfis
- Listagem de perfis
- Busca de perfis
- Atualização de perfis
- Deleção de perfis
- Criação de localizações
- Obtenção de localizações
- Atualização de localizações

### Migrations do Banco
```bash
pnpm db:push
```

Gera e aplica migrations do Drizzle ORM.

## Fluxos de Usuário

### Cadastrar Novo Perfil
1. Toque em "Novo Perfil" no Dashboard
2. Preencha código, nome e medidas
3. Adicione observações (opcional)
4. Toque "Salvar Perfil"
5. Sucesso confirmado com toast

### Registrar Localização
1. Toque em "Localização" no Dashboard
2. Selecione um perfil da lista
3. Preencha setor, prateleira e gaveta
4. Adicione observações (opcional)
5. Toque "Atualizar"

### Buscar Perfil
1. Toque em "Buscar" no Dashboard ou use a busca rápida
2. Digite código ou nome do perfil
3. Resultados aparecem em tempo real
4. Toque em um perfil para ver detalhes completos
5. Modal exibe todas as informações e localização

## Design e UX

### Paleta de Cores
- **Primary:** #2563EB (Azul Industrial)
- **Background:** #FFFFFF (Claro) / #0F172A (Escuro)
- **Surface:** #F8FAFC (Claro) / #1E293B (Escuro)
- **Foreground:** #0F172A (Claro) / #F1F5F9 (Escuro)
- **Muted:** #64748B (Claro) / #94A3B8 (Escuro)

### Componentes
- **StatCard:** Exibe números e labels
- **ProfileCard:** Card de perfil com informações resumidas
- **LocationBadge:** Badge de localização
- **FormInput:** Input com label e validação
- **ScreenContainer:** Wrapper com SafeArea

### Responsividade
- Mobile (< 600px): Tela cheia com padding
- Tablet (600px - 1024px): Conteúdo centralizado
- Web (> 1024px): Layout desktop com sidebar

## Próximas Melhorias

1. **Upload de Imagens:** Implementar upload de desenhos técnicos para S3
2. **Reconhecimento por Imagem:** Integrar IA para identificar perfis por foto
3. **Exportação de Dados:** Gerar relatórios em PDF/Excel
4. **Sincronização Offline:** Salvar dados localmente e sincronizar quando online
5. **Notificações:** Alertas de baixo estoque ou perfis não localizados

## Suporte

Para dúvidas ou problemas, consulte:
- `design.md` - Arquitetura de telas e fluxos
- `server/README.md` - Documentação do backend
- `tests/` - Exemplos de testes

---

**Versão:** 1.0.0  
**Data:** Março 2026  
**Status:** Pronto para uso
