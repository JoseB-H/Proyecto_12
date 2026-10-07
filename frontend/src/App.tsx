import { useEffect, useMemo, useState } from 'react'
import './App.css'

type AuthMode = 'register' | 'login'

type User = {
  user_id: string
  email: string
  full_name: string
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const samplePrompts = [
  '¿Cómo mejorar la experiencia de onboarding sin reemplazar al equipo?',
  '¿Qué pasos seguir para implementar IA de forma responsable en una empresa?',
  '¿Qué métricas debe revisar un equipo antes de escalar una solución de IA?',
]

function App() {
  const [authMode, setAuthMode] = useState<AuthMode>('register')
  const [token, setToken] = useState<string | null>(localStorage.getItem('yitetsuai_token'))
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState('Conectando con la API...')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registerForm, setRegisterForm] = useState({
    email: 'demo@yitetsu.ai',
    password: 'secret123',
    full_name: 'Demo User',
  })
  const [loginForm, setLoginForm] = useState({
    email: 'demo@yitetsu.ai',
    password: 'secret123',
  })
  const [chatPrompt, setChatPrompt] = useState(samplePrompts[0])
  const [chatResponse, setChatResponse] = useState('')

  const isAuthenticated = useMemo(() => Boolean(token), [token])

  const setAuthToken = (newToken: string | null) => {
    setToken(newToken)
    if (newToken) {
      localStorage.setItem('yitetsuai_token', newToken)
      return
    }
    localStorage.removeItem('yitetsuai_token')
  }

  const fetchJson = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data?.detail || 'La petición falló')
    }
    return data
  }

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await fetchJson(`${API_BASE}/health`)
        setStatus(`API conectada: ${data.status}`)
      } catch (err) {
        setStatus('La API no responde en localhost:8000')
      }
    }

    checkHealth()
  }, [])

  useEffect(() => {
    const loadMe = async () => {
      if (!token) {
        setUser(null)
        return
      }

      try {
        const me = await fetchJson(`${API_BASE}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setUser(me)
      } catch (error) {
        setAuthToken(null)
        setUser(null)
      }
    }

    loadMe()
  }, [token])

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await fetchJson(`${API_BASE}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(registerForm),
      })
      setAuthToken(data.token)
      setStatus(`Registro exitoso para ${data.email}`)
      setUser({
        user_id: data.user_id,
        email: data.email,
        full_name: registerForm.full_name,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await fetchJson(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(loginForm),
      })
      setAuthToken(data.token)
      setStatus(`Sesión iniciada para ${data.email}`)
      setUser({
        user_id: data.user_id,
        email: data.email,
        full_name: user?.full_name || 'Usuario',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  const handleChat = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await fetchJson(`${API_BASE}/chat`, {
        method: 'POST',
        body: JSON.stringify({ prompt: chatPrompt }),
      })
      setChatResponse(data.response)
      setStatus('Respuesta validada con criterio ético y audit log')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo consultar la IA')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">AI para potenciar personas</p>
          <h1>YitetsuAI</h1>
        </div>
        <div className="status-pill">{status}</div>
      </header>

      <main className="grid-layout">
        <section className="panel auth-panel">
          <div className="panel-header">
            <h2>Cuenta</h2>
            {isAuthenticated && user ? (
              <button className="ghost-button" onClick={() => setAuthToken(null)} type="button">
                Cerrar sesión
              </button>
            ) : null}
          </div>

          {!isAuthenticated ? (
            <div className="segmented-control">
              <button
                type="button"
                className={authMode === 'register' ? 'active' : ''}
                onClick={() => setAuthMode('register')}
              >
                Registrarse
              </button>
              <button
                type="button"
                className={authMode === 'login' ? 'active' : ''}
                onClick={() => setAuthMode('login')}
              >
                Iniciar sesión
              </button>
            </div>
          ) : (
            <div className="user-card">
              <div className="avatar">{user?.full_name?.[0]?.toUpperCase() || 'U'}</div>
              <div>
                <p className="label">Usuario autenticado</p>
                <strong>{user?.full_name || 'Usuario'}</strong>
                <p>{user?.email}</p>
              </div>
            </div>
          )}

          {!isAuthenticated && authMode === 'register' ? (
            <form onSubmit={handleRegister} className="form-stack">
              <label>
                Nombre completo
                <input
                  value={registerForm.full_name}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, full_name: event.target.value }))
                  }
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </label>
              <label>
                Contraseña
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, password: event.target.value }))
                  }
                />
              </label>
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? 'Creando...' : 'Crear cuenta'}
              </button>
            </form>
          ) : null}

          {!isAuthenticated && authMode === 'login' ? (
            <form onSubmit={handleLogin} className="form-stack">
              <label>
                Email
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </label>
              <label>
                Contraseña
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((current) => ({ ...current, password: event.target.value }))
                  }
                />
              </label>
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </form>
          ) : null}

          {error ? <p className="error-box">{error}</p> : null}
        </section>

        <section className="panel chat-panel">
          <div className="panel-header">
            <h2>Asistente IA</h2>
          </div>

          <div className="prompt-list">
            {samplePrompts.map((prompt) => (
              <button key={prompt} type="button" className="prompt-chip" onClick={() => setChatPrompt(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleChat} className="chat-form">
            <textarea
              value={chatPrompt}
              onChange={(event) => setChatPrompt(event.target.value)}
              rows={5}
              placeholder="Escribe una pregunta para YitetsuAI..."
            />
            <button className="primary-button" type="submit" disabled={loading || !chatPrompt.trim()}>
              {loading ? 'Consultando...' : 'Consultar IA'}
            </button>
          </form>

          <div className="response-box">
            <p className="label">Respuesta</p>
            <p>{chatResponse || 'La respuesta aparecerá aquí cuando el asistente responda.'}</p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
