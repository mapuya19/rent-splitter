'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { animations } from '@/lib/animations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { clsx, type ClassValue } from 'clsx'

interface AnimatedCardProps {
  title?: string
  children: React.ReactNode
  className?: ClassValue
  animationDelay?: number
  animationType?: 'dramaticEntrance' | 'popIn' | 'none'
}

export function AnimatedCard({ 
  title, 
  children, 
  className, 
  animationDelay = 0,
  animationType = 'dramaticEntrance'
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  
  useGSAP(() => {
    if (cardRef.current && animationType !== 'none') {
      animations[animationType](cardRef.current, 0.8, animationDelay)
    }
  }, { scope: cardRef, dependencies: [animationDelay, animationType] })

  const handleMouseEnter = () => {
    if (cardRef.current) {
      animations.cardLift(cardRef.current, true)
    }
  }

  const handleMouseLeave = () => {
    if (cardRef.current) {
      animations.cardLift(cardRef.current, false)
    }
  }

  return (
    <Card 
      ref={cardRef} 
      className={clsx(className, 'transition-shadow duration-300')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ 
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden'
      }}
    >
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
}
