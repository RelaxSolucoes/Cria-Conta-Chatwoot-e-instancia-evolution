import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const CHATWOOT_API_KEY = process.env.CHATWOOT_API_KEY;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
if (!process.env.CHATWOOT_URL) {
  throw new Error('CHATWOOT_URL não definida nas variáveis de ambiente');
}
if (!process.env.EVOLUTION_URL) {
  throw new Error('EVOLUTION_URL não definida nas variáveis de ambiente');
}
const CHATWOOT_URL = process.env.CHATWOOT_URL;
const EVOLUTION_URL = process.env.EVOLUTION_URL;

app.use(cors());
app.use(express.json());

// Função para normalizar acentos (converter para equivalente sem acento)
function normalizeAccents(text) {
  const accentMap = {
    'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
    'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
    'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
    'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
    'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
    'ý': 'y', 'ÿ': 'y',
    'ñ': 'n',
    'ç': 'c',
    'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A',
    'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
    'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O',
    'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U',
    'Ý': 'Y',
    'Ñ': 'N',
    'Ç': 'C',
    '&': 'e' // Converte & para e
  };
  
  return text.split('').map(char => accentMap[char] || char).join('');
}

// Função para gerar senha aleatória que atende aos requisitos do ChatWoot
function generateRandomPassword() {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*';
  const allChars = lowercase + uppercase + numbers + specialChars;

  function hasAllTypes(pw) {
    return (
      /[a-z]/.test(pw) &&
      /[A-Z]/.test(pw) &&
      /[0-9]/.test(pw) &&
      /[!@#$%^&*]/.test(pw)
    );
  }

  let password = '';
  do {
    // Garante pelo menos 1 de cada tipo
    password = '';
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    // Adiciona os demais caracteres
    for (let i = 4; i < 12; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    // Embaralha
    password = password.split('').sort(() => Math.random() - 0.5).join('');
  } while (!hasAllTypes(password));
  return password;
}

// Função para limpar e normalizar dados
function cleanAndNormalizeData(data) {
  return {
    nome: data.nome.trim(),
    email: data.email.trim().toLowerCase(),
    whatsapp: data.whatsapp.trim(),
    nomeEmpresa: data.nomeEmpresa.trim()
  };
}

// Função para fazer requisições HTTP
async function makeRequest(url, options) {
  try {
    console.log('Fazendo requisição para:', url);
    console.log('Opções:', JSON.stringify(options, null, 2));
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    console.log('Status da resposta:', response.status);
    console.log('Dados da resposta:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
    }
    
    return data;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

app.post('/api/create-account', async (req, res) => {
  try {
    // Limpar e normalizar os dados recebidos
    const cleanedData = cleanAndNormalizeData(req.body);
    const { nome, email, whatsapp, nomeEmpresa } = cleanedData;
    
    console.log('Dados recebidos:', { nome, email, whatsapp, nomeEmpresa });
    
    // Validação básica de campos obrigatórios
    if (!nome || !email || !whatsapp || !nomeEmpresa) {
      return res.status(400).json({ 
        success: false,
        error: 'Todos os campos são obrigatórios',
        received: { nome, email, whatsapp, nomeEmpresa }
      });
    }

    // Validações mínimas e essenciais
    const errors = [];

    // Validação do nome - apenas verificar se não está vazio
    if (nome.length < 1) {
      errors.push('Nome é obrigatório');
    }

    // Validação do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Email inválido');
    }

    // Validação do WhatsApp - aceitar qualquer formato
    if (whatsapp.length < 1) {
      errors.push('WhatsApp é obrigatório');
    }

    // Validação do nome da empresa - apenas verificar se não está vazio
    if (nomeEmpresa.length < 1) {
      errors.push('Nome da empresa é obrigatório');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors
      });
    }

    const password = generateRandomPassword();
    let results = {};

    console.log('Iniciando processo de criação...');

    // 1. Criar empresa no ChatWoot
    console.log('1. Criando empresa no ChatWoot...');
    const companyPayload = {
      name: nomeEmpresa,
      locale: 'pt_BR'
    };
    console.log('Payload da empresa:', companyPayload);
    
    const company = await makeRequest(`${CHATWOOT_URL}/platform/api/v1/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_access_token': CHATWOOT_API_KEY
      },
      body: JSON.stringify(companyPayload)
    });

    results.company = company;
    console.log('Empresa criada:', company.id);

    // 2. Criar usuário no ChatWoot
    console.log('2. Criando usuário no ChatWoot...');
    const userPayload = {
      email: email,
      name: nome,
      password: password
    };
    console.log('Payload do usuário:', userPayload);
    
    const user = await makeRequest(`${CHATWOOT_URL}/platform/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_access_token': CHATWOOT_API_KEY
      },
      body: JSON.stringify(userPayload)
    });

    results.user = user;
    console.log('Usuário criado:', user.id);

    // 3. Definir usuário como administrador
    console.log('3. Definindo usuário como administrador...');
    const adminPayload = {
      user_id: user.id,
      role: 'administrator'
    };
    console.log('Payload do admin:', adminPayload);
    
    const adminRole = await makeRequest(`${CHATWOOT_URL}/platform/api/v1/accounts/${company.id}/account_users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_access_token': CHATWOOT_API_KEY
      },
      body: JSON.stringify(adminPayload)
    });

    results.adminRole = adminRole;
    console.log('Usuário definido como admin');

    // 4. Criar instância na Evolution API
    console.log('4. Criando instância na Evolution API...');
    // Limpar o nome da empresa para usar como instanceName (normalizar acentos e converter para minúsculas)
    const instanceName = normalizeAccents(nomeEmpresa)
      .toLowerCase() // Converte para minúsculas
      .replace(/\s+/g, '') // Remove espaços
      .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais (mantém apenas letras minúsculas e números)
      .substring(0, 20); // Limita a 20 caracteres
    
    console.log('Nome da instância gerado:', instanceName);
    
    // Validação adicional do nome da instância
    if (instanceName.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Nome da empresa gera uma instância muito curta após limpeza',
        details: ['O nome da empresa deve gerar pelo menos 2 caracteres válidos para a instância']
      });
    }
    
    const evolutionPayload = {
      instanceName: instanceName,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS'
    };
    console.log('Payload da instância Evolution:', evolutionPayload);
    
    const evolutionInstance = await makeRequest(`${EVOLUTION_URL}/instance/create`, {
      method: 'POST',
      headers: {
        'apikey': EVOLUTION_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(evolutionPayload)
    });

    results.evolutionInstance = evolutionInstance;
    console.log('Instância Evolution criada:', instanceName);

    // 5. Integrar ChatWoot com Evolution
    console.log('5. Integrando ChatWoot com Evolution...');
    const integrationPayload = {
      enabled: true,
      accountId: adminRole.account_id.toString(),
      token: user.access_token,
      url: CHATWOOT_URL,
      signMsg: true,
      reopenConversation: true,
      conversationPending: false,
      autoCreate: true
    };
    console.log('Payload da integração:', integrationPayload);
    
    const integration = await makeRequest(`${EVOLUTION_URL}/chatwoot/set/${instanceName}`, {
      method: 'POST',
      headers: {
        'apikey': EVOLUTION_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(integrationPayload)
    });

    results.integration = integration;
    console.log('Integração concluída');

    // Retornar dados de sucesso
    res.json({
      success: true,
      message: 'Conta criada com sucesso!',
      data: {
        email: email,
        password: password,
        companyName: nomeEmpresa,
        instanceName: instanceName,
        chatWootUrl: CHATWOOT_URL
      }
    });

  } catch (error) {
    console.error('Erro no processo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});