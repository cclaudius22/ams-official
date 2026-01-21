'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, User, Briefcase, CheckCircle2 } from 'lucide-react'
import { ConsulateOfficial } from '@/api-contracts/users'
import { VISA_TYPE_DISPLAY_NAMES } from '@/data/synthetic/country-codes'

interface AssignmentSuggestion {
  suggestedOfficer: ConsulateOfficial
  reason: string
  alternatives: ConsulateOfficial[]
  confidence: number
}

interface AssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  selectedApplicationIds: string[]
  officers: ConsulateOfficial[]
  onAssign: (officerId: string) => Promise<void>
  isAssigning: boolean
}

export default function AssignmentModal({
  isOpen,
  onClose,
  selectedApplicationIds,
  officers,
  onAssign,
  isAssigning,
}: AssignmentModalProps) {
  const [selectedOfficer, setSelectedOfficer] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<AssignmentSuggestion | null>(null)
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false)

  // Fetch suggestion when modal opens with a single application
  useEffect(() => {
    const fetchSuggestion = async () => {
      if (selectedApplicationIds.length === 1) {
        setIsLoadingSuggestion(true)
        try {
          const response = await fetch(
            `/api/assignments/suggest?applicationId=${selectedApplicationIds[0]}`
          )
          const data = await response.json()
          if (data.success) {
            setSuggestion(data.data)
            setSelectedOfficer(data.data.suggestedOfficer.id)
          }
        } catch (err) {
          console.error('Failed to fetch suggestion:', err)
        } finally {
          setIsLoadingSuggestion(false)
        }
      }
    }

    if (isOpen) {
      fetchSuggestion()
    } else {
      setSuggestion(null)
      setSelectedOfficer(null)
    }
  }, [isOpen, selectedApplicationIds])

  const handleAssign = async () => {
    if (!selectedOfficer) return
    await onAssign(selectedOfficer)
  }

  const getSpecializationBadges = (specializations: string[] | undefined) => {
    if (!specializations || specializations.length === 0) return null
    return specializations.map((spec) => (
      <Badge
        key={spec}
        variant="secondary"
        className="text-xs mr-1 mb-1"
      >
        {VISA_TYPE_DISPLAY_NAMES[spec] || spec}
      </Badge>
    ))
  }

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      senior_officer: 'bg-purple-100 text-purple-800',
      officer: 'bg-blue-100 text-blue-800',
      specialist: 'bg-green-100 text-green-800',
      trainee: 'bg-gray-100 text-gray-800',
    }
    const labels: Record<string, string> = {
      senior_officer: 'Senior',
      officer: 'Officer',
      specialist: 'Specialist',
      trainee: 'Trainee',
    }
    return (
      <Badge className={`${colors[role] || colors.officer} text-xs`}>
        {labels[role] || role}
      </Badge>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Assign Applications
          </DialogTitle>
          <DialogDescription>
            Select an officer to assign {selectedApplicationIds.length} application
            {selectedApplicationIds.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        {/* AI Suggestion Banner */}
        {isLoadingSuggestion && (
          <div className="flex items-center justify-center py-4 bg-blue-50 rounded-lg">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-blue-600" />
            <span className="text-blue-700">Getting AI recommendation...</span>
          </div>
        )}

        {suggestion && !isLoadingSuggestion && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">AI Recommendation</span>
              <Badge variant="outline" className="ml-auto">
                {Math.round(suggestion.confidence * 100)}% confidence
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{suggestion.reason}</p>
          </div>
        )}

        {/* Officers List */}
        <div className="space-y-2 mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Available Officers</h4>
          {officers.map((officer) => {
            const isSelected = selectedOfficer === officer.id
            const isSuggested = suggestion?.suggestedOfficer.id === officer.id
            const isAlternative = suggestion?.alternatives.some((a) => a.id === officer.id)

            return (
              <div
                key={officer.id}
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all
                  ${isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                  ${isSuggested && !isSelected ? 'border-blue-300 bg-blue-25' : ''}
                `}
                onClick={() => setSelectedOfficer(officer.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
                      `}
                    >
                      {officer.firstName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{officer.firstName} {officer.lastName}</span>
                        {getRoleBadge(officer.role)}
                        {isSuggested && (
                          <Badge className="bg-blue-600 text-white text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                        {isAlternative && !isSuggested && (
                          <Badge variant="outline" className="text-xs">
                            Alternative
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap">
                        {getSpecializationBadges(officer.specializations)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Briefcase className="h-4 w-4" />
                      <span>{officer.activeApplications} active</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      SLA: {officer.slaCompliance}%
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div className="mt-2 pt-2 border-t border-blue-200 flex items-center text-blue-700 text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Selected for assignment
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={isAssigning}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedOfficer || isAssigning}
          >
            {isAssigning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Assigning...
              </>
            ) : (
              `Assign ${selectedApplicationIds.length} Application${selectedApplicationIds.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
