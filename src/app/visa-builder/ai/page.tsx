'use client'

import React, { useState } from 'react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BrainCircuit,
  Sparkles,
  Wand2,
  FileJson,
  Copy,
  Download,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Settings2,
  Zap,
  ArrowRight,
} from 'lucide-react'
import { SAMPLE_VISA_TYPES, VISA_CATEGORIES } from '@/lib/sample-visa-types'

export default function VisaAIPage() {
  const [activeTab, setActiveTab] = useState('create')
  const [prompt, setPrompt] = useState('')
  const [generatedJson, setGeneratedJson] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedVisaForAnalysis, setSelectedVisaForAnalysis] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState('')

  // Mock AI generation - in production this would call your AI backend
  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setGeneratedJson('')

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock generated JSON based on prompt
    const mockVisa = {
      name: "AI Generated Visa Type",
      visaCode: "AI-GEN-001",
      category: prompt.toLowerCase().includes('work') ? 'work' :
                prompt.toLowerCase().includes('student') ? 'student' :
                prompt.toLowerCase().includes('tourist') ? 'tourist' : 'business',
      description: prompt,
      country: "Generated Country",
      eVisaAvailable: true,
      eligibilityCriteria: [
        {
          name: "Primary Requirement",
          required: true,
          description: "AI-detected requirement based on visa type"
        }
      ],
      kycRequirements: [
        { kycType: "Passport verification", required: true, description: "Valid passport" },
        { kycType: "Identity verification", required: true, description: "Biometric verification" }
      ],
      documentsRequirements: [
        { name: "Supporting Documents", required: true, description: "As per visa type", format: "PDF" }
      ],
      processingTier: [
        { type: "standard", timeframe: "2-3 weeks", visaCost: { amount: 100, currency: "USD" } }
      ],
      isActive: false,
      _aiGenerated: true,
      _prompt: prompt
    }

    setGeneratedJson(JSON.stringify(mockVisa, null, 2))
    setIsGenerating(false)
  }

  const handleAnalyzeVisa = async () => {
    if (!selectedVisaForAnalysis) return

    setIsGenerating(true)
    setAnalysisResult('')

    await new Promise(resolve => setTimeout(resolve, 1500))

    const visa = SAMPLE_VISA_TYPES.find(v => v.visaCode === selectedVisaForAnalysis)
    if (visa) {
      setAnalysisResult(`
## Analysis of ${visa.name} (${visa.visaCode})

### Overview
- **Category:** ${visa.category}
- **Country:** ${typeof visa.country === 'string' ? visa.country : visa.country?.name}
- **Status:** ${visa.isActive ? 'Active' : 'Inactive'}
- **VisaKey Enabled:** ${visa.visaKey?.enabled ? 'Yes' : 'No'}

### Eligibility Criteria
${visa.eligibilityCriteria?.map(c => `- ${c.name}: ${c.description}`).join('\n') || 'Not specified'}

### Document Requirements
${visa.documentsRequirements?.map(d => `- ${d.name} (${d.required ? 'Required' : 'Optional'})`).join('\n') || 'Not specified'}

### Recommendations
1. Consider enabling VisaKey for faster processing
2. Review eligibility criteria for completeness
3. Ensure all document requirements are clearly specified
4. Consider adding multiple processing tiers if not present

### Potential Improvements
- Add more detailed eligibility scoring criteria
- Include estimated processing times for each tier
- Add travel insurance requirements if applicable
      `.trim())
    }

    setIsGenerating(false)
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(generatedJson)
  }

  const handleDownloadJson = () => {
    const blob = new Blob([generatedJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ai-generated-visa.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const examplePrompts = [
    "Create a skilled worker visa for Canada with English language requirements and minimum salary of CAD $60,000",
    "Generate a student visa for Australia requiring proof of enrollment and financial capacity of AUD $21,041 per year",
    "Design an investor visa for Portugal's Golden Visa program with €500,000 minimum investment",
    "Build a digital nomad visa for Spain with remote work proof and health insurance requirements"
  ]

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
                <BrainCircuit className="h-7 w-7 text-purple-600" />
                Visa AI Assistant
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Create visa configurations with AI or analyze existing visas
              </p>
            </div>
            <Badge className="bg-purple-100 text-purple-700 border-purple-300">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Create Visa
              </TabsTrigger>
              <TabsTrigger value="analyze" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Analyze Visa
              </TabsTrigger>
            </TabsList>

            {/* Create Tab */}
            <TabsContent value="create" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5 text-purple-600" />
                      Describe Your Visa
                    </CardTitle>
                    <CardDescription>
                      Describe the visa type you want to create in natural language. The AI will generate a complete JSON configuration.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Visa Description</Label>
                      <Textarea
                        placeholder="Example: Create a work visa for Germany requiring a job offer, university degree, minimum salary of €45,000, and B1 German language proficiency..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="min-h-[200px] mt-2"
                      />
                    </div>

                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt.trim()}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Visa JSON
                        </>
                      )}
                    </Button>

                    {/* Example Prompts */}
                    <div className="pt-4 border-t">
                      <Label className="text-xs text-gray-500">Example Prompts</Label>
                      <div className="mt-2 space-y-2">
                        {examplePrompts.map((example, index) => (
                          <button
                            key={index}
                            onClick={() => setPrompt(example)}
                            className="w-full text-left text-xs p-2 bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                          >
                            {example}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Output Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileJson className="h-5 w-5 text-green-600" />
                      Generated JSON
                    </CardTitle>
                    <CardDescription>
                      Review and edit the generated configuration before importing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {generatedJson ? (
                      <div className="space-y-4">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-[400px]">
                          <code>{generatedJson}</code>
                        </pre>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={handleCopyJson}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleDownloadJson}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button size="sm" className="ml-auto bg-green-600 hover:bg-green-700">
                            <Zap className="h-4 w-4 mr-2" />
                            Import to Builder
                          </Button>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                          <p className="text-xs text-amber-800">
                            AI-generated configurations should be reviewed and validated before use. Some fields may need manual adjustment.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <FileJson className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Generated JSON will appear here</p>
                        <p className="text-sm mt-2">Describe a visa type and click generate</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analyze Tab */}
            <TabsContent value="analyze" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Selection Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-blue-600" />
                      Select Visa to Analyze
                    </CardTitle>
                    <CardDescription>
                      Choose an existing visa type to get AI-powered analysis and recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Visa Type</Label>
                      <Select value={selectedVisaForAnalysis} onValueChange={setSelectedVisaForAnalysis}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select a visa to analyze..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SAMPLE_VISA_TYPES.map(visa => (
                            <SelectItem key={visa.visaCode} value={visa.visaCode}>
                              <div className="flex items-center gap-2">
                                {visa.visaKey?.enabled && <Zap className="h-3 w-3 text-amber-500" />}
                                <span>{visa.name}</span>
                                <span className="text-gray-400">({visa.visaCode})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleAnalyzeVisa}
                      disabled={isGenerating || !selectedVisaForAnalysis}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <BrainCircuit className="h-4 w-4 mr-2" />
                          Analyze Visa
                        </>
                      )}
                    </Button>

                    {/* Quick Actions */}
                    <div className="pt-4 border-t space-y-2">
                      <Label className="text-xs text-gray-500">Quick Actions</Label>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Settings2 className="h-4 w-4 mr-2" />
                        Compare with similar visas
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Generate compliance report
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Suggest improvements
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis Results */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      Analysis Results
                    </CardTitle>
                    <CardDescription>
                      AI-generated insights and recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analysisResult ? (
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm font-sans">
                          {analysisResult}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <BrainCircuit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Analysis results will appear here</p>
                        <p className="text-sm mt-2">Select a visa and click analyze</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Info Banner */}
          <Card className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">AI Assistant Capabilities</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    The Visa AI can help you create new visa configurations from natural language descriptions,
                    analyze existing visas for completeness, suggest improvements, and ensure compliance with best practices.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Natural Language Processing</Badge>
                    <Badge variant="outline">JSON Generation</Badge>
                    <Badge variant="outline">Compliance Analysis</Badge>
                    <Badge variant="outline">Recommendations</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
