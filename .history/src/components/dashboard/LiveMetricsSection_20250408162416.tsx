import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveLine } from 'recharts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Simulated data - replace with real data source
const getRandomData = (min, max, count) => {
  return Array.from({ length: count }, (_, i) => ({
    x: i + 1,
    y: Math.floor(Math.random() * (max - min + 1) + min)
  }));
};

// Mock data for charts
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
    fill: `hsl(${Math.random() * 360}, 70%, 50%)`
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

const LiveMetricsSection = () => {
  const [timeSeriesData, setTimeSeriesData] = useState(generateTimeSeriesData());
  const [processingTimeData, setProcessingTimeData] = useState(generateProcessingTimeData());
  const [statusDistribution, setStatusDistribution] = useState(generateStatusDistributionData());
  
  // Simulate data refresh every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeSeriesData(generateTimeSeriesData());
      setProcessingTimeData(generateProcessingTimeData());
      setStatusDistribution(generateStatusDistributionData());
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Live Queue Metrics</h2>
      
      {/* First row of metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Applications Over Time */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Applications Processing Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <AreaChart
                width={500}
                height={250}
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
                <Area type="monotone" dataKey="applications" stroke="#8884d8" fillOpacity={1} fill="url(#colorApplications)" />
                <Area type="monotone" dataKey="approved" stroke="#10b981" fillOpacity={1} fill="url(#colorApproved)" />
                <Area type="monotone" dataKey="rejected" stroke="#ef4444" fillOpacity={1} fill="url(#colorRejected)" />
              </AreaChart>
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
              <BarChart
                width={500}
                height={250}
                data={processingTimeData}
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgTime" radius={[4, 4, 0, 0]}>
                  {processingTimeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Second row of metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <Card className="bg-white md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Application Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <PieChart width={250} height={250}>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={(entry) => entry.name}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          </CardContent>
        </Card>
        
        {/* Real-time SLA Metrics Card */}
        <Card className="bg-white md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">SLA Performance (Last 24 Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <LineChart
                width={500}
                height={250}
                data={[
                  { time: '00:00', within: 95 },
                  { time: '04:00', within: 97 },
                  { time: '08:00', within: 92 },
                  { time: '12:00', within: 98 },
                  { time: '16:00', within: 95 },
                  { time: '20:00', within: 97 },
                  { time: 'Now', within: 96 }
                ]}
                margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[80, 100]} />
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
                {/* Target line at 95% */}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveMetricsSection;