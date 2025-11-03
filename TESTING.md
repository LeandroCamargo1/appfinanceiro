# 🧪 Guia de Testagem - Nós na Conta PRO

Teste completo do aplicativo antes de publicar.

## ✅ Checklist de Testagem

### 1. Inicialização
- [ ] Página carrega sem erros (abrir F12)
- [ ] Dashboard exibe corretamente
- [ ] Nenhum erro no console
- [ ] Todos os elementos aparecem
- [ ] Responsivo em mobile (F12 > Toggle device)

### 2. Dashboard (Resumo)
- [ ] Cards mostram valores zerados no início
- [ ] Clique em "Carregar Dados de Exemplo" funciona
- [ ] Dados de exemplo aparecem
- [ ] Cards atualizam com dados
- [ ] Gráfico de categorias renderiza
- [ ] Transações recentes listam
- [ ] Metas mostram progresso

### 3. Transações
- [ ] Aba "Transações" abre
- [ ] Botão "Nova Transação" funciona
- [ ] Modal abre com formulário vazio
- [ ] Campos: descrição, valor, categoria, tipo
- [ ] Pode selecionar tipo (receita/despesa)
- [ ] Pode definir parcelas
- [ ] Botão Salvar funciona
- [ ] Transação aparece na lista
- [ ] Botão Editar abre modal preenchido
- [ ] Botão Excluir remove transação
- [ ] Filtros funcionam
- [ ] Busca funciona

### 4. Orçamentos
- [ ] Aba "Orçamentos" abre
- [ ] Botão "Novo Orçamento" funciona
- [ ] Modal abre com formulário
- [ ] Campos: nome, valor, categoria
- [ ] Categoria pode ser selecionada
- [ ] Pode salvar orçamento
- [ ] Orçamento aparece na lista
- [ ] Mostra consumo vs limite
- [ ] Pode editar orçamento
- [ ] Pode deletar orçamento

### 5. Metas
- [ ] Aba "Metas" abre
- [ ] Botão "Nova Meta" funciona
- [ ] Modal abre com formulário
- [ ] Campos: título, valor alvo, valor atual, data limite
- [ ] Pode salvar meta
- [ ] Meta aparece na lista
- [ ] Mostra progresso em percentual
- [ ] Botão "Atualizar Progresso" funciona
- [ ] Pode editar meta
- [ ] Pode deletar meta

### 6. Relatórios
- [ ] Aba "Relatórios" abre
- [ ] Selector de data aparece (padrão: outubro 2025)
- [ ] Botão "Aplicar Filtro" funciona
- [ ] Cards de resumo aparecem
- [ ] Gráfico de gastos por categoria renderiza
- [ ] Gráfico de evolução mensal renderiza
- [ ] Tabela de categorias aparece
- [ ] Botões de período funcionam (Este Mês, 3 Meses, etc)
- [ ] Dados mudam conforme período

### 7. Modais
- [ ] Modais abrem suavemente (animação)
- [ ] Modais fecham suavemente
- [ ] Clicar em X fecha o modal
- [ ] Clicar em "Cancelar" fecha o modal
- [ ] ESC fecha o modal
- [ ] Clicar no overlay (fundo escuro) fecha
- [ ] Formulários mantêm dados ao abrir/fechar
- [ ] Validação funciona (campos obrigatórios)

### 8. Navegação
- [ ] Abas funcionam ao clicar
- [ ] Conteúdo muda conforme aba
- [ ] Pode voltar para aba anterior
- [ ] FAB (botão +) abre modal de transação
- [ ] Ícone de menu abre configurações
- [ ] Volta para home/dashboard funciona

### 9. Notificações
- [ ] Ao adicionar transação: notificação aparece
- [ ] Ao deletar: confirmação aparece
- [ ] Ao salvar: mensagem de sucesso
- [ ] Erros mostram mensagem apropriada
- [ ] Notificações desaparecem automaticamente

### 10. Dados e Armazenamento
- [ ] Dados salvam em localStorage
- [ ] Recarregar página mantém dados
- [ ] Pode limpar dados nas configurações
- [ ] "Carregar Dados de Exemplo" funciona
- [ ] "Limpar Todos os Dados" funciona
- [ ] Confirmação antes de deletar tudo

### 11. Responsividade
- [ ] Desktop (1920px): layout perfeito
- [ ] Tablet (768px): layouts adaptativos
- [ ] Mobile (375px): tudo legível e clicável
- [ ] Tudo funciona no touch (mobile)
- [ ] Sem scroll horizontal desnecessário
- [ ] Botões têm tamanho adequado (>44px)

