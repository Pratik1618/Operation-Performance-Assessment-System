import { NextResponse } from 'next/server'
import https from 'https'

const API_BASE_URL = 'https://dev-int.ismart.org'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Create a custom agent to ignore self-signed certificate errors in development
    const agent = new https.Agent({
      rejectUnauthorized: false,
    })

    const fetchOptions: RequestInit & { agent?: https.Agent } = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }

    // Note: Node's native fetch in Next.js 13+ doesn't use https.Agent directly like node-fetch.
    // To bypass TLS strictly in native fetch, we can use process.env:
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    const response = await fetch(`${API_BASE_URL}/api/operations/auth/login`, fetchOptions)
    
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
