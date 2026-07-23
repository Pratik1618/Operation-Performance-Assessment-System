import { NextResponse } from 'next/server'
import https from 'https'

const API_BASE_URL = 'https://dev-int.ismart.org'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    const body = await request.json()
    const visitId = (await params).id

    const fetchOptions: RequestInit = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    }

    // Bypass TLS in development
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    const response = await fetch(`${API_BASE_URL}/api/operations/site-visits/${visitId}`, fetchOptions)
    
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    const visitId = (await params).id

    const fetchOptions: RequestInit = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    }

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    const response = await fetch(`${API_BASE_URL}/api/operations/site-visits/${visitId}`, fetchOptions)
    
    // DELETE requests often return 204 No Content, so we check for that
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
