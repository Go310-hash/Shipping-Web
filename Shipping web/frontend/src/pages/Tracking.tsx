import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface TrackingHistory {
  location: string;
  status: string;
  description: string;
  timestamp: string;
}

interface Shipment {
  cargo_id: string;
  sender: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  receiver: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  origin: string;
  destination: string;
  weight: number;
  shipment_type: string;
  package_description: string;
  estimated_delivery: string;
  status: string;
  current_location: string;
  created_at: string;
  tracking_history: TrackingHistory[];
}

const Tracking: React.FC = () => {
  const { cargoId } = useParams<{ cargoId: string }>();
  const [cargoIdInput, setCargoIdInput] = useState(cargoId || '');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTrackingData = async () => {
    if (!cargoIdInput.trim()) {
      setError('Please enter a Cargo ID');
      return;
    }

    setLoading(true);
    setError('');
    setShipment(null);

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/tracking/${cargoIdInput}`);
      setShipment(response.data.shipment);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Shipment not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cargoId) {
      setCargoIdInput(cargoId);
      fetchTrackingData();
    }
  }, [cargoId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrackingData();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'in transit':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'on hold':
        return 'text-red-600 bg-red-100';
      case 'out for delivery':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Shipment</h1>
          <p className="text-gray-600">Enter your Cargo ID to track your shipment</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={cargoIdInput}
              onChange={(e) => setCargoIdInput(e.target.value)}
              placeholder="Enter Cargo ID (e.g., CARGO-12345)"
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track Shipment'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            <strong>Error:</strong> {error}
          </div>
        )}

        {shipment && (
          <div className="space-y-6">
            {/* Shipment Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipment Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Sender</h3>
                  <p className="text-gray-600">{shipment.sender.name}</p>
                  <p className="text-gray-600">{shipment.sender.address}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Receiver</h3>
                  <p className="text-gray-600">{shipment.receiver.name}</p>
                  <p className="text-gray-600">{shipment.receiver.address}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Route</h3>
                  <p className="text-gray-600"><span className="font-medium">From:</span> {shipment.origin}</p>
                  <p className="text-gray-600"><span className="font-medium">To:</span> {shipment.destination}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Details</h3>
                  <p className="text-gray-600"><span className="font-medium">Weight:</span> {shipment.weight} kg</p>
                  <p className="text-gray-600"><span className="font-medium">Type:</span> {shipment.shipment_type}</p>
                  <p className="text-gray-600"><span className="font-medium">Description:</span> {shipment.package_description}</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Cargo ID</p>
                    <p className="font-mono font-semibold">{shipment.cargo_id}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Current Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(shipment.status)}`}>
                      {shipment.status}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Current Location</p>
                    <p className="font-medium">{shipment.current_location}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Estimated Delivery</p>
                    <p className="font-medium">{new Date(shipment.estimated_delivery).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tracking Timeline</h2>
              
              <div className="space-y-6">
                {shipment.tracking_history.map((event, index) => (
                  <div key={index} className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`w-4 h-4 rounded-full ${
                        index === shipment.tracking_history.length - 1 
                          ? 'bg-blue-600' 
                          : 'bg-gray-300'
                      }`}></div>
                      {index < shipment.tracking_history.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                      )}
                    </div>
                    
                    <div className="pb-6 flex-1">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex flex-wrap justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{event.status}</h3>
                            <p className="text-gray-600">{event.location}</p>
                            <p className="mt-1 text-gray-700">{event.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {new Date(event.timestamp).toLocaleDateString()} 
                              {' '}at{' '}
                              {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tracking;