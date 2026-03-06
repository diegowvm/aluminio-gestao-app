# Projeto TODO - Gestão de Perfis de Alumínio

## Arquitetura e Design
- [x] Criar design.md com arquitetura de telas
- [x] Definir fluxos de usuário
- [x] Definir paleta de cores
- [x] Gerar logo do aplicativo

## Backend - Banco de Dados
- [x] Criar schema PERFIS (id, codigo_perfil, nome_perfil, linha, altura_mm, largura_mm, espessura_mm, imagem_secao, criado_em)
- [x] Criar schema LOCALIZACOES (id, perfil_id, setor, prateleira, gaveta, observacoes)
- [x] Criar schema CATALOGO_TECNICO (id, perfil_id, pdf_origem, medidas_completas, desenho_tecnico)
- [x] Criar relacionamentos entre tabelas
- [x] Criar índices para otimizar buscas
- [x] Executar migrations do banco

## Backend - API tRPC
- [x] Criar rotas para CRUD de PERFIS
  - [x] perfis.list (listar todos)
  - [x] perfis.create (criar novo)
  - [x] perfis.getById (obter por ID)
  - [x] perfis.update (atualizar)
  - [x] perfis.delete (deletar)
  - [x] perfis.search (buscar por código/nome)
- [x] Criar rotas para CRUD de LOCALIZACOES
  - [x] localizacoes.create (registrar localização)
  - [x] localizacoes.getByPerfilId (obter localização de um perfil)
  - [x] localizacoes.update (atualizar localização)
- [ ] Criar rotas para upload de imagens (S3)
  - [ ] uploadImage (upload de desenho técnico)
  - [ ] getImageUrl (obter URL da imagem)
- [x] Validação com Zod para todos os inputs

## Frontend - Componentes Base
- [x] Criar componente StatCard (exibe número + label)
- [x] Criar componente ProfileCard (card de perfil em lista)
- [x] Criar componente LocationBadge (mostra localização)
- [x] Criar componente FormInput (input com label e validação)
- [ ] Criar componente FormSelect (picker/select)
- [ ] Criar componente ImageUpload (upload com preview)
- [ ] Criar componente ConfirmModal (modal de confirmação)
- [ ] Criar componente LoadingSpinner (indicador de carregamento)
- [ ] Criar componente Toast (notificações)

## Frontend - Telas
- [x] Dashboard (Home)
  - [x] Exibir total de perfis cadastrados
  - [x] Campo de busca rápida
  - [x] 4 botões de ação rápida (Novo Perfil, Buscar, Localização, Configurações)
  - [x] Lista de últimos perfis acessados
- [x] Cadastro de Perfil
  - [x] Formulário com campos: código, nome, linha, medidas (altura, largura, espessura)
  - [ ] Upload de desenho técnico
  - [x] Campo de observações
  - [x] Validação de formulário
  - [x] Botões Salvar e Cancelar
- [x] Localização no Estoque
  - [x] Seleção/busca de perfil
  - [x] Formulário com: setor, prateleira, gaveta, observações
  - [x] Visualização da localização atual
  - [x] Botões Atualizar e Limpar
- [x] Busca e Visualização
  - [x] Campo de busca com filtros
  - [x] Lista de resultados (FlatList)
  - [x] Modal/tela de detalhes do perfil
  - [x] Visualização em tela cheia do desenho
  - [ ] Botões: Editar, Deletar, Compartilhar
- [ ] Configurações (Bônus)
  - [ ] Seleção de tema (Claro/Escuro/Auto)
  - [ ] Informações sobre o app
  - [ ] Versão

## Frontend - Navegação
- [x] Configurar Tab Bar com 4 abas (Dashboard, Cadastro, Localização, Busca)
- [x] Implementar navegação entre telas
- [x] Adicionar ícones nas abas
- [ ] Implementar deep linking para perfis

## Frontend - Integração com Backend
- [x] Conectar Dashboard à API (listar perfis, busca rápida)
- [x] Conectar Cadastro à API (criar perfil, upload de imagem)
- [x] Conectar Localização à API (registrar/atualizar localização)
- [x] Conectar Busca à API (buscar por código/nome)
- [x] Implementar tratamento de erros
- [x] Implementar loading states
- [x] Implementar feedback visual (toast, modals)

## Branding
- [x] Gerar logo do aplicativo
- [x] Atualizar app.config.ts com nome e logo
- [x] Criar assets (icon.png, splash-icon.png, favicon.png, android-icon-foreground.png)

## Testes
- [ ] Testar fluxo de cadastro de perfil
- [ ] Testar fluxo de localização
- [ ] Testar fluxo de busca
- [ ] Testar validações de formulário
- [ ] Testar upload de imagens
- [ ] Testar responsividade (mobile, tablet, web)
- [ ] Testar dark mode
- [ ] Testar offline (se aplicável)

## Deployment
- [ ] Criar checkpoint final
- [ ] Gerar APK/IPA
- [ ] Publicar no app store (se necessário)

## Documentação
- [ ] Criar README com instruções de uso
- [ ] Documentar arquitetura do banco
- [ ] Documentar API endpoints
- [ ] Criar guia de desenvolvimento
