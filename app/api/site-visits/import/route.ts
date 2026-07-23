import { NextResponse } from 'next/server'

const API_BASE_URL = 'https://dev-int.ismart.org'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const contentType = request.headers.get('Content-Type') || ''

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: request.body,
      // @ts-ignore
      duplex: 'half',
    }

    // Bypass TLS in development
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    const response = await fetch(`${API_BASE_URL}/api/operations/site-visits/import`, fetchOptions)
    
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
