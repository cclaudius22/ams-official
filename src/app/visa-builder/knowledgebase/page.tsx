'use client'

import React from 'react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Library,
  BookOpen,
  FileText,
  Search,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Bell,
} from 'lucide-react'
import Link from 'next/link'

export default function VisaKnowledgebasePage() {
  const plannedFeatures = [
    {
      icon: BookOpen,
      title: 'Visa Documentation Library',
      description: 'Centralized repository of official visa documentation, guidelines, and requirements for all visa types.'
    },
    {
      icon: Search,
      title: 'Intelligent Search',
      description: 'AI-powered search across all visa documents, regulations, and historical data.'
    },
    {
      icon: MessageSquare,
      title: 'AI Chat Assistant',
      description: 'Ask questions about visa requirements, eligibility, and processes in natural language.'
    },
    {
      icon: FileText,
      title: 'Document Templates',
      description: 'Pre-approved templates for common visa-related documents and correspondence.'
    },
    {
      icon: Sparkles,
      title: 'Auto-Updates',
      description: 'Automatic updates when visa regulations change, with diff highlighting and impact analysis.'
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-300">
                Coming Soon
              </Badge>
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 bg-purple-100 rounded-full flex items-center justify-center">
                  <Library className="h-10 w-10 text-purple-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-4">Visa Knowledgebase</h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                A comprehensive knowledge repository for visa documentation, regulations, and AI-assisted guidance.
                Currently under development.
              </p>
            </div>

            {/* Planned Features */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-6 text-center">Planned Features</h2>
              <div className="grid gap-4">
                {plannedFeatures.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="flex items-start gap-4 pt-6">
                        <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium mb-1">{feature.title}</h3>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="pt-6 text-center">
                <Bell className="h-8 w-8 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Get Notified</h3>
                <p className="text-gray-600 mb-4">
                  Want to be notified when Visa Knowledgebase launches?
                </p>
                <div className="flex justify-center gap-4">
                  <Link href="/visa-builder">
                    <Button variant="outline">
                      Back to Visa Builder
                    </Button>
                  </Link>
                  <Link href="/visa-builder/ai">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Try Visa AI
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
