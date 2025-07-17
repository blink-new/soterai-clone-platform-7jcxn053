import { useState, useRef, useEffect } from 'react'
import { blink } from '../lib/blink'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { ArrowLeft, Send, Bot, User } from 'lucide-react'

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

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AgentChatProps {
  userAgent: UserAgent
  user: User
  onBack: () => void
}

export function AgentChat({ userAgent, user, onBack }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your ${userAgent.agent.name}. I'm specialized in ${userAgent.agent.category.toLowerCase()} and can help you with ${userAgent.agent.capabilities.slice(0, 3).join(', ').toLowerCase()}, and more. How can I assist you today?`,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const getAgentSystemPrompt = (agent: Agent) => {
    return `You are a ${agent.name}, an AI agent specialized in ${agent.category}. 

Your key capabilities include:
${agent.capabilities.map(cap => `- ${cap}`).join('\n')}

You are designed to help with these use cases:
${agent.useCases.map(useCase => `- ${useCase}`).join('\n')}

Please respond in a professional, helpful manner that reflects your specialization in ${agent.category}. Keep responses concise but informative. Always stay in character as a ${agent.category.toLowerCase()} specialist.`
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const systemPrompt = getAgentSystemPrompt(userAgent.agent)
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      let assistantResponse = ''
      
      await blink.ai.streamText(
        {
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory
          ],
          model: 'gpt-4o-mini',
          maxTokens: 500
        },
        (chunk) => {
          assistantResponse += chunk
          setMessages(prev => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            
            if (lastMessage && lastMessage.role === 'assistant' && lastMessage.id === 'streaming') {
              lastMessage.content = assistantResponse
            } else {
              newMessages.push({
                id: 'streaming',
                role: 'assistant',
                content: assistantResponse,
                timestamp: new Date()
              })
            }
            return newMessages
          })
        }
      )

      // Update the streaming message with final ID
      setMessages(prev => {
        const newMessages = [...prev]
        const lastMessage = newMessages[newMessages.length - 1]
        if (lastMessage && lastMessage.id === 'streaming') {
          lastMessage.id = Date.now().toString()
        }
        return newMessages
      })

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{userAgent.agent.icon}</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{userAgent.name}</h2>
              <p className="text-gray-600">{userAgent.agent.category} • {userAgent.agent.pricingTier}</p>
            </div>
          </div>
        </div>
        <Badge variant={userAgent.status === 'active' ? 'default' : 'secondary'}>
          {userAgent.status}
        </Badge>
      </div>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>Chat with {userAgent.agent.name}</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.role === 'assistant' && (
                        <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      {message.role === 'user' && (
                        <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask your ${userAgent.agent.name} anything...`}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Info Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {userAgent.agent.capabilities.map((capability, index) => (
                <Badge key={index} variant="secondary" className="mr-2 mb-2">
                  {capability}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Use Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-600 space-y-1">
              {userAgent.agent.useCases.map((useCase, index) => (
                <li key={index}>• {useCase}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Agent Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <Badge variant={userAgent.status === 'active' ? 'default' : 'secondary'}>
                {userAgent.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Deployed:</span>
              <span className="text-sm">{new Date(userAgent.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pricing:</span>
              <Badge className={
                userAgent.agent.pricingTier === 'free' ? 'bg-green-100 text-green-800' :
                userAgent.agent.pricingTier === 'pro' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }>
                {userAgent.agent.pricingTier}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}