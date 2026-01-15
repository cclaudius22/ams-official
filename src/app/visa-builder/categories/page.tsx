'use client'

import React, { useState } from 'react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Tags,
  Plus,
  Briefcase,
  Plane,
  GraduationCap,
  Building2,
  Users,
  TrendingUp,
  Heart,
  Stethoscope,
  Search,
  Edit,
  Trash2,
  ChevronRight,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { VISA_CATEGORIES, SAMPLE_VISA_TYPES, getCategoryCounts } from '@/lib/sample-visa-types'

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Plane,
  GraduationCap,
  Building2,
  Users,
  TrendingUp,
  Heart,
  Stethoscope
}

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' }
}

export default function VisaCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', description: '', color: 'blue' })

  const categoryCounts = getCategoryCounts()

  // Update categories with actual counts
  const categoriesWithCounts = VISA_CATEGORIES.map(cat => ({
    ...cat,
    count: categoryCounts[cat.id] || 0
  }))

  // Filter categories
  const filteredCategories = categoriesWithCounts.filter(cat =>
    searchQuery === '' ||
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get visa types for a category
  const getVisasForCategory = (categoryId: string) => {
    return SAMPLE_VISA_TYPES.filter(v => v.category === categoryId)
  }

  const totalVisaTypes = SAMPLE_VISA_TYPES.length

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 p-4 md:p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Tags className="h-7 w-7" />
                Visa Categories
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Organize and manage visa type categories
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Create a new visa category to organize visa types
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Digital Nomad Visas"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of this category..."
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color Theme</Label>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(colorMap).map(color => (
                        <button
                          key={color}
                          onClick={() => setNewCategory({ ...newCategory, color })}
                          className={`w-8 h-8 rounded-full ${colorMap[color].bg} ${colorMap[color].border} border-2 ${
                            newCategory.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    // TODO: Save category
                    console.log('New category:', newCategory)
                    setIsAddDialogOpen(false)
                    setNewCategory({ name: '', description: '', color: 'blue' })
                  }}>
                    Create Category
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Categories</p>
                    <p className="text-2xl font-bold">{VISA_CATEGORIES.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Tags className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Visa Types</p>
                    <p className="text-2xl font-bold">{totalVisaTypes}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Avg per Category</p>
                    <p className="text-2xl font-bold">
                      {(totalVisaTypes / VISA_CATEGORIES.length).toFixed(1)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => {
              const IconComponent = iconMap[category.icon] || FileText
              const colors = colorMap[category.color] || colorMap.blue
              const visasInCategory = getVisasForCategory(category.id)

              return (
                <Card key={category.id} className={`${colors.border} border-2 hover:shadow-lg transition-shadow`}>
                  <CardHeader className={`${colors.bg}`}>
                    <div className="flex items-start justify-between">
                      <div className={`h-12 w-12 ${colors.bg} rounded-lg flex items-center justify-center border ${colors.border}`}>
                        <IconComponent className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="mt-3">{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {category.count} visa types
                      </Badge>
                    </div>

                    {/* Sample visa types in this category */}
                    {visasInCategory.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Visa Types</p>
                        <div className="space-y-1">
                          {visasInCategory.slice(0, 3).map(visa => (
                            <div
                              key={visa.visaCode}
                              className="flex items-center justify-between text-sm py-1.5 px-2 bg-gray-50 rounded"
                            >
                              <span className="truncate">{visa.name}</span>
                              <Badge variant="outline" className="font-mono text-xs ml-2">
                                {visa.visaCode}
                              </Badge>
                            </div>
                          ))}
                          {visasInCategory.length > 3 && (
                            <p className="text-xs text-gray-400 text-center pt-1">
                              +{visasInCategory.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <Link href={`/visa-builder/published-list?category=${category.id}`}>
                      <Button variant="outline" className="w-full mt-4">
                        View All
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredCategories.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Tags className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No categories found matching your search</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
