// lib/api/applications.ts
export async function getApplication(id: string) {
    const response = await fetch(`/api/applications/${id}`);
    if (!response.ok) throw new Error('Failed to fetch application');
    return response.json();
  }
  
  export async function updateApplication(id: string, data: any) {
    const response = await fetch(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update application');
    return response.json();
  }