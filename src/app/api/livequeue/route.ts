import { NextRequest, NextResponse } from 'next/server';
import { LiveApplication } from '@/types/liveQueue';
import { mockLiveQueue } from '@/lib/mockdata-livequeue';

// In a real app, you would connect to MongoDB here
// Example using mongodb package:
// import { MongoClient } from 'mongodb';
// const client = new MongoClient(process.env.MONGODB_URI as string);

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.getAll('status');
    const visaType = searchParams.getAll('visaType');
    const country = searchParams.getAll('country');
    const assignedTo = searchParams.getAll('assignedTo');
    
    // In a real implementation, you would query MongoDB
    // Example:
    // await client.connect();
    // const db = client.db('visa_system');
    // const collection = db.collection('applications');
    
    // const query: Record<string, any> = {};
    // if (search) {
    //   query.$or = [
    //     { id: { $regex: search, $options: 'i' } },
    //     { applicantName: { $regex: search, $options: 'i' } }
    //   ];
    // }
    // if (status.length > 0) query.status = { $in: status };
    // if (visaType.length > 0) query.visaType = { $in: visaType.map(t => new RegExp(t, 'i')) };
    // if (country.length > 0) query.country = { $in: country };
    // if (assignedTo.length > 0) query['assignedTo.id'] = { $in: assignedTo };
    
    // const total = await collection.countDocuments(query);
    // const data = await collection
    //   .find(query)
    //   .skip((page - 1) * pageSize)
    //   .limit(pageSize)
    //   .toArray();
    
    // For now, we'll filter the mock data
    let filteredData = [...mockLiveQueue];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter(app => 
        app.id.toLowerCase().includes(searchLower) ||
        app.applicantName.toLowerCase().includes(searchLower)
      );
    }
    
    if (status.length > 0) {
      filteredData = filteredData.filter(app => status.includes(app.status));
    }
    
    if (visaType.length > 0) {
      filteredData = filteredData.filter(app => 
        visaType.some(type => app.visaType.includes(type))
      );
    }
    
    if (country.length > 0) {
      filteredData = filteredData.filter(app => country.includes(app.country));
    }
    
    if (assignedTo.length > 0) {
      filteredData = filteredData.filter(app => 
        app.assignedTo && assignedTo.includes(app.assignedTo.id)
      );
    }
    
    const total = filteredData.length;
    const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);
    
    return NextResponse.json({ 
      data: paginatedData, 
      total
    });
    
  } catch (error) {
    console.error('Error in GET /api/livequeue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live queue data' },
      { status: 500 }
    );
  }
}

// POST method for batch operations (could be used for assignments, status changes, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle different operations based on body.operation
    // For example: assign, bulkStatusChange, etc.
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error in POST /api/livequeue:', error);
    return NextResponse.json(
      { error: 'Failed to process operation' },
      { status: 500 }
    );
  }
}