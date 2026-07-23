import { NextResponse } from 'next/server'

const API_BASE_URL = 'https://dev-int.ismart.org'

export async function PUT(
  request: Request,
  context: any
) {
  try {
    const url = new URL(request.url)
    const segments = url.pathname.split('/')
    const id = segments[segments.length - 1]
    
    const body = await request.json()
    const authHeader = request.headers.get('Authorization')

    const fetchOptions: RequestInit = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body)
    }

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    const response = await fetch(`${API_BASE_URL}/api/operations/transfers/${id}`, fetchOptions)
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
