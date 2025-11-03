# Contribuindo para Nós na Conta PRO

Muito obrigado por se interessar em contribuir! Este documento fornece orientações para ajudar o projeto.

## 🤝 Como Contribuir

Existem muitas formas de contribuir:

1. **Reportar bugs**: Abra uma issue descrevendo o problema
2. **Sugerir melhorias**: Crie uma issue com suas ideias
3. **Enviar código**: Faça um fork, crie uma branch e envie um PR
4. **Melhorar documentação**: Corrija ou melhore o README

## 🐛 Reportando Bugs

Ao reportar um bug, inclua:

- **Título claro**: Descreva brevemente o problema
- **Descrição**: Explique o que esperava vs. o que ocorreu
- **Passos para reproduzir**: Instruções detalhadas
- **Versão do navegador**: Chrome, Firefox, Safari, etc.
- **Screenshots**: Se aplicável
- **Console errors**: Abra F12 e copie erros

Exemplo:
```
Título: Dashboard não carrega quando offline

Descrição:
Quando desconectado da internet, o dashboard mostra erro em branco.

Passos para reproduzir:
1. Abra o app
2. Carregue alguns dados
3. Desconecte do WiFi
4. Recarregue a página
5. O dashboard fica em branco

Esperado: Mostrar dados do localStorage offline
Obtido: Tela branca com erro
```

## 💡 Sugerindo Melhorias

Para sugerir uma melhoria:

1. Abra uma nova issue
2. Use o título: `[SUGESTÃO] Título descritivo`
3. Descreva:
   - O que você quer melhorar
   - Por que seria útil
   - Como imagina a solução
   - Screenshots/exemplos se houver

Exemplo:
```
Título: [SUGESTÃO] Adicionar modo escuro

Descrição:
Muitos usuários preferem modo escuro para menos fadiga visual.

Proposição:
- Adicionar toggle nas configurações
- Salvar preferência no localStorage
- Aplicar tema automáticamente conforme sistema
```

## 💻 Contribuindo com Código

### 1. Setup Local

```bash
# Clone seu fork
git clone https://github.com/seu-usuario/financa-familiar.git
cd financa-familiar

# Crie uma branch para sua feature
git checkout -b feature/sua-feature-aqui
```

### 2. Faça suas Mudanças

- Edite os arquivos necessários
- Teste localmente
- Abra console (F12) para verificar erros

### 3. Padrões de Código

Siga estes padrões:

**JavaScript:**
```javascript
// Use ES6 modules
export class MinhaClasse {
    constructor() {
        // Inicialize com comentários
    }

    meuMetodo() {
        // Métodos públicos primeiro
    }

    #metodoPrivado() {
        // Use # para métodos privados
    }
}

// Use const por padrão
const minhaVariavel = 'valor';

// Use template literals
const mensagem = `Olá ${nome}`;

// Use async/await
async function fetchData() {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}
```

**HTML:**
```html
<!-- Use classes BEM ou Tailwind -->
<div class="modal-card">
    <h2 class="modal-title">Título</h2>
    <p class="text-gray-600">Descrição</p>
</div>
```

**CSS:**
```css
/* Organize por componente */
/* Modal Styles */
.modal-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-title {
    font-size: 1.5rem;
    font-weight: bold;
}
```

### 4. Comentários e Documentação

```javascript
/**
 * Descrição breve da função
 * @param {Type} paramName - Descrição do parâmetro
 * @returns {Type} Descrição do retorno
 * @example
 * const resultado = minhaFuncao(param);
 */
function minhaFuncao(paramName) {
    // Implementação
}
```

### 5. Commit Message

Use mensagens descritivas:

```bash
git commit -m "feat: adicionar modo escuro"
git commit -m "fix: corrigir bug do dashboard offline"
git commit -m "docs: atualizar README com instruções Firebase"
git commit -m "refactor: melhorar performance do ModalManager"
```

Formatos aceitos:
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Estilização
- `refactor:` - Refatoração
- `perf:` - Performance
- `test:` - Testes

### 6. Push e Pull Request

```bash
# Push sua branch
git push origin feature/sua-feature-aqui

# Abra um PR no GitHub com:
# - Título descritivo
# - Descrição das mudanças
# - Issue relacionada (se houver): Fixes #123
# - Screenshots antes/depois se aplicável
```

**Template de PR:**
```markdown
## Descrição
Breve descrição do que foi mudado e por quê.

## Tipo de Mudança
- [ ] Novo recurso
- [ ] Correção de bug
- [ ] Melhoria
- [ ] Documentação

## Como Testar
1. Passo 1
2. Passo 2
3. Verifique se X ocorre

## Screenshots
[Se aplicável]

## Checklist
- [ ] Meu código segue o estilo do projeto
- [ ] Testei no meu ambiente local
- [ ] Verifiquei console para erros
- [ ] Atualizei a documentação
- [ ] Meu commit segue o padrão

Fixes #[número da issue]
```

## 📁 Estrutura para Novas Features

Ao adicionar uma feature grande, organize assim:

```
js/
├── modules/
│   └── NovoModule.js          # Nova classe
├── services/
│   └── NovoService.js         # Novo serviço
├── components/
│   └── NovoComponent.js       # Novo componente
└── utils/
    └── novoUtility.js         # Nova utilidade
```

## 🧪 Testando

Teste localmente:

1. Abra o app no navegador
2. Teste sua feature completamente
3. Teste em diferentes navegadores
4. Verifique console (F12) sem erros
5. Teste modo offline se aplicável

## 📚 Recursos Úteis

- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Chart.js Documentation](https://www.chartjs.org/docs)
- [MDN Web Docs](https://developer.mozilla.org)

## 🎯 Áreas de Melhoria

Principais áreas onde precisa de ajuda:

1. **Modo Escuro**: Implementar tema claro/escuro
2. **Exportação**: Exportar dados em CSV/PDF
3. **Categorias**: Permitir categorias personalizadas
4. **Mobile**: Otimizar para celulares
5. **Testes**: Adicionar testes automatizados
6. **Documentação**: Guias de desenvolvimento

## ✅ Checklist Antes de Submeter PR

- [ ] Código segue os padrões do projeto
- [ ] Testado localmente
- [ ] Sem console errors/warnings
- [ ] Mensagens de commit descritivas
- [ ] README/docs atualizados se necessário
- [ ] Screenshots em PRs visuais
- [ ] Testado em múltiplos navegadores

## 📞 Precisa de Ajuda?

- Abra uma issue com sua dúvida
- Comente em um PR existente
- Procure por issues com tag `help-wanted`

## Código de Conduta

Somos um projeto inclusivo. Esperamos:
- Respeito mútuo
- Feedback construtivo
- Sem assédio ou discriminação
- Foco em melhorar o projeto

Violações podem resultar em banimento.

---

Obrigado por contribuir! 🎉
