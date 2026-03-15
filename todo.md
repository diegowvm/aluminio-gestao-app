# TODO - Aplicativo de Reconhecimento de Perfis de Alumínio (PRODUÇÃO)

## FASE 1: AUDITORIA E LIMPEZA

### Funcionalidades a REMOVER (não funcionam ou confundem)
- [x] Remover tela "Treinar" (train.tsx)
- [x] Remover tela "Performance" (performance.tsx)
- [x] Remover tela "IA Analysis" (ai-analysis.tsx)
- [x] Remover tela "Câmera" (camera.tsx) - será reconstruída
- [x] Remover tela "Busca" (search.tsx)
- [x] Remover tela "Localização" (location.tsx)
- [x] Remover tela "Cadastro" (register.tsx)
- [ ] Remover routers desnecessários (training.ts, performance.ts, ai-vision.ts)
- [ ] Remover tabelas do banco não essenciais
- [ ] Limpar banco de dados de dados fictícios

### Funcionalidades a MANTER (funcionam)
- [x] Dashboard (index.tsx) - apenas estatísticas básicas
- [x] Banco de dados de perfis (PERFIS table)
- [x] API básica de perfis (CRUD)

## FASE 2: IMPLEMENTAR FUNCIONALIDADES REAIS

### Upload de PDF para IA
- [ ] Criar componente de upload de PDF
- [ ] Enviar PDF para servidor
- [ ] Extrair informações do PDF (303 perfis)
- [ ] Armazenar em memória da IA

### Câmera/Upload de Foto
- [x] Implementar captura de câmera
- [x] Implementar upload de foto da galeria
- [x] Enviar foto para IA

### Reconhecimento Real
- [x] IA analisa foto (rota visionRecognition.analyzeAndSearch)
- [x] IA compara com catálogo aprendido (303 perfis no banco)
- [x] IA retorna modelo identificado com confiança (corrigido formato de resposta)
- [x] Exibir resultado na tela (modal com resultado)

### Dashboard Simples
- [ ] Total de perfis no catálogo
- [ ] Última busca realizada
- [ ] Acurácia geral (%)

## FASE 3: TESTES E VALIDAÇÃO

- [ ] Testar upload de PDF
- [ ] Testar captura de câmera
- [ ] Testar upload de foto
- [ ] Testar reconhecimento com múltiplos ângulos
- [ ] Validar que IA aprende com o PDF
- [ ] Testar em ambiente industrial

## FASE 4: ENTREGA

- [ ] Aplicativo limpo e funcional
- [ ] Sem funcionalidades confusas
- [ ] Pronto para produção
