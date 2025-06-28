const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Obter a URL do ChatWoot da variável de ambiente
  if (!process.env.CHATWOOT_URL) {
    throw new Error('CHATWOOT_URL não definida nas variáveis de ambiente');
  }
  if (!process.env.EVOLUTION_URL) {
    throw new Error('EVOLUTION_URL não definida nas variáveis de ambiente');
  }
  const CHATWOOT_URL = process.env.CHATWOOT_URL;
  const EVOLUTION_URL = process.env.EVOLUTION_URL;

  // Funções utilitárias
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
      '&': 'e'
    };
    return text.split('').map(char => accentMap[char] || char).join('');
  }

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
      password = '';
      password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
      password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
      password += numbers.charAt(Math.floor(Math.random() * numbers.length));
      password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
      for (let i = 4; i < 12; i++) {
        password += allChars.charAt(Math.floor(Math.random() * allChars.length));
      }
      password = password.split('').sort(() => Math.random() - 0.5).join('');
    } while (!hasAllTypes(password));
    return password;
  }

  function cleanAndNormalizeData(data) {
    return {
      nome: data.nome.trim(),
      email: data.email.trim().toLowerCase(),
      whatsapp: data.whatsapp.trim(),
      nomeEmpresa: data.nomeEmpresa.trim()
    };
  }

  async function makeRequest(url, options) {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
    }
    return data;
  }

  try {
    const cleanedData = cleanAndNormalizeData(req.body);
    const { nome, email, whatsapp, nomeEmpresa } = cleanedData;

    if (!nome || !email || !whatsapp || !nomeEmpresa) {
      return res.status(400).json({
        success: false,
        error: 'Todos os campos são obrigatórios',
        received: { nome, email, whatsapp, nomeEmpresa }
      });
    }

    const errors = [];
    if (nome.length < 1) errors.push('Nome é obrigatório');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email inválido');
    if (whatsapp.length < 1) errors.push('WhatsApp é obrigatório');
    if (nomeEmpresa.length < 1) errors.push('Nome da empresa é obrigatório');
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors
      });
    }

    const password = generateRandomPassword();

    // 1. Criar empresa no ChatWoot
    const companyPayload = { name: nomeEmpresa, locale: 'pt_BR' };
    const company = await makeRequest(`${CHATWOOT_URL}/platform/api/v1/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_access_token': process.env.CHATWOOT_API_KEY
      },
      body: JSON.stringify(companyPayload)
    });

    // 2. Criar usuário no ChatWoot
    const userPayload = { email, name: nome, password };
    const user = await makeRequest(`${CHATWOOT_URL}/platform/api/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_access_token': process.env.CHATWOOT_API_KEY
      },
      body: JSON.stringify(userPayload)
    });

    // 3. Definir usuário como administrador
    const adminPayload = { user_id: user.id, role: 'administrator' };
    const adminRole = await makeRequest(`${CHATWOOT_URL}/platform/api/v1/accounts/${company.id}/account_users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_access_token': process.env.CHATWOOT_API_KEY
      },
      body: JSON.stringify(adminPayload)
    });

    // 4. Criar instância na Evolution API
    const instanceName = normalizeAccents(nomeEmpresa)
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);

    if (instanceName.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Nome da empresa gera uma instância muito curta após limpeza',
        details: ['O nome da empresa deve gerar pelo menos 2 caracteres válidos para a instância']
      });
    }

    const evolutionPayload = {
      instanceName,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS'
    };
    const evolutionInstance = await makeRequest(`${EVOLUTION_URL}/instance/create`, {
      method: 'POST',
      headers: {
        'apikey': process.env.EVOLUTION_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(evolutionPayload)
    });

    // 5. Integrar ChatWoot com Evolution
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
    await makeRequest(`${EVOLUTION_URL}/chatwoot/set/${instanceName}`, {
      method: 'POST',
      headers: {
        'apikey': process.env.EVOLUTION_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(integrationPayload)
    });

    // Sucesso!
    res.status(200).json({
      success: true,
      message: 'Conta criada com sucesso!',
      data: {
        email,
        password,
        companyName: nomeEmpresa,
        instanceName,
        chatWootUrl: CHATWOOT_URL
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
} 