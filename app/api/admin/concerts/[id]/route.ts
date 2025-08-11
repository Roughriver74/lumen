import { NextRequest, NextResponse } from 'next/server'
import { BlobStorage } from '@/lib/blob/storage'
import { ConcertSchema } from '@/lib/types/database'

// Simple auth check
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }
  
  const token = authHeader.substring(7)
  return token === adminPassword
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const concertId = params.id
    
    // Validate partial concert data
    const updates = ConcertSchema.partial().parse(body)
    
    // Update concert in storage
    await BlobStorage.updateConcert(concertId, updates)
    
    return NextResponse.json({
      success: true,
      concertId,
      updates,
      message: 'Concert updated successfully'
    })
  } catch (error) {
    console.error('Error updating concert:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid concert data', details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update concert' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const concertId = params.id
    
    // Delete concert from storage
    await BlobStorage.deleteConcert(concertId)
    
    return NextResponse.json({
      success: true,
      concertId,
      message: 'Concert deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting concert:', error)
    return NextResponse.json(
      { error: 'Failed to delete concert' },
      { status: 500 }
    )
  }
}