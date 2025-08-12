'use client'

import { useEffect, useState, useRef } from 'react'

interface RouteLineProps {
  from: [number, number]
  to: [number, number]
  mapState?: {
    center: [number, number]
    zoom: number
    width: number
    height: number
    bounds?: {
      ne: [number, number]
      sw: [number, number]
    }
  }
}

export default function RouteLine({ from, to, mapState }: RouteLineProps) {
  const [dashOffset, setDashOffset] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setDashOffset(prev => prev - 1)
    }, 50)

    return () => clearInterval(interval)
  }, [])

  // Convert lat/lng to pixel positions
  const latLngToPixel = (lat: number, lng: number) => {
    if (!mapState) return [0, 0]
    
    const tile = Math.pow(2, mapState.zoom)
    const centerX = mapState.width / 2
    const centerY = mapState.height / 2
    
    // Web Mercator projection
    const latRad = lat * Math.PI / 180
    const centerLatRad = mapState.center[0] * Math.PI / 180
    
    const x = centerX + ((lng - mapState.center[1]) / 360) * 256 * tile
    
    const yFrom = Math.log(Math.tan(Math.PI / 4 + centerLatRad / 2))
    const yTo = Math.log(Math.tan(Math.PI / 4 + latRad / 2))
    const y = centerY - ((yTo - yFrom) / (2 * Math.PI)) * 256 * tile
    
    return [x, y]
  }

  useEffect(() => {
    if (!canvasRef.current || !mapState) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Get pixel positions
    const [x1, y1] = latLngToPixel(from[0], from[1])
    const [x2, y2] = latLngToPixel(to[0], to[1])
    
    // Draw dashed line
    ctx.strokeStyle = '#007bff'
    ctx.lineWidth = 3
    ctx.globalAlpha = 0.8
    ctx.setLineDash([10, 10])
    ctx.lineDashOffset = dashOffset
    
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    
    // Draw arrow at the end
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const arrowLength = 10
    const arrowAngle = Math.PI / 6
    
    ctx.beginPath()
    ctx.moveTo(x2, y2)
    ctx.lineTo(
      x2 - arrowLength * Math.cos(angle - arrowAngle),
      y2 - arrowLength * Math.sin(angle - arrowAngle)
    )
    ctx.moveTo(x2, y2)
    ctx.lineTo(
      x2 - arrowLength * Math.cos(angle + arrowAngle),
      y2 - arrowLength * Math.sin(angle + arrowAngle)
    )
    ctx.stroke()
    
  }, [from, to, mapState, dashOffset])

  if (!mapState) return null

  return (
    <canvas
      ref={canvasRef}
      width={mapState.width}
      height={mapState.height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 2
      }}
    />
  )
}