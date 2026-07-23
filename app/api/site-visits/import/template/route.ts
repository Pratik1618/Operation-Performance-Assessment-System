import { NextResponse } from 'next/server'

const API_BASE_URL = 'https://dev-int.ismart.org'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')

    const fetchOptions: RequestInit = {
      method: 'GET',
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    }

    // Bypass TLS in development
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    const response = await fetch(`${API_BASE_URL}/api/operations/site-visits/import/template`, fetchOptions)
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      return NextResponse.json(data, { status: response.status })
    }

    // Forward the file stream directly to the client
    return new NextResponse(response.body, {
      status: 200,
      headers: response.headers
    })
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
