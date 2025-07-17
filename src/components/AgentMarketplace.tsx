import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

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

interface AgentMarketplaceProps {
  agents: Agent[]
  onDeploy: (agent: Agent) => void
}

export function AgentMarketplace({ agents, onDeploy }: AgentMarketplaceProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', ...Array.from(new Set(agents.map(agent => agent.category)))]

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getPricingColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-green-100 text-green-800'
      case 'pro': return 'bg-blue-100 text-blue-800'
      case 'enterprise': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Agent Marketplace</h2>
        <div className="flex space-x-4">
          <Input
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{agent.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription>{agent.category}</CardDescription>
                  </div>
                </div>
                <Badge className={getPricingColor(agent.pricingTier)}>
                  {agent.pricingTier}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{agent.description}</p>
              
              <div>
                <h4 className="font-medium text-sm text-gray-900 mb-2">Key Capabilities</h4>
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.slice(0, 3).map((capability, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                  {agent.capabilities.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{agent.capabilities.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-900 mb-2">Use Cases</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {agent.useCases.slice(0, 2).map((useCase, index) => (
                    <li key={index}>• {useCase}</li>
                  ))}
                  {agent.useCases.length > 2 && (
                    <li>• +{agent.useCases.length - 2} more use cases</li>
                  )}
                </ul>
              </div>

              <Button
                onClick={() => onDeploy(agent)}
                className="w-full"
              >
                Deploy Agent
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No agents found</h3>
          <p className="text-gray-600">Try adjusting your search or category filter</p>
        </div>
      )}
    </div>
  )
}