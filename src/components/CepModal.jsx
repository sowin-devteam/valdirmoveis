import { useState, useEffect } from 'react'

// Cidades atendidas (normalizadas para comparacao)
const CIDADES_ATENDIDAS = [
  'itajai',
  'tijucas',
  'barra velha',
  'itapema',
  'balneario camboriu',
  'camboriu',
  'penha',
  'picarras',
  'navegantes',
  'sao francisco do sul',
  'joinville',
  'jaragua do sul',
  'blumenau',
  'brusque',
  'itinga',
  'garuva',
  'itapoa'
]

// Normaliza string para comparacao (remove acentos e converte para minusculo)
function normalizarCidade(cidade) {
  return cidade
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

// Verifica se a cidade e atendida
function cidadeAtendida(cidade) {
  const cidadeNormalizada = normalizarCidade(cidade)
  return CIDADES_ATENDIDAS.some(c => cidadeNormalizada.includes(c) || c.includes(cidadeNormalizada))
}

// Coordenadas das lojas
const LOJAS = {
  cordeiros: {
    nome: 'Cordeiros',
    endereco: 'R. Dr. Reinaldo Schmithausen, 1429 - Cordeiros, Itajai - SC',
    cep: '88310-002',
    lat: -26.9147,
    lng: -48.6897,
    whatsapp: '5547999254612'
  },
  saoVicente: {
    nome: 'Sao Vicente',
    endereco: 'R. Estefano Jose Vanolli, 1088 - Sao Vicente, Itajai - SC',
    cep: '88309-202',
    lat: -26.9283,
    lng: -48.7125,
    whatsapp: '554731701328'
  }
}

// Calcula distancia entre duas coordenadas usando formula de Haversine
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371 // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export default function CepModal({ onLojaSelected, lojaAtual, onClose }) {
  const [cep, setCep] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [endereco, setEndereco] = useState(null)
  const [lojaProxima, setLojaProxima] = useState(lojaAtual || null)
  const [buscandoLoja, setBuscandoLoja] = useState(false)
  const [cidadeNaoAtendida, setCidadeNaoAtendida] = useState(false)
  const [mostrarInputCep, setMostrarInputCep] = useState(!lojaAtual)

  // Formata o CEP enquanto digita
  function formatarCep(valor) {
    const numeros = valor.replace(/\D/g, '')
    if (numeros.length <= 5) return numeros
    return `${numeros.slice(0, 5)}-${numeros.slice(5, 8)}`
  }

  function handleCepChange(e) {
    const formatted = formatarCep(e.target.value)
    setCep(formatted)
    setError('')
    setEndereco(null)
    setLojaProxima(null)
    setCidadeNaoAtendida(false)
  }

  async function buscarCep() {
    const cepLimpo = cep.replace(/\D/g, '')

    if (cepLimpo.length !== 8) {
      setError('Digite um CEP valido com 8 digitos')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Busca endereco pelo ViaCEP
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()

      if (data.erro) {
        setError('CEP nao encontrado')
        setLoading(false)
        return
      }

      setEndereco(data)

      // Verifica se a cidade e atendida
      if (!cidadeAtendida(data.localidade)) {
        setCidadeNaoAtendida(true)
        setLoading(false)
        return
      }

      // Agora busca as coordenadas do endereco para calcular distancia
      setBuscandoLoja(true)
      await encontrarLojaMaisProxima(data)

    } catch (err) {
      setError('Erro ao buscar CEP. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function encontrarLojaMaisProxima(enderecoData) {
    try {
      // Monta o endereco para geocoding
      const enderecoCompleto = `${enderecoData.logradouro}, ${enderecoData.bairro}, ${enderecoData.localidade}, ${enderecoData.uf}, Brasil`

      // Usa Nominatim (OpenStreetMap) para geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}&limit=1`,
        {
          headers: {
            'User-Agent': 'ValdirMoveis/1.0'
          }
        }
      )

      const data = await response.json()

      let lojaMaisProxima = LOJAS.cordeiros // Default

      if (data && data.length > 0) {
        const clienteLat = parseFloat(data[0].lat)
        const clienteLng = parseFloat(data[0].lon)

        const distCordeiros = calcularDistancia(
          clienteLat, clienteLng,
          LOJAS.cordeiros.lat, LOJAS.cordeiros.lng
        )

        const distSaoVicente = calcularDistancia(
          clienteLat, clienteLng,
          LOJAS.saoVicente.lat, LOJAS.saoVicente.lng
        )

        lojaMaisProxima = distCordeiros <= distSaoVicente
          ? LOJAS.cordeiros
          : LOJAS.saoVicente
      } else {
        // Se nao conseguir geocoding, usa o CEP para decidir
        // CEPs 88310-xxx sao mais proximos de Cordeiros
        // CEPs 88309-xxx sao mais proximos de Sao Vicente
        const cepPrefix = enderecoData.cep.replace('-', '').slice(0, 5)
        lojaMaisProxima = parseInt(cepPrefix) >= 88310
          ? LOJAS.cordeiros
          : LOJAS.saoVicente
      }

      setLojaProxima(lojaMaisProxima)
      setMostrarInputCep(false)

    } catch (err) {
      console.error('Erro ao buscar coordenadas:', err)
      // Fallback: usa Cordeiros como padrao
      setLojaProxima(LOJAS.cordeiros)
      setMostrarInputCep(false)
    } finally {
      setBuscandoLoja(false)
    }
  }

  function confirmarLoja() {
    if (lojaProxima) {
      localStorage.setItem('valdir_loja', JSON.stringify(lojaProxima))
      onLojaSelected(lojaProxima)
    }
  }

  function selecionarOutraLoja(loja) {
    setLojaProxima(loja)
  }

  function pularSelecao() {
    // Usa Cordeiros como padrao
    const lojaDefault = LOJAS.cordeiros
    localStorage.setItem('valdir_loja', JSON.stringify(lojaDefault))
    onLojaSelected(lojaDefault)
  }

  function handleAlterarCep() {
    setMostrarInputCep(true)
    setLojaProxima(null)
    setEndereco(null)
    setCep('')
    setCidadeNaoAtendida(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:rounded-2xl shadow-2xl md:w-full md:max-w-md overflow-hidden flex flex-col"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="p-4 md:p-6 text-center flex-shrink-0 relative" style={{ backgroundColor: '#003DA5' }}>
          {/* Botao fechar - so aparece se ja tem loja */}
          {lojaAtual && (
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <img src="/logo-valdir.png" alt="Valdir Moveis" className="h-10 md:h-12 mx-auto brightness-0 invert mb-2" />
          <h2 className="text-lg md:text-xl font-bold text-white">
            {lojaAtual ? 'Sua Loja' : 'Bem-vindo!'}
          </h2>
          <p className="text-blue-100 text-xs md:text-sm mt-1">
            {lojaAtual ? 'Selecione a loja de sua preferencia' : 'Digite seu CEP para encontrarmos a loja mais proxima'}
          </p>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 flex-1 overflow-y-auto">
          {/* Cidade nao atendida */}
          {cidadeNaoAtendida && endereco ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Ainda nao entregamos em {endereco.localidade}
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  Infelizmente sua regiao ainda nao faz parte da nossa area de entrega.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <p className="text-xs text-gray-500 mb-2">Cidades atendidas:</p>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Itajai, Tijucas, Barra Velha, Itapema, Balneario Camboriu, Camboriu, Penha, Picarras, Navegantes, Sao Francisco do Sul, Joinville, Jaragua do Sul, Blumenau, Brusque, Itinga, Garuva e Itapoa.
                </p>
              </div>
              <button
                onClick={() => {
                  setCidadeNaoAtendida(false)
                  setEndereco(null)
                  setCep('')
                }}
                className="w-full py-2.5 rounded-lg font-medium text-white"
                style={{ backgroundColor: '#003DA5' }}
              >
                Tentar outro CEP
              </button>
              <button
                onClick={pularSelecao}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Continuar mesmo assim
              </button>
            </div>
          ) : (lojaProxima && !buscandoLoja && !mostrarInputCep) ? (
            <div className="space-y-4">
              {/* Localizacao do cliente */}
              {endereco ? (
                <div className="text-center pb-3 border-b border-gray-100">
                  <p className="text-xs text-gray-500">Sua localizacao</p>
                  <p className="font-medium text-gray-800">
                    {endereco.localidade} - {endereco.uf}
                  </p>
                  <button
                    onClick={handleAlterarCep}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                  >
                    Alterar CEP
                  </button>
                </div>
              ) : (
                <div className="text-center pb-3 border-b border-gray-100">
                  <button
                    onClick={handleAlterarCep}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Buscar por CEP
                  </button>
                </div>
              )}

              <p className="text-sm font-medium text-gray-700 text-center">
                {endereco ? 'Loja mais proxima de voce:' : 'Selecione sua loja:'}
              </p>

              {/* Opcoes de loja */}
              <div className="space-y-2">
                {Object.values(LOJAS).map((loja) => (
                  <button
                    key={loja.nome}
                    onClick={() => selecionarOutraLoja(loja)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      lojaProxima.nome === loja.nome
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 flex items-center gap-1.5 text-sm">
                          <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#003DA5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {loja.nome}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-tight">{loja.endereco}</p>
                      </div>
                      {lojaProxima.nome === loja.nome && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#00FF00' }}
                        >
                          <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Botao confirmar */}
              <button
                onClick={confirmarLoja}
                className="w-full py-2.5 md:py-3 rounded-lg font-bold text-white transition-colors"
                style={{ backgroundColor: '#003DA5' }}
              >
                Confirmar Loja
              </button>
            </div>
          ) : (
            <>
              {/* Input CEP */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seu CEP
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cep}
                    onChange={handleCepChange}
                    placeholder="00000-000"
                    maxLength={9}
                    className="flex-1 px-3 py-2.5 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base md:text-lg"
                    onKeyDown={(e) => e.key === 'Enter' && buscarCep()}
                  />
                  <button
                    onClick={buscarCep}
                    disabled={loading || cep.length < 9}
                    className="px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#00FF00', color: '#000' }}
                  >
                    {loading ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                    ) : 'Buscar'}
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>

              {/* Buscando loja */}
              {buscandoLoja && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <svg className="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span className="text-gray-600 text-sm">Encontrando loja mais proxima...</span>
                </div>
              )}

              {/* Pular ou Voltar */}
              {!buscandoLoja && (
                lojaAtual ? (
                  <button
                    onClick={() => {
                      setMostrarInputCep(false)
                      setLojaProxima(lojaAtual)
                    }}
                    className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Voltar
                  </button>
                ) : (
                  <button
                    onClick={pularSelecao}
                    className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Pular e escolher depois
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
