// src/app/api/webhook/nifi/route.ts
import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    
    // Validate the webhook payload
    if (!payload || !payload.applications) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      )
    }
    
    const client = await clientPromise
    const db = client.db('visa_system')
    const collection = db.collection('applications')
    
    // Process the incoming applications
    // This could be inserting new applications or updating existing ones
    const result = await collection.bulkWrite(
      payload.applications.map((app: any) => ({
        updateOne: {
          filter: { id: app.id },
          update: { $set: app },
          upsert: true
        }
      }))
    )
    
    return NextResponse.json({
      success: true,
      inserted: result.upsertedCount,
      modified: result.modifiedCount
    })
  } catch (error) {
    console.error('Error processing Nifi webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}