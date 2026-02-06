import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const autoLoginAttempted = useRef(false)

  // Redireciona para /admin se já estiver logado
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/admin')
    }
  }, [user, authLoading, navigate])

  // Login automático via parâmetros de URL
  useEffect(() => {
    const urlEmail = searchParams.get('email')
    const urlPassword = searchParams.get('password')

    if (urlEmail && urlPassword && !autoLoginAttempted.current) {
      autoLoginAttempted.current = true
      setEmail(urlEmail)
      setPassword(urlPassword)

      // Executa o login automático
      handleAutoLogin(urlEmail, urlPassword)
    }
  }, [searchParams])

  async function handleAutoLogin(autoEmail, autoPassword) {
    setLoading(true)
    setError('')

    const { error } = await signIn(autoEmail, autoPassword)

    if (error) {
      setError(error)
      setLoading(false)
    } else {
      navigate('/admin')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error)
      setLoading(false)
    } else {
      navigate('/admin')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center mb-4">
          <img src="/logo-valdir.png" alt="Valdir" className="h-16" />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Gerenciador de Produtos
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
