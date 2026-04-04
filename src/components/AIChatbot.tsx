'use client'

import { useState, useRef, useEffect } from 'react'

type Message = {
  role: 'user' | 'model'
  content: string
}

const TEMPLATES = [
  "Evaluate my spending pace this month.",
  "What is the best way to reduce my debt quickly?",
  "Should I prioritize saving or paying off debt?",
  "How can I stick to the 50/30/20 rule?",
]

export function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Hello! I'm your DANAROUTE AI Financial Advisor. How can I help you achieve your financial goals today?"
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim()) return

    const userMsg: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      // Send the entire conversation history (excluding the first greeting if desired, but we'll send it all)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      })

      if (!res.ok) throw new Error('Failed to send message')

      const data = await res.json()
      if (data.text) {
        setMessages(prev => [...prev, { role: 'model', content: data.text }])
      } else {
        setMessages(prev => [...prev, { role: 'model', content: "Sorry, I couldn't generate a response." }])
      }
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: 'model', content: "An error occurred while reaching the server. Please try again later." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[800px] w-full max-w-[900px] mx-auto bg-white rounded-2xl border border-gray-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-gray-100 bg-gray-50/50">
        <div>
          <h2 className="font-bold text-gray-900 text-[16px]">DANAROUTE AI Chat</h2>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-5 pb-8 space-y-6 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed relative ${msg.role === 'user'
              ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm'
              : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
              }`}>
              {/* Parse basic markdown safely or just display text. For real markdown, consider react-markdown. 
                  We will keep it simple with white-space pre-wrap. */}
              <div className="whitespace-pre-wrap">
                {msg.content.replace(/\*\*(.*?)\*\*/g, '$1')}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-500 border border-gray-200 rounded-2xl rounded-tl-sm px-5 py-3 text-[14px] flex items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
              <span>Typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area & Templates */}
      <div className="p-4 bg-white border-t border-gray-100">
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-4 px-1">
            {TEMPLATES.map((tmpl, i) => (
              <button
                key={i}
                onClick={() => sendMessage(tmpl)}
                className="text-left text-[13px] bg-blue-50/80 hover:bg-blue-100 text-blue-700 border border-blue-200/50 rounded-full py-2 px-4 transition-colors truncate max-w-full"
              >
                {tmpl}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-3 items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your financial question..."
            disabled={isLoading}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all flex-shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1 -mt-0.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>

    </div>
  )
}
