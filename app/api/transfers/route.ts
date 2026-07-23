import { NextResponse } from 'next/server'

const API_BASE_URL = 'https://dev-int.ismart.org'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('Authorization')

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body)
    }

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    const response = await fetch(`${API_BASE_URL}/api/operations/transfers`, fetchOptions)
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')

    const fetchOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      }
    }

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    const response = await fetch(`${API_BASE_URL}/api/operations/transfers`, fetchOptions)
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
