// Using local Next.js API Routes as a proxy to bypass TLS errors and handle CORS
export const LOCAL_API_BASE = '/opas/api'

export interface ApiUser {
  user_id: string
  name: string
  role: string
  code: string
  designation: string
  email: string
  phone: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: ApiUser
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${LOCAL_API_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    let errorMessage = 'Authentication failed'
    try {
      const errorData = await response.json()
      if (errorData.message) {
        errorMessage = errorData.message
      }
    } catch (e) {
      // Ignore json parsing error for error response
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

export function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('opas_token') : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export interface ApiScheduledVisit {
  id: string
  site_id: string
  site_name: string
  client_name: string
  assigned_to_name: string
  date_str: string
  time: string
  status: string
  locked: boolean
}

export async function fetchScheduledVisits(): Promise<ApiScheduledVisit[]> {
  const response = await fetch(`${LOCAL_API_BASE}/site-visits`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch scheduled visits')
  }

  const data = await response.json()
  return data.items || []
}

export interface ApiScheduledVisitCreate {
  site_id: string
  visit_date: string
  visit_time: string
  assigned_to_user_id: string
}

export async function createScheduledVisit(payload: ApiScheduledVisitCreate): Promise<ApiScheduledVisit> {
  const response = await fetch(`${LOCAL_API_BASE}/site-visits`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let errorMessage = 'Failed to create visit'
    try {
      const errorData = await response.json()
      if (errorData.message) {
        errorMessage = errorData.message
        if (errorData.errors) {
          errorMessage += ' Details: ' + JSON.stringify(errorData.errors)
        }
      } else if (errorData.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail)
      } else {
        errorMessage = JSON.stringify(errorData)
      }
    } catch (e) {}
    throw new Error(errorMessage)
  }

  return response.json()
}

export async function updateScheduledVisit(id: string, payload: ApiScheduledVisitCreate): Promise<ApiScheduledVisit> {
  const response = await fetch(`${LOCAL_API_BASE}/site-visits/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let errorMessage = 'Failed to update visit'
    try {
      const errorData = await response.json()
      if (errorData.message) {
        errorMessage = errorData.message
        if (errorData.errors) {
          errorMessage += ' Details: ' + JSON.stringify(errorData.errors)
        }
      } else if (errorData.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail)
      } else {
        errorMessage = JSON.stringify(errorData)
      }
    } catch (e) {}
    throw new Error(errorMessage)
  }

  return response.json()
}

export async function deleteScheduledVisit(id: string): Promise<void> {
  const response = await fetch(`${LOCAL_API_BASE}/site-visits/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    let errorMessage = 'Failed to delete visit'
    try {
      const errorData = await response.json()
      if (errorData.message) {
        errorMessage = errorData.message
        if (errorData.errors) {
          errorMessage += ' Details: ' + JSON.stringify(errorData.errors)
        }
      } else if (errorData.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail)
      } else {
        errorMessage = JSON.stringify(errorData)
      }
    } catch (e) {}
    throw new Error(errorMessage)
  }
}

export async function lockSiteVisits(targetMonth: string): Promise<void> {
  const response = await fetch(`${LOCAL_API_BASE}/site-visits/lock`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ month: targetMonth })
  })

  if (!response.ok) {
    let errorMessage = 'Failed to lock planner'
    try {
      const errorData = await response.json()
      if (errorData.message) {
        errorMessage = errorData.message
        if (errorData.errors) {
          errorMessage += ' Details: ' + JSON.stringify(errorData.errors)
        }
      } else if (errorData.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail)
      } else {
        errorMessage = JSON.stringify(errorData)
      }
    } catch (e) {}
    throw new Error(errorMessage)
  }
}

export async function downloadImportTemplate(): Promise<Blob> {
  const response = await fetch(`${LOCAL_API_BASE}/site-visits/import/template`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    let errorMessage = 'Failed to download template'
    try {
      const errorData = await response.json()
      if (errorData.message) errorMessage = errorData.message
    } catch (e) {}
    throw new Error(errorMessage)
  }

  return response.blob()
}

