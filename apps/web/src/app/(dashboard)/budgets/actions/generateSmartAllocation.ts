'use server'

import { createClient } from '@/utils/supabase/server'

export async function generateSmartAllocation(income: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
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

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`
  
  try {
    const aiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    return { success: true, allocation }
    
  } catch (err: any) {
    console.error('AI Allocation Error:', err)
    return { success: false, error: err.message }
  }
}