### 12. Modo Offline
- [ ] Desativar WiFi/internet
- [ ] App continua funcionando
- [ ] Dados antigos aparecem
- [ ] Pode adicionar transações offline
- [ ] Ativa WiFi/internet novamente
- [ ] Dados sincronizam (se Firebase configurado)

### 13. Navegadores
- [ ] Chrome (latest): testa
- [ ] Firefox (latest): testa
- [ ] Safari (se Mac): testa
- [ ] Edge (latest): testa
- [ ] Mobile browsers: testa
- [ ] Nenhum erro em nenhum navegador

### 14. Performance
- [ ] Página carrega em <2 segundos
- [ ] Sem travamentos ao interagir
- [ ] Gráficos renderizam rapidamente
- [ ] Transições suaves
- [ ] Console sem warnings

### 15. Firebase (se configurado)
- [ ] Login funciona
- [ ] Dados sincronizam
- [ ] Logout funciona
- [ ] Login novamente recupera dados
- [ ] Múltiplas abas sincronizam

## 🧬 Casos de Teste Específicos

### Teste 1: Transação Parcelada
```
1. Clique em "Nova Transação"
2. Descrição: "Compra no financiado"
3. Valor: 1200
4. Categoria: Compras
5. Tipo: Despesa
6. Parcelas: 12
7. Salvar
✅ Esperado: 12 parcelas de 100 devem ser criadas
```

### Teste 2: Editar Transação
```
1. Em "Transações", clique em editar uma
2. Altere descrição, valor, categoria
3. Salve
✅ Esperado: Transação atualiza na lista
```

### Teste 3: Orçamento vs Despesa
```
1. Crie orçamento de 500 em "Alimentação"
2. Crie despesa de 300 em "Alimentação"
3. Verifique orçamento
✅ Esperado: Mostra 300/500 consumido
```

### Teste 4: Meta com Progresso
```
1. Crie meta de 5000 em "Viagem"
2. Salve valor atual como 1000
3. Clique "Atualizar Progresso"
4. Altere para 2500
✅ Esperado: Barra de progresso mostra 50%
```

### Teste 5: Relatório Completo
```
1. Vá a Relatórios
2. Carregue dados de exemplo
3. Selecione período: "Este Mês"
4. Clique "Aplicar Filtro"
✅ Esperado: Gráficos e tabelas se atualizam
```

### Teste 6: Limpeza de Dados
```
1. Carregue dados de exemplo
2. Vá para configurações
3. Clique "Limpar Todos os Dados"
4. Confirme
✅ Esperado: Dados desaparecem, dashboard vazio
```

## 🐛 Como Reportar Bugs

Ao encontrar um bug:

1. **Documente**:
   - Descrição clara
   - Passos para reproduzir
   - Resultado esperado vs atual
   - Navegador e versão
   - Screenshot

2. **Abra Issue no GitHub**:
   - Título: `[BUG] Descrição breve`
   - Use template de bug report
   - Cole descrição e passos

3. **Exemplo de Issue boa**:
```
Título: [BUG] Modal não fecha ao pressionar ESC

Descrição:
Quando há um modal aberto (ex: Nova Transação),
pressionar ESC deveria fechar. Não funciona.

Passos:
1. Clique em "Nova Transação"
2. Modal abre
3. Pressione ESC
4. Modal continua aberto

Esperado: Modal fecha
Obtido: Modal continua aberto

Navegador: Chrome 120
SO: Windows 11
```

## 📊 Métricas de Qualidade

### Performance
- Carregamento inicial: < 2s
- Dashboard render: < 500ms
- Modal open: < 300ms
- Chart render: < 1s

### Funcionalidade
- Features core: 100%
- Features secondary: 95%+
- Erro handling: 90%+

### Code Quality
- Console errors: 0
- Console warnings: <5
- Dead code: 0
- Duplicação: <10%

## ✅ Aprovação Final

Antes de publicar no GitHub:

- [ ] Todos testes acima passam
- [ ] Nenhum erro crítico
- [ ] Performance aceitável
- [ ] Código limpo e documentado
- [ ] README atualizado
- [ ] Changelog atualizado
- [ ] Firebase config protegido
- [ ] Dados de exemplo funcionam
- [ ] Modo offline funciona
- [ ] Responsivo em todos devices

## 🎯 Resultado Final

Se todos os testes passarem:
**APLICATIVO PRONTO PARA GITHUB! 🚀**

---

Dicas:
- Use F12 para verificar console
- Teste em modo incógnito para localStorage limpo
- Teste em múltiplos navegadores
- Teste em rede lenta (DevTools > Network > Slow 3G)
- Teste com touch (DevTools > Toggle device toolbar)

Boa sorte! 🍀
