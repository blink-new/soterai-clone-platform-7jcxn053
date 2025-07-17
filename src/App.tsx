import { useState, useEffect } from 'react'
import { blink } from './lib/blink'
import { Dashboard } from './components/Dashboard'
import { LoadingScreen } from './components/LoadingScreen'

interface User {
  id: string
  email: string
  displayName?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">SoterAI</h1>
            <p className="text-gray-600">Vertical Agent Platform</p>
          </div>
          <button
            onClick={() => blink.auth.login()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    )
  }

  return <Dashboard user={user} />
}

export default App