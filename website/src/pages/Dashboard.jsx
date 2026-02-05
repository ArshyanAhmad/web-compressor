/**
 * Dashboard Page
 * 
 * This page displays:
 * - Analytics charts (performance, speed, optimization stats)
 * - URL input field to optimize any website
 * - Detailed metrics for websites analyzed via extension or website
 * - Beautiful, modern charts using Recharts
 * - Clean, professional UI with Tailwind CSS
 */

import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { API_ENDPOINTS } from '../config'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

function Dashboard() {
  const [searchParams] = useSearchParams()
  const [url, setUrl] = useState('')
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)

  // Parse data from URL if coming from extension
  useEffect(() => {
    const dataParam = searchParams.get('data')
    if (dataParam) {
      try {
        const data = JSON.parse(decodeURIComponent(dataParam))
        setMetrics(data.metrics)
        setUrl(data.url)
      } catch (e) {
        console.error('Failed to parse data:', e)
      }
    }
  }, [searchParams])

  // Sample data structure for charts
  const chartData = metrics ? [
    {
      name: 'Before',
      'Load Time (ms)': metrics.beforeLoadTime || 0,
      'Page Size (KB)': (metrics.beforeSize || 0) / 1024,
    },
    {
      name: 'After',
      'Load Time (ms)': metrics.afterLoadTime || 0,
      'Page Size (KB)': (metrics.afterSize || 0) / 1024,
    }
  ] : []

  const optimizationData = metrics ? [
    { name: 'Images Removed', value: metrics.imagesRemoved || 0 },
    { name: 'CSS Removed', value: metrics.cssRemoved || 0 },
    { name: 'Videos Removed', value: metrics.videosRemoved || 0 },
    { name: 'Fonts Removed', value: metrics.fontsRemoved || 0 },
  ] : []

  const COLORS = ['#8b5cf6', '#6366f1', '#ec4899', '#f59e0b']

  const handleOptimize = async () => {
    if (!url.trim()) {
      alert('Please enter a valid URL')
      return
    }

    // Ensure URL has protocol
    let targetUrl = url.trim()
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl
    }

    setLoading(true)
    
    try {
      // Call backend API to optimize
      const response = await fetch(API_ENDPOINTS.optimize, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: targetUrl,
          removeCSS: true,
          removeImages: true,
          removeVideos: true,
          removeFonts: true
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to optimize website')
      }

      const data = await response.json()
      
      // Set metrics
      setMetrics(data.metrics)
      
      // Open optimized version in new tab
      const optimizedUrl = `${API_ENDPOINTS.optimizePage}?url=${encodeURIComponent(targetUrl)}`
      window.open(optimizedUrl, '_blank')
      
    } catch (error) {
      console.error('Optimization error:', error)
      alert(`Failed to optimize: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatTime = (ms) => {
    if (ms < 1000) return Math.round(ms) + 'ms'
    return (ms / 1000).toFixed(2) + 's'
  }

  const performanceGain = metrics && metrics.beforeLoadTime
    ? ((metrics.loadTimeReduction / metrics.beforeLoadTime) * 100).toFixed(1)
    : 0

  return (
    <div className="min-h-screen bg-light-grey">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-bold text-blackish">Compressor</span>
            </Link>
            <Link to="/" className="text-dark-grey hover:text-purple-600 transition">
              Home
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track performance optimization and website metrics</p>
        </div>

        {/* URL Input Section */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">Optimize a Website</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter website URL (e.g., https://example.com)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              onClick={handleOptimize}
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Optimizing...' : 'Optimize'}
            </button>
          </div>
        </div>

        {/* Current Website Info */}
        {url && (
          <div className="card mb-8">
            <h3 className="text-lg font-semibold mb-2">Current Website</h3>
            <p className="text-gray-600 break-all">{url}</p>
          </div>
        )}

        {/* Metrics Overview Cards */}
        {metrics && (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="card text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {performanceGain}%
                </div>
                <div className="text-gray-600">Performance Gain</div>
              </div>
              
              <div className="card text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatTime(metrics.loadTimeReduction)}
                </div>
                <div className="text-gray-600">Time Saved</div>
              </div>
              
              <div className="card text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatBytes(metrics.sizeReduction)}
                </div>
                <div className="text-gray-600">Size Reduced</div>
              </div>
              
              <div className="card text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {metrics.imagesRemoved || 0}
                </div>
                <div className="text-gray-600">Images Removed</div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Load Time Comparison */}
              <div className="card">
                <h3 className="text-xl font-bold mb-4">Load Time Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Load Time (ms)" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Page Size Comparison */}
              <div className="card">
                <h3 className="text-xl font-bold mb-4">Page Size Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Page Size (KB)" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Optimization Breakdown */}
            <div className="card mb-8">
              <h3 className="text-xl font-bold mb-4">Optimization Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={optimizationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {optimizationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Metrics Table */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Detailed Metrics</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Metric</th>
                      <th className="text-right py-3 px-4">Before</th>
                      <th className="text-right py-3 px-4">After</th>
                      <th className="text-right py-3 px-4">Improvement</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Load Time</td>
                      <td className="py-3 px-4 text-right">{formatTime(metrics.beforeLoadTime)}</td>
                      <td className="py-3 px-4 text-right text-green-600 font-semibold">
                        {formatTime(metrics.afterLoadTime)}
                      </td>
                      <td className="py-3 px-4 text-right text-purple-600 font-semibold">
                        -{formatTime(metrics.loadTimeReduction)}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Page Size</td>
                      <td className="py-3 px-4 text-right">{formatBytes(metrics.beforeSize)}</td>
                      <td className="py-3 px-4 text-right text-green-600 font-semibold">
                        {formatBytes(metrics.afterSize)}
                      </td>
                      <td className="py-3 px-4 text-right text-purple-600 font-semibold">
                        -{formatBytes(metrics.sizeReduction)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Resources Removed</td>
                      <td className="py-3 px-4 text-right" colSpan={3}>
                        <div className="flex justify-end gap-4">
                          <span>Images: {metrics.imagesRemoved || 0}</span>
                          <span>CSS: {metrics.cssRemoved || 0}</span>
                          <span>Videos: {metrics.videosRemoved || 0}</span>
                          <span>Fonts: {metrics.fontsRemoved || 0}</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!metrics && (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-2">No Data Yet</h3>
            <p className="text-gray-600 mb-6">
              Enter a URL above to optimize a website, or use the extension to analyze a page.
            </p>
            <Link to="/" className="btn-primary inline-block">
              Learn More About Compressor
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
