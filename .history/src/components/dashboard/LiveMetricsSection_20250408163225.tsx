import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Clock, RefreshCw } from 'lucide-react';

// Simulated data - replace with real data source
const generateTimeSeriesData = () => {
  const hours = ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM'];
  return hours.map((hour, index) => ({
    name: hour,
    applications: Math.floor(Math.random() * 20) + 5,
    approved: Math.floor(Math.random() * 15),
    rejected: Math.floor(Math.random() * 5)
  }));
};

const generateProcessingTimeData = () => {
  const visaTypes = ['Business', 'Student', 'Tourist', 'Work', 'Family'];
  return visaTypes.map(type => ({
    name: type,
    avgTime: Math.floor(Math.random() * 120) + 30,
  }));
};

const generateStatusDistributionData = () => {
  return [
    { name: 'Pending', value: 35, color: '#f59e0b' },
    { name: 'In Progress', value: 45, color: '#3b82f6' },
    { name: 'Approved', value: 15, color: '#10b981' },
    { name: 'Rejected', value: 5, color: '#ef4444' }
  ];
};

const generateCountryData = () => {
  return [
    { name: 'United Kingdom', value: 92, color: '#3b82f6' },
    { name: 'United States', value: 88, color: '#10b981' },
    { name: 'Germany', value: 95, color: '#f59e0b' },
    { name: 'Australia', value: 91, color: '#8b5cf6' },
    { name: 'Canada', value: 94, color: '#ec4899' }
  ];
};

const generateSLAData = () => {
  return [
    { time: '00:00', within: 95 },
    { time: '04:00', within: 97 },
    { time: '08:00', within: 92 },
    { time: '12:00', within: 98 },
    { time: '16:00', within: 95 },
    { time: '20:00', within: 97 },
    { time: 'Now', within: 96 }
  ];
};

const LiveMetricsSection = () => {
  const [timeSeriesData, setTimeSeriesData] = useState(generateTimeSeriesData());
  const [processingTimeData, setProcessingTimeData] = useState(generateProcessingTimeData());
  const [statusDistribution, setStatusDistribution] = useState(generateStatusDistributionData());
  const [countryData, setCountryData] = useState(generateCountryData());
  const [slaData, setSLAData] = useState(generateSLAData());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Simulate data refresh
  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setTimeSeriesData(generateTimeSeriesData());
      setProcessingTimeData(generateProcessingTimeData());
      setStatusDistribution(generateStatusDistributionData());
      setCountryData(generateCountryData());
      setSLAData(generateSLAData());
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  // Custom tooltip for metrics
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm text-xs">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Process efficiency metrics
  const efficiencyMetrics = [
    { label: 'Avg. Processing Time', value: '42 min', change: '+3%', isPositive: false },
    { label: 'Approval Rate', value: '86%', change: '+2%', isPositive: true },
    { label: 'SLA Compliance', value: '96%', change: '+1%', isPositive: true },
    { label: 'Time to First Review', value: '15 min', change: '-5%', isPositive: true },
    { label: 'Escalation Rate', value: '7%', change: '-2%', isPositive: true },
    { label: 'Auto-Verification Rate', value: '34%', change: '+8%', isPositive: true }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Live Queue Metrics</h2>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          <button 
            onClick={refreshData} 
            disabled={isRefreshing}
            className="ml-2 p-1 rounded-md hover:bg-gray-100 focus:outline-none"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* First row of metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Applications Processing Chart */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Applications Processing Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timeSeriesData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorApplications)"
                  />
                  <Area
                    type="monotone"
                    dataKey="approved"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorApproved)"
                  />
                  <Area
                    type="monotone"
                    dataKey="rejected"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#colorRejected)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Visa Processing Times */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Processing Time by Visa Type (minutes)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={processingTimeData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="avgTime" fill="#8884d8" radius={[0, 4, 4, 0]}>
                    {processingTimeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`hsl(${index * 40 + 120}, 70%, 50%)`} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Second row of metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Application Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* SLA Metrics Card */}
        <Card className="bg-white md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">SLA Performance (Last 24 Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={slaData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[85, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="within" 
                    name="% Within SLA" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey={() => 95} 
                    name="Target" 
                    stroke="#ef4444" 
                    strokeDasharray="5 5" 
                    strokeWidth={2} 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Third row - Additional metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Approval Rate By Country */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Visa Approval Rate By Country</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={countryData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} unit="%" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Approval Rate']} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {countryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Processing Efficiency Card */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processing Efficiency Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-4">
                {efficiencyMetrics.map((metric, i) => (
                  <div key={i} className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500">{metric.label}</div>
                    <div className="font-semibold text-lg mt-1">{metric.value}</div>
                    <div className={`text-xs mt-1 ${metric.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {metric.change} vs yesterday
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveMetricsSection;