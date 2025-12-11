import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Clock,
  Eye,
  Share2,
  Heart,
} from 'lucide-react';

function Analytics() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y
  const [loading, setLoading] = useState(false);

  // Analytics data - will be populated from API calls
  const mockData = {
    totalEvents: 0,
    totalAttendees: 0,
    averageAttendance: 0,
    topCategory: 'None',
    engagementRate: 0,
    growthRate: 0,
    monthlyEvents: [0, 0, 0, 0, 0, 0],
    categoryDistribution: [],
    attendanceTrends: [],
    topEvents: [],
  };

  useEffect(() => {
    // Load analytics data from API
    setLoading(true);
    // TODO: Replace with actual API call
    setLoading(false);
  }, [timeRange]);

  // Early return if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const getGrowthColor = rate => {
    return rate >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = rate => {
    return rate >= 0 ? '↗' : '↘';
  };

  const formatNumber = num => {
    return num.toLocaleString();
  };

  const getCategoryColor = category => {
    switch (category) {
      case 'Technology':
        return 'bg-blue-500';
      case 'Education':
        return 'bg-green-500';
      case 'Networking':
        return 'bg-purple-500';
      case 'Social':
        return 'bg-pink-500';
      case 'Business':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
              Analytics Dashboard
            </h1>
            <p className="text-base text-gray-600">
              Track your event performance and insights
            </p>
          </div>
          <div>
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Events</p>
              <p className="text-xl font-bold text-gray-900">
                {formatNumber(mockData.totalEvents)}
              </p>
            </div>
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <span
              className={`text-xs font-medium ${getGrowthColor(mockData.growthRate)}`}
            >
              {getGrowthIcon(mockData.growthRate)}{' '}
              {Math.abs(mockData.growthRate)}%
            </span>
            <span className="text-xs text-gray-500 ml-1.5">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">
                Total Attendees
              </p>
              <p className="text-xl font-bold text-gray-900">
                {formatNumber(mockData.totalAttendees)}
              </p>
            </div>
            <div className="p-1.5 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <span className="text-xs font-medium text-green-600">
              ↗ {mockData.averageAttendance}
            </span>
            <span className="text-xs text-gray-500 ml-1.5">avg per event</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">
                Engagement Rate
              </p>
              <p className="text-xl font-bold text-gray-900">
                {mockData.engagementRate}%
              </p>
            </div>
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Heart className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <span className="text-xs font-medium text-blue-600">↗ 5.2%</span>
            <span className="text-xs text-gray-500 ml-1.5">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Top Category</p>
              <p className="text-xl font-bold text-gray-900">
                {mockData.topCategory}
              </p>
            </div>
            <div className="p-1.5 bg-orange-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <span className="text-xs font-medium text-orange-600">
              {mockData.categoryDistribution[0]?.percentage || 0}%
            </span>
            <span className="text-xs text-gray-500 ml-1.5">of total events</span>
          </div>
        </div>
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Monthly Events Trend */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Monthly Events Trend
          </h3>
          <div className="space-y-2">
            {mockData.monthlyEvents.map((count, index) => (
              <div key={index} className="flex items-center">
                <div className="w-12 text-xs text-gray-600">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}
                </div>
                <div className="flex-1 mx-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${mockData.monthlyEvents.length > 0 && Math.max(...mockData.monthlyEvents) > 0 
                          ? (count / Math.max(...mockData.monthlyEvents)) * 100 
                          : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="w-10 text-xs font-medium text-gray-900 text-right">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Event Categories
          </h3>
          <div className="space-y-2.5">
            {mockData.categoryDistribution.length > 0 ? (
              mockData.categoryDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${getCategoryColor(item.category)} mr-2`}
                    ></div>
                    <span className="text-xs font-medium text-gray-900">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 w-10 text-right">
                      {item.percentage || 0}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 text-center py-3">
                No category data available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Trends */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Attendance Trends
        </h3>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">
                  Month
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">
                  Events
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">
                  Total Attendees
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">
                  Avg per Event
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-700">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody>
              {mockData.attendanceTrends.length > 0 ? (
                mockData.attendanceTrends.map((month, index) => {
                  const prevMonth =
                    index > 0 ? mockData.attendanceTrends[index - 1] : null;
                  const growth = prevMonth
                    ? ((month.avgPerEvent - prevMonth.avgPerEvent) /
                        prevMonth.avgPerEvent) *
                      100
                    : 0;

                  return (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-2 px-3 text-xs font-medium text-gray-900">
                        {month.month}
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-600">
                        {month.events}
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-600">
                        {month.attendees}
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-600">
                        {month.avgPerEvent}
                      </td>
                      <td className="py-2 px-3 text-xs">
                        <span className={`font-medium ${getGrowthColor(growth)}`}>
                          {growth > 0 ? '+' : ''}
                          {growth.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-xs text-gray-500">
                    No attendance trends data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Performing Events */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Top Performing Events
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockData.topEvents.length > 0 ? (
            mockData.topEvents.map(event => (
              <div
                key={event.id}
                className="border border-gray-200 rounded-lg p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                    {event.title}
                  </h4>
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${getCategoryColor(event.category)} text-white`}
                  >
                    {event.category}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Attendance</span>
                    <span className="font-medium">
                      {event.attendees}/{event.maxAttendees}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${event.maxAttendees > 0 
                          ? (event.attendees / event.maxAttendees) * 100 
                          : 0}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Engagement</span>
                    <span className="font-medium text-green-600">
                      {event.engagement || 0}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-6 text-xs text-gray-500">
              No top performing events data available
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            rounded="lg"
            size="sm"
            fullWidth
            icon={<BarChart3 className="w-4 h-4 text-purple-600" />}
            className="flex-col h-auto py-3 gap-1.5 text-xs"
          >
            <span className="text-xs font-medium">Export Report</span>
          </Button>
          <Button
            variant="outline"
            rounded="lg"
            size="sm"
            fullWidth
            icon={<Share2 className="w-4 h-4 text-blue-600" />}
            className="flex-col h-auto py-3 gap-1.5 text-xs"
          >
            <span className="text-xs font-medium">Share Insights</span>
          </Button>
          <Button
            variant="outline"
            rounded="lg"
            size="sm"
            fullWidth
            icon={<Eye className="w-4 h-4 text-green-600" />}
            className="flex-col h-auto py-3 gap-1.5 text-xs"
          >
            <span className="text-xs font-medium">View Details</span>
          </Button>
          <Button
            variant="outline"
            rounded="lg"
            size="sm"
            fullWidth
            icon={<TrendingUp className="w-4 h-4 text-orange-600" />}
            className="flex-col h-auto py-3 gap-1.5 text-xs"
          >
            <span className="text-xs font-medium">Set Goals</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
