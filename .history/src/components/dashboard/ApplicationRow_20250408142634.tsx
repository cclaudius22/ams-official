'use client'

import React from 'react'
import { LiveApplication } from '@/types/liveQueue'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { User } from 'lucide-react'

interface ApplicationRowProps {
  application: LiveApplication
  onSelect?: (application: LiveApplication) => void
}

export default function ApplicationRow({ 
  application,
  onSelect
}: ApplicationRowProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'text-blue-600';
      case 'Approved':
        return 'text-green-600';
      case 'Pending':
        return 'text-amber-600';
      case 'Rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-500';
      case 'Approved':
        return 'bg-green-500';
      case 'Pending':
        return 'bg-amber-500';
      case 'Rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <tr 
      className="border-b hover:bg-gray-50 cursor-pointer" 
      onClick={() => onSelect?.(application)}
    >
      <td className="py-2 px-4 whitespace-nowrap">
        <div className="flex items-center">
          <input type="checkbox" className="rounded border-gray-300 mr-2" />
          {application.id}
        </div>
      </td>
      <td className="py-2 px-4">
        <div className="flex items-center">
          {application.country && (
            <span className="mr-2 inline-block w-6">
              <Image 
                src={`/flags/${application.country.toLowerCase()}.svg`} 
                alt={application.country}
                width={24}
                height={18}
                className="rounded"
              />
            </span>
          )}
          <Link 
            href={`/dashboard/reviewer/${application.id}`} 
            className="font-medium text-gray-900 hover:text-blue-600"
          >
            {application.applicantName}
          </Link>
        </div>
      </td>
      <td className="py-2 px-4 whitespace-nowrap">
        <div>
          <span className="block">{application.visaType}</span>
          {application.category && (
            <span className="text-xs text-gray-500">{application.category}</span>
          )}
        </div>
      </td>
      <td className="py-2 px-4 whitespace-nowrap text-gray-500">
        {application.submittedAt}
      </td>
      <td className="py-2 px-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full ${getStatusDot(application.status)} mr-2`}></div>
          <span className={getStatusColor(application.status)}>{application.status}</span>
        </div>
      </td>
      <td className="py-2 px-4 whitespace-nowrap">
        {application.assignedTo ? (
          <div className="flex items-center">
            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              <User className="h-3 w-3 text-gray-500" />
            </div>
            <span className="text-sm">{application.assignedTo.name}</span>
          </div>
        ) : (
          <Badge variant="outline" className="text-xs">
            Unassigned
          </Badge>
        )}
      </td>
    </tr>
  )
}