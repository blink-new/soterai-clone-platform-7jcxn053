import { useState } from 'react'
import { blink } from '../lib/blink'
import { AgentMarketplace } from './AgentMarketplace'
import { AgentChat } from './AgentChat'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

interface User {
  id: string
  email: string
  displayName?: string
}

interface Agent {
  id: string
  name: string
  description: string
  category: string
  icon: string
  capabilities: string[]
  useCases: string[]
  pricingTier: string
}

interface UserAgent {
  id: string
  agent: Agent
  name: string
  status: string
  createdAt: string
}

const sampleAgents: Agent[] = [
  {
    id: 'healthcare-assistant',
    name: 'Healthcare Assistant',
    description: 'AI agent specialized in healthcare workflows, patient management, and medical documentation',
    category: 'Healthcare',
    icon: '🏥',
    capabilities: ['Patient data analysis', 'Medical documentation', 'Appointment scheduling', 'Symptom assessment', 'Treatment recommendations'],
    useCases: ['Electronic health records', 'Patient triage', 'Medical research', 'Clinical decision support', 'Healthcare automation'],
    pricingTier: 'pro'
  },
  {
    id: 'customer-support',
    name: 'Customer Support Agent',
    description: 'Advanced customer service automation with natural language understanding',
    category: 'Customer Service',
    icon: '🎧',
    capabilities: ['Natural language processing', 'Ticket routing', 'Knowledge base search', 'Sentiment analysis', 'Multi-channel support'],
    useCases: ['24/7 customer support', 'Ticket automation', 'FAQ handling', 'Escalation management', 'Customer insights'],
    pricingTier: 'free'
  },
  {
    id: 'sales-assistant',
    name: 'Sales Assistant',
    description: 'AI sales agent for lead qualification, follow-ups, and deal management',
    category: 'Sales',
    icon: '📈',
    capabilities: ['Lead scoring', 'Email automation', 'CRM integration', 'Sales forecasting', 'Pipeline management'],
    useCases: ['Lead generation', 'Sales automation', 'Customer outreach', 'Deal tracking', 'Performance analytics'],
    pricingTier: 'pro'
  }
]

export function Dashboard({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState('marketplace')
  const [userAgents, setUserAgents] = useState<UserAgent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<UserAgent | null>(null)

  const deployAgent = (agent: Agent) => {
    const newUserAgent: UserAgent = {
      id: `user-agent-${Date.now()}`,
      agent,
      name: `My ${agent.name}`,
      status: 'active',
      createdAt: new Date().toISOString()
    }
    setUserAgents(prev => [...prev, newUserAgent])
    setActiveTab('dashboard')
  }

  const openAgentChat = (userAgent: UserAgent) => {
    setSelectedAgent(userAgent)
    setActiveTab('chat')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">SoterAI</h1>
              <span className="ml-2 text-sm text-gray-500">Vertical Agent Platform</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.email}</span>
              <Button
                variant="outline"
                onClick={() => blink.auth.logout()}
                className="text-sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="marketplace">Agent Marketplace</TabsTrigger>
            <TabsTrigger value="dashboard">My Agents ({userAgents.length})</TabsTrigger>
            <TabsTrigger value="chat" disabled={!selectedAgent}>
              {selectedAgent ? `Chat with ${selectedAgent.name}` : 'Agent Chat'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace">
            <AgentMarketplace agents={sampleAgents} onDeploy={deployAgent} />
          </TabsContent>

          <TabsContent value="dashboard">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">My Deployed Agents</h2>
                <Button onClick={() => setActiveTab('marketplace')}>
                  Deploy New Agent
                </Button>
              </div>

              {userAgents.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No agents deployed yet</h3>
                    <p className="text-gray-600 text-center mb-6">
                      Deploy your first AI agent from the marketplace to get started
                    </p>
                    <Button onClick={() => setActiveTab('marketplace')}>
                      Browse Agent Marketplace
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userAgents.map((userAgent) => (
                    <Card key={userAgent.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{userAgent.agent.icon}</span>
                            <div>
                              <CardTitle className="text-lg">{userAgent.name}</CardTitle>
                              <CardDescription>{userAgent.agent.category}</CardDescription>
                            </div>
                          </div>
                          <Badge variant={userAgent.status === 'active' ? 'default' : 'secondary'}>
                            {userAgent.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">{userAgent.agent.description}</p>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => openAgentChat(userAgent)}
                            className="flex-1"
                          >
                            Chat
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            Configure
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="chat">
            {selectedAgent && (
              <AgentChat
                userAgent={selectedAgent}
                user={user}
                onBack={() => setActiveTab('dashboard')}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}