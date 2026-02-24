import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface DashboardStats {
  totalShipments: number;
  inTransit: number;
  delivered: number;
  onHold: number;
  pending: number;
  processing: number;
  outForDelivery: number;
  recentShipments: any[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/shipments/stats/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStats(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : stats ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Shipments" value={stats.totalShipments} color="text-blue-600" />
              <StatCard title="In Transit" value={stats.inTransit} color="text-blue-600" />
              <StatCard title="Delivered" value={stats.delivered} color="text-green-600" />
              <StatCard title="On Hold" value={stats.onHold} color="text-yellow-600" />
            </div>

            {/* Recent Shipments */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Shipments</h2>
                <Link 
                  to="/shipments" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receiver</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentShipments.map((shipment) => (
                      <tr key={shipment._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{shipment.cargo_id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{shipment.receiver.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            shipment.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            shipment.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                            shipment.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                            shipment.status === 'On Hold' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {shipment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {shipment.current_location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link to={`/shipments/${shipment.cargo_id}`} className="text-blue-600 hover:text-blue-900">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link 
                    to="/shipments/create" 
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Create New Shipment
                  </Link>
                  <a 
                    href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/tracking/export/csv`}
                    className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                  >
                    Export Shipments (CSV)
                  </a>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default Dashboard;