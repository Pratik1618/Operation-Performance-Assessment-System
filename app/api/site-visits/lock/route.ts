import { NextResponse } from 'next/server'
import https from 'https'

const API_BASE_URL = 'https://dev-int.ismart.org'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const body = await request.text()

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      ...(body ? { body } : {})
    }

    // Bypass TLS in development
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    const response = await fetch(`${API_BASE_URL}/api/operations/site-visits/lock`, fetchOptions)
    
    // In case it returns 204 No Content
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 })
    }

    const data = await response.json().catch(() => ({}))

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
