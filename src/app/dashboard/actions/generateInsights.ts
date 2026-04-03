'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function generateInsights() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing from environment variables.')
  }

  // 1. Get current month budget
  const currentMonthStr = new Date().toISOString().slice(0, 7) // YYYY-MM
  const { data: budget } = await supabase.from('budgets').select('*').eq('user_id', user.id).eq('month', currentMonthStr).single()

  if (!budget) {
    throw new Error('Please set up your budget for this month first before generating insights.')
  }

  // 2. Map categories to their budget groups
  const { data: allCats } = await supabase.from('categories').select('id, parent_id, budget_type').eq('user_id', user.id)
  const cats = allCats || []
  
  // Create a mapping from category_id -> budget_type 
  // If it has a parent, trace it to the parent's budget_type
  const findBudgetType = (catId: string): string => {
    const c = cats.find(x => x.id === catId)
    if (!c) return 'other'
    if (c.budget_type) return c.budget_type // Top level
    if (c.parent_id) {
       const p = cats.find(x => x.id === c.parent_id)
       if (p?.budget_type) return p.budget_type
    }
    return 'other'
  }

  // 3. Get all transactions for this month
  const { data: txns } = await supabase.from('transactions')
    .select('amount, type, category_id')
    .eq('user_id', user.id)
    .gte('date', `${currentMonthStr}-01T00:00:00Z`)

  let needsSpent = 0
  let wantsSpent = 0
  let savingsSpent = 0;
  
  ;(txns || []).forEach((t: any) => {
     if (t.type === 'expense' && t.category_id) {
        const bType = findBudgetType(t.category_id)
        if (bType === 'needs') needsSpent += +t.amount
        if (bType === 'wants') wantsSpent += +t.amount
        if (bType === 'savings') savingsSpent += +t.amount
     }
  })

  const frm = (num: any) => `Rp ${(parseFloat(num) / 1000).toFixed(0)}k`

  const prompt = `
You are Motrac's expert AI Financial Advisor. The user is using the 50/30/20 budgeting rule.
Here is the user's data for this month (${currentMonthStr}):
- Needs: Budget ${frm(budget.needs_amount)} | Spent ${frm(needsSpent)}
- Wants: Budget ${frm(budget.wants_amount)} | Spent ${frm(wantsSpent)}
- Savings: Goal ${frm(budget.savings_amount)} | Saved/Allocated ${frm(savingsSpent)}

Analyze their pacing. Warn immediately if they are overspending in Needs or Wants. Praise them if they are perfectly on track or saving well.
Provide a concise, highly actionable 2 to 3 sentence insight. 
Tone: Friendly, professional, encouraging. 
Format: Raw text (you can use 1 or 2 relevant emojis, avoid heavy markdown headers).
  `

  // 4. Call Gemini Flash via REST API
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`
  const aiResponse = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
    })
  })

  if (!aiResponse.ok) {
    const errText = await aiResponse.text()
    throw new Error('Failed to reach Gemini: ' + errText)
  }

  const data = await aiResponse.json()
  const insightText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate an insight right now."

  // 5. Save Insight
  await supabase.from('ai_insights').insert({
    user_id: user.id,
    type: 'monthly_pacing',
    content: insightText,
    period: currentMonthStr
  })

  // 6. Trigger a Notification using the database table we built earlier
  await supabase.from('notifications').insert({
    user_id: user.id,
    type: 'success',
    title: '🧠 AI Insight Ready!',
    message: 'Your personalized Gemini analysis for this month is ready to read.',
    link: '/'
  })

  revalidatePath('/ai-advisor')
  return { success: true }
}
