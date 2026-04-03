import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization') || ''
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { messages } = body
    
    if (!messages || !Array.isArray(messages)) {
       return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    const currentMonth = new Date().toISOString().slice(0, 7)
    const firstDay = `${currentMonth}-01`
    const lastDay = `${currentMonth}-31`

    // Fetch user context
    const [
      { data: accounts },
      { data: debts },
      { data: budgets },
      { data: transactions }
    ] = await Promise.all([
      supabase.from('accounts').select('name, balance, type').eq('user_id', user.id).eq('include_in_net_worth', true),
      supabase.from('debts').select('name, total_amount, remaining_amount, type, status').eq('user_id', user.id).eq('status', 'active'),
      supabase.from('budgets').select('*').eq('user_id', user.id).eq('month', currentMonth).limit(1),
      supabase.from('transactions').select('amount, type, date, description, categories(name, budget_type)').eq('user_id', user.id).gte('date', firstDay).lte('date', lastDay)
    ])

    const recentBudget = budgets?.[0] || null;

    const systemPrompt = `You are Motrac AI, an expert, friendly, and concise financial advisor. Always format your responses clearly using Markdown.
Here is the user's current financial context (DO NOT mention these exact records unless asked, just use them to provide accurate answers):
- ACCOUNTS: ${JSON.stringify(accounts || [])}
- ACTIVE DEBTS: ${JSON.stringify(debts || [])}
- CURRENT MONTH BUDGET (${currentMonth}): ${JSON.stringify(recentBudget || {})}
- TRANSACTIONS THIS MONTH: ${JSON.stringify(transactions || [])}

Analyze their spending, debts, and budget to give tailored, actionable advice without asking questions about data you already possess.`
    
    // Format messages for Gemini directly (using REST API)
    // Gemini expects: { contents: [{ role: "user" | "model", parts: [{ text: "..." }] }] }
    const formattedContents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))
    
    // Prepend system prompt to the first user message or as a separate system instruction if supported
    // For simplicity with gemini-2.5-flash via REST, we use systemInstruction field
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`
    
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: formattedContents,
        generationConfig: { 
          temperature: 0.5, 
        }
      })
    })

    if (!aiResponse.ok) {
       const err = await aiResponse.text()
       console.error("Gemini API Error:", err)
       throw new Error('Failed to reach AI provider')
    }

    const data = await aiResponse.json()
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response."
    
    return NextResponse.json({ text: responseText })
    
  } catch (err: any) {
    console.error('Chat API Error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

