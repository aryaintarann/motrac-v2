import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, aiRateLimiter } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization') || ''
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY: Rate limiting for AI endpoint
    const { success } = await rateLimit(user.id, aiRateLimiter)
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { income } = body
    
    if (!income) {
       return NextResponse.json({ error: 'Income is required' }, { status: 400 })
    }

    // Fetch active debts
    const { data: debts } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', user.id)
      .eq('direction', 'i_owe')
    
    const totalDebt = debts?.reduce((sum, d) => sum + Number(d.principal), 0) || 0

    const prompt = `
You are an expert financial advisor. The user has a monthly income of ${income} IDR.
They currently have an outstanding total debt of ${totalDebt} IDR.

Your task is to recommend a tailored monthly budget allocation (Needs, Wants, Savings, Debt_Repayment).
- If the 50/30/20 rule (50% Needs, 30% Wants, 20% Savings) is realistic and healthy given their debt, use it.
- If they have significant debt, consider carving out a "Debt_Repayment" portion by reducing Wants or Savings.
- The sum of needs, wants, savings, and debt_repayment MUST EXACTLY equal ${income}.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "needs": number,
  "wants": number,
  "savings": number,
  "debt": number,
  "reason": "A 1-to-2 sentence encouraging explanation of why you chose this allocation."
}
`

    // SECURITY: Use API key in header instead of URL
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
    
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: 0.2, 
          responseMimeType: "application/json" 
        }
      })
    })

    if (!aiResponse.ok) {
        throw new Error('Failed to reach AI')
    }

    const data = await aiResponse.json()
    const insightText = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!insightText) {
       throw new Error('Empty AI response')
    }

    const allocation = JSON.parse(insightText)

    // Calculate Rollovers (Hybrid Strategy: leftover Needs -> Savings, leftover Wants -> Wants)
    const today = new Date()
    const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const prevMonthStr = prevMonthDate.toISOString().slice(0, 7) // YYYY-MM
    
    const { data: prevBudget } = await supabase.from('budgets').select('*').like('month', `${prevMonthStr}%`).limit(1).maybeSingle()
    const { data: prevTxns } = await supabase
      .from('transactions')
      .select('amount, type, categories(budget_type)')
      .gte('date', `${prevMonthStr}-01T00:00:00Z`)
      .lt('date', `${new Date().toISOString().slice(0, 7)}-01T00:00:00Z`)

    let rolloverNeeds = 0
    let rolloverWants = 0

    if (prevBudget) {
      const allPrevTxns = prevTxns || []
      const spentNeeds = allPrevTxns.filter(t => t.type === 'expense' && (t.categories as any)?.budget_type === 'needs').reduce((sum, t) => sum + Number(t.amount), 0)
      const spentWants = allPrevTxns.filter(t => t.type === 'expense' && (t.categories as any)?.budget_type === 'wants').reduce((sum, t) => sum + Number(t.amount), 0)

      rolloverNeeds = Math.max(0, Number(prevBudget.needs_amount) - spentNeeds)
      rolloverWants = Math.max(0, Number(prevBudget.wants_amount) - spentWants)

      // Apply Hybrid Strategy
      allocation.savings += rolloverNeeds
      allocation.wants += rolloverWants

      // Add explanation if there's rollover
      if (rolloverNeeds > 0 || rolloverWants > 0) {
        const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
        let rolloverMsg = " Includes rollover from last month: "
        const parts = []
        if (rolloverNeeds > 0) parts.push(`saved ${formatter.format(rolloverNeeds)} from unspent Needs`)
        if (rolloverWants > 0) parts.push(`${formatter.format(rolloverWants)} unspent Wants kept for this month`)
        
        allocation.reason += rolloverMsg + parts.join(' and ') + '.'
      }
    }

    return NextResponse.json({ success: true, allocation, rollover: { needsToSavings: rolloverNeeds, wantsToWants: rolloverWants } })
    
  } catch (err: any) {
    console.error('AI Allocation Error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
