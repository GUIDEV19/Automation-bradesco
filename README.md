# Sistema de Automação Excel com Electron + Next.js + Playwright

Sistema desktop para automação de preenchimento de formulários web a partir de dados de planilhas Excel.

## 🚀 Funcionalidades

- ✅ Interface desktop moderna usando Electron
- ✅ Upload de planilhas Excel (.xlsx, .xls)
- ✅ Processamento linha por linha de dados (CPF e Código)
- ✅ Automação web com Playwright
- ✅ Registro de sucesso/falha para cada linha
- ✅ Exportação de planilha processada com resultados
- ✅ Logs em tempo real do processamento
- ✅ Barra de progresso visual

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório ou navegue até o diretório do projeto

2. Instale as dependências:
```bash
npm install
```

3. Instale os navegadores do Playwright:
```bash
npx playwright install
```

## 🎮 Como usar

### Modo Desenvolvimento

Para executar o aplicativo em modo de desenvolvimento:

```bash
npm run electron-dev
```

Este comando irá:
- Iniciar o servidor Next.js na porta 3000
- Abrir a aplicação Electron automaticamente
- Habilitar hot reload para desenvolvimento

### Modo Produção

Para gerar o build de produção:

```bash
npm run electron-build
```

O executável será gerado na pasta `dist/`.

## 📝 Formato da Planilha

A planilha Excel deve seguir este formato:

| Coluna A (CPF) | Coluna B (Código) | Coluna C (Status) |
|---------------|------------------|-------------------|
| 123.456.789-00 | ABC123          | (preenchido automaticamente) |
| 987.654.321-00 | XYZ789          | (preenchido automaticamente) |

- **Coluna A**: CPF do usuário
- **Coluna B**: Código de acesso
- **Coluna C**: Será preenchida automaticamente com "SUCESSO" ou "FALHA"

## 🔐 Configuração da Automação

A automação tenta encontrar automaticamente os campos de formulário baseado em atributos comuns:

- **Campo CPF**: Busca por inputs com name, id ou placeholder contendo "cpf"
- **Campo Código**: Busca por inputs com name, id ou placeholder contendo "codigo" ou "code"
- **Botão Submit**: Busca por botões do tipo submit ou com textos como "Entrar", "Login", "Enviar"

### Personalização

Se o site alvo usar seletores diferentes, você pode modificar o arquivo:
```
app/api/automation/route.ts
```

Exemplos de personalização:

```typescript
// Para encontrar um campo específico por ID
const cpfInput = await page.locator('#campo-cpf-customizado');

// Para encontrar um campo por classe CSS
const codigoInput = await page.locator('.meu-campo-codigo');

// Para encontrar um botão específico
const submitButton = await page.locator('button.btn-enviar');
```

## 🏗️ Estrutura do Projeto

```
├── app/
│   ├── api/
│   │   └── automation/
│   │       └── route.ts          # API de automação com Playwright
│   ├── components/
│   │   ├── AutomationForm.tsx    # Formulário de upload e configuração
│   │   └── ProcessingStatus.tsx  # Status e logs de processamento
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Página principal
├── electron/
│   └── main.js                   # Processo principal do Electron
├── public/
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Tecnologias Utilizadas

- **Next.js 14**: Framework React para a interface
- **Electron**: Para criar a aplicação desktop
- **Playwright**: Automação de navegador
- **TypeScript**: Tipagem estática
- **XLSX**: Leitura e escrita de planilhas Excel

## ⚙️ Scripts Disponíveis

- `npm run dev` - Executa Next.js em modo desenvolvimento
- `npm run build` - Gera build de produção do Next.js
- `npm run electron` - Executa o Electron
- `npm run electron-dev` - Executa Electron + Next.js em desenvolvimento
- `npm run electron-build` - Gera executável final

## 🐛 Troubleshooting

### Playwright não encontra os campos

1. Verifique se o site está carregando completamente
2. Ajuste os seletores no arquivo `app/api/automation/route.ts`
3. Aumente o timeout se o site for lento:
```typescript
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
```

### Erro ao processar planilha

1. Verifique se a planilha tem dados na coluna A e B
2. Certifique-se de que o formato é .xlsx ou .xls
3. Verifique se há uma linha de cabeçalho (ela será ignorada)

### Aplicação Electron não abre

1. Certifique-se de que o Next.js está rodando na porta 3000
2. Tente executar `npm run dev` primeiro, depois `npm run electron` em outro terminal

## 📄 Licença

MIT

## 👨‍💻 Suporte

Para problemas ou dúvidas, abra uma issue no repositório do projeto.

