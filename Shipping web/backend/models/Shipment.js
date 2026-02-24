const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  cargo_id: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
  },
  sender: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
  },
  receiver: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
  },
  origin: {
    type: String,
    required: true,
    trim: true,
  },
  destination: {
    type: String,
    required: true,
    trim: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  shipment_type: {
    type: String,
    enum: ['Air', 'Sea', 'Road'],
    required: true,
  },
  package_description: {
    type: String,
    required: true,
    trim: true,
  },
  estimated_delivery: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'In Transit', 'On Hold', 'Out for Delivery', 'Delivered'],
    default: 'Pending',
  },
  current_location: {
    type: String,
    required: true,
    trim: true,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tracking_history: [{
    location: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    }
  }]
}, {
  timestamps: true,
});

// Index for efficient searching
shipmentSchema.index({ cargo_id: 1 });
shipmentSchema.index({ status: 1 });
shipmentSchema.index({ 'receiver.name': 1 });

module.exports = mongoose.model('Shipment', shipmentSchema);