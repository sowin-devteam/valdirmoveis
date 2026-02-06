import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verifica se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('valdir_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  async function signIn(email, password) {
    try {
      // Busca o usuário na tabela usuarios
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('senha', password)
        .single()

      if (error || !data) {
        return { error: 'Email ou senha incorretos' }
      }

      // Salva o usuário no state e localStorage
      setUser(data)
      localStorage.setItem('valdir_user', JSON.stringify(data))

      return { data }
    } catch (err) {
      return { error: 'Erro ao fazer login' }
    }
  }

  function signOut() {
    setUser(null)
    localStorage.removeItem('valdir_user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
