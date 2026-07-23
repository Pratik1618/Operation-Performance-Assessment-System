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

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    const response = await fetch(`${API_BASE_URL}/api/operations/sites`, fetchOptions)
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