export async function uploadImportSchedules(file: File): Promise<any> {
  const formData = new FormData()
  formData.append('file', file)

  const headers = new Headers(getAuthHeaders() as any)
  headers.delete('Content-Type') // Let the browser set it with the correct boundary

  const response = await fetch(`${LOCAL_API_BASE}/site-visits/import`, {
    method: 'POST',
    headers,
    body: formData
  })

  if (!response.ok) {
    let errorMessage = 'Failed to upload schedules'
    try {
      const errorData = await response.json()
      if (errorData.message) errorMessage = errorData.message
      else if (errorData.detail) errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail)
    } catch (e) {}
    throw new Error(errorMessage)
  }

  return response.json()
}

export async function fetchSites(): Promise<any[]> {
  const response = await fetch(`${LOCAL_API_BASE}/sites`, {
    headers: getAuthHeaders(),
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch sites')
  }
  
  const data = await response.json()
  return data.items.map((item: any) => ({
    id: item.id,
    code: item.id.split('-').pop() || item.id, 
    name: item.name,
    client: item.client_name,
    clientId: item.client_id,
    region: 'North', 
    state: 'Delhi', 
    zone: 'Delhi NCR', 
    assignedOE: item.hierarchy?.oe_user_id === 'USR_OE_001' ? 'Ravi Shankar' : 
                item.hierarchy?.oe_user_id === 'USR_OE_002' ? 'Kiran Nair' : 
                item.hierarchy?.oe_user_id === 'USR_OE_003' ? 'Anjali Desai' : 
                item.hierarchy?.oe_user_id || 'Unassigned',
    assignedOeId: item.hierarchy?.oe_user_id,
    assignedRM: item.hierarchy?.rm_user_id === 'USR_RM_001' ? 'Suresh Kumar' : item.hierarchy?.rm_user_id || 'Unassigned',
    assignedRmId: item.hierarchy?.rm_user_id,
    assignedZH: item.hierarchy?.zh_user_id || 'Unassigned',
    assignedZhId: item.hierarchy?.zh_user_id,
    assignedAVP: item.hierarchy?.avp_user_id === 'USR_AVP_001' ? 'Venkat Raman' : item.hierarchy?.avp_user_id || 'Unassigned',
    assignedAvpId: item.hierarchy?.avp_user_id,
    status: item.active ? 'active' : 'inactive',
    employeeCount: Math.floor(Math.random() * 50) + 10,
    address: item.address || ''
  }))
}

export async function requestSiteTransfer(siteId: string, toUserId: string, reason: string): Promise<any> {
  const response = await fetch(`${LOCAL_API_BASE}/transfers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ site_id: siteId, to_user_id: toUserId, reason })
  })

  if (!response.ok) {
    let errorMessage = 'Failed to request transfer'
    try {
      const errorData = await response.json()
      if (errorData.message) errorMessage = errorData.message
      else if (errorData.detail) errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail)
    } catch (e) {}
    throw new Error(errorMessage)
  }

  return response.json()
}

export async function fetchTransfers(): Promise<any[]> {
  const response = await fetch(`${LOCAL_API_BASE}/transfers`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch transfers')
  }

  const data = await response.json()
  return data.items || []
}

interface UpdateTransferParams {
  transferId: string;
  siteId: string;
  fromUserId: string;
  toUserId: string;
  reason: string;
  status: 'approve' | 'reject';
  remarks: string;
  decidedBy: string;
  requestedBy: string;
}

export async function updateTransfer(params: UpdateTransferParams): Promise<any> {
  const response = await fetch(`${LOCAL_API_BASE}/transfers/${params.transferId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      decision: params.status,
      decision_remarks: params.remarks || ''
    })
  })

  if (!response.ok) {
    let errorMessage = 'Failed to update transfer'
    try {
      const errorData = await response.json()
      if (errorData.errors) errorMessage = JSON.stringify(errorData.errors)
      else if (errorData.detail) errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail)
      else if (errorData.message) errorMessage = errorData.message
    } catch (e) {}
    throw new Error(errorMessage)
  }

  return response.json()
}
