# ChatWoot + Evolution App

Uma aplicação React moderna para criação automática de contas ChatWoot e instâncias Evolution.

## 🌐 Demo Online

**Acesse a aplicação:** [https://chatwoot-evolution-jx56oet0o-ronald-melos-projects.vercel.app](https://chatwoot-evolution-jx56oet0o-ronald-melos-projects.vercel.app)

## ✨ Características

- 🎨 **Modo Escuro/Claro** - Interface com tema adaptável
- 📱 **Design Responsivo** - Funciona em todos os dispositivos
- ⚡ **Validação em Tempo Real** - Feedback instantâneo para o usuário
- 🔄 **Preview de Instância** - Visualização do nome da instância antes da criação
- 💾 **Persistência de Tema** - Lembra a preferência do usuário
- 🎯 **UX Otimizada** - Interface intuitiva e moderna

## 🚀 Tecnologias

- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Vite** - Build tool e dev server
- **Lucide React** - Ícones modernos

## 📦 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/SEU_USUARIO/chatwoot-evolution-app.git
cd chatwoot-evolution-app
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o servidor de desenvolvimento**
```bash
npm run dev
```

4. **Acesse a aplicação**
Abra [http://localhost:5173](http://localhost:5173) no seu navegador.

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção

## 🎨 Modo Escuro

A aplicação inclui um sistema completo de tema escuro/claro:

- **Toggle automático** - Botão no canto superior direito
- **Persistência** - Salva a preferência no localStorage
- **Detecção automática** - Respeita a preferência do sistema
- **Transições suaves** - Animações elegantes entre temas

## 📋 Funcionalidades

### Formulário de Cadastro
- Validação de campos obrigatórios
- Validação de formato de email
- Preview do nome da instância em tempo real
- Normalização automática de acentos e caracteres especiais

### Resultado
- Exibição dos dados de acesso
- Links diretos para o ChatWoot
- Informações da instância Evolution
- Opção para criar nova conta

## 🔧 Configuração do Backend

Esta aplicação requer um servidor backend rodando na porta 3002. Certifique-se de que o servidor esteja configurado e funcionando.

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona perfeitamente em:
- 📱 Dispositivos móveis
- 💻 Tablets
- 🖥️ Desktops

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Seu Nome**
- GitHub: [@SEU_USUARIO](https://github.com/SEU_USUARIO)

## 🔒 Variáveis de Ambiente e Segurança

Antes de rodar ou publicar o projeto, crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo (NUNCA suba este arquivo para o Git!):

```env
CHATWOOT_API_KEY=COLOQUE_SUA_KEY_AQUI
EVOLUTION_API_KEY=COLOQUE_SUA_KEY_AQUI
CHATWOOT_URL=https://chat.relaxsolucoes.online
EVOLUTION_URL=https://api.relaxsolucoes.online
```

> **Importante:**
> - Nunca compartilhe suas chaves reais publicamente.
> - O arquivo `.env` já deve estar listado no `.gitignore`.

## 🚀 Deploy na Vercel

1. Faça login na Vercel e conecte o repositório.
2. Configure as variáveis de ambiente no painel da Vercel (NUNCA coloque valores sensíveis no código).
3. Faça deploy com:

```bash
vercel --prod
```

Pronto! Seu projeto estará online com segurança.

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório! 