import React, { useState } from 'react';
import { User, Mail, Phone, Building, Loader2, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';

interface FormData {
  nome: string;
  email: string;
  whatsapp: string;
  nomeEmpresa: string;
}

interface FormErrors {
  nome?: string;
  email?: string;
  whatsapp?: string;
  nomeEmpresa?: string;
}

interface CreationResult {
  email: string;
  password: string;
  companyName: string;
  instanceName: string;
  chatWootUrl: string;
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    whatsapp: '',
    nomeEmpresa: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CreationResult | null>(null);
  const [error, setError] = useState<string>('');

  // Função para normalizar acentos (converter para equivalente sem acento)
  const normalizeAccents = (text: string): string => {
    const accentMap: { [key: string]: string } = {
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
  };

  // Função para validar nome da empresa
  const validateCompanyName = (name: string): string | undefined => {
    if (!name.trim()) {
      return 'Nome da empresa é obrigatório';
    }
    
    return undefined;
  };

  // Função para gerar preview do nome da instância
  const generateInstancePreview = (companyName: string): string => {
    return normalizeAccents(companyName)
      .toLowerCase() // Converte para minúsculas
      .replace(/\s+/g, '') // Remove espaços
      .replace(/[^a-z0-9]/g, '') // Remove caracteres especiais (mantém apenas letras minúsculas e números)
      .substring(0, 20); // Limita a 20 caracteres
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo quando o usuário começa a digitar
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validação do nome - apenas verificar se não está vazio
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    // Validação do email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    // Validação do WhatsApp - apenas verificar se não está vazio
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'WhatsApp é obrigatório';
    }
    
    // Validação do nome da empresa
    const companyError = validateCompanyName(formData.nomeEmpresa);
    if (companyError) {
      newErrors.nomeEmpresa = companyError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:3002/api/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        // Mostra detalhes se existirem
        setError(data.details ? (Array.isArray(data.details) ? data.details.join(', ') : data.details) : (data.error || 'Erro desconhecido'));
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      whatsapp: '',
      nomeEmpresa: ''
    });
    setErrors({});
    setResult(null);
    setError('');
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-100">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Conta criada com sucesso!
            </h2>
            <p className="text-gray-600">
              Sua conta ChatWoot e instância Evolution foram configuradas
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-1">Acesso ao ChatWoot:</p>
              <a 
                href={result.chatWootUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
              >
                {result.chatWootUrl}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-2">Dados de Login:</p>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Email: </span>
                  <span className="text-sm font-mono font-medium text-gray-900">{result.email}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Senha: </span>
                  <span className="text-sm font-mono font-medium text-gray-900 bg-yellow-100 px-2 py-1 rounded">
                    {result.password}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-900 mb-1">Empresa:</p>
              <p className="text-sm text-green-800">{result.companyName}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-purple-900 mb-1">Instância Evolution:</p>
              <p className="text-sm font-mono text-purple-800">{result.instanceName}</p>
            </div>
          </div>

          <button
            onClick={resetForm}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Criar Nova Conta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-100">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Building className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Cadastro ChatWoot + Evolution
          </h1>
          <p className="text-gray-600">
            Crie sua conta e instância automaticamente
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.nome ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="Seu nome completo"
              />
            </div>
            {errors.nome && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.nome}</span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="seu@email.com"
              />
            </div>
            {errors.email && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.whatsapp ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="+55 11 99999-9999"
              />
            </div>
            {errors.whatsapp && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.whatsapp}</span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="nomeEmpresa" className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Empresa
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="nomeEmpresa"
                name="nomeEmpresa"
                value={formData.nomeEmpresa}
                onChange={handleInputChange}
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.nomeEmpresa ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="Nome da sua empresa"
              />
            </div>
            {errors.nomeEmpresa && (
              <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.nomeEmpresa}</span>
              </div>
            )}
            {formData.nomeEmpresa && !errors.nomeEmpresa && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 font-medium">Preview da instância:</p>
                <p className="text-sm text-blue-800 font-mono">
                  {generateInstancePreview(formData.nomeEmpresa)}
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Ao criar a conta, você concorda com nossos termos de uso
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;