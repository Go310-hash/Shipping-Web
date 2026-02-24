const express = require('express');
const mongoose = require('mongoose');
const Shipment = require('../models/Shipment');
const User = require('../models/User');
const { auth, authorizeRoles } = require('../middleware/auth');
const Joi = require('joi');
const {
  sendShipmentCreatedNotification,
  sendStatusChangeNotification,
  sendDeliveryNotification
} = require('../utils/notifications');

const router = express.Router();

// Helper function to generate a unique cargo ID
const generateCargoId = () => {
  return `CARGO-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

// Create a new shipment (Admin only)
router.post('/', auth, authorizeRoles('admin', 'super_admin'), async (req, res) => {
  try {
    const schema = Joi.object({
      cargo_id: Joi.string().optional().uppercase().trim(),
      sender: Joi.object({
        name: Joi.string().required(),
        address: Joi.string().required(),
        phone: Joi.string().required(),
        email: Joi.string().email().required(),
      }).required(),
      receiver: Joi.object({
        name: Joi.string().required(),
        address: Joi.string().required(),
        phone: Joi.string().required(),
        email: Joi.string().email().required(),
      }).required(),
      origin: Joi.string().required(),
      destination: Joi.string().required(),
      weight: Joi.number().positive().required(),
      shipment_type: Joi.string().valid('Air', 'Sea', 'Road').required(),
      package_description: Joi.string().required(),
      estimated_delivery: Joi.date().iso().required(),
      current_location: Joi.string().required(),
      status: Joi.string().valid('Pending', 'Processing', 'In Transit', 'On Hold', 'Out for Delivery', 'Delivered').default('Pending'),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    let { cargo_id, ...shipmentData } = req.body;

    // If no cargo_id provided, auto-generate one
    if (!cargo_id) {
      cargo_id = generateCargoId();
    } else {
      // Validate that the provided cargo_id is unique
      const existingShipment = await Shipment.findOne({ cargo_id: cargo_id.toUpperCase() });
      if (existingShipment) {
        return res.status(400).json({ message: 'Cargo ID already exists' });
      }
    }

    const shipment = new Shipment({
      ...shipmentData,
      cargo_id: cargo_id.toUpperCase(),
      created_by: req.user._id,
      tracking_history: [{
        location: shipmentData.current_location,
        status: shipmentData.status,
        description: `Shipment created with status: ${shipmentData.status}`,
        timestamp: new Date()
      }]
    });

    await shipment.save();

    // Send notification for new shipment
    try {
      await sendShipmentCreatedNotification(shipment);
    } catch (notificationError) {
      console.error('Error sending shipment creation notification:', notificationError);
    }

    res.status(201).json({
      message: 'Shipment created successfully',
      shipment: shipment.toObject()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all shipments with pagination and filtering (Admin only)
router.get('/', auth, authorizeRoles('admin', 'super_admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = {};
    if (req.query.cargo_id) {
      filter.cargo_id = new RegExp(req.query.cargo_id, 'i');
    }
    if (req.query.receiver_name) {
      filter['receiver.name'] = new RegExp(req.query.receiver_name, 'i');
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const shipments = await Shipment.find(filter)
      .populate('created_by', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Shipment.countDocuments(filter);

    res.json({
      shipments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific shipment by cargo ID (Admin only)
router.get('/:cargoId', auth, authorizeRoles('admin', 'super_admin'), async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ cargo_id: req.params.cargoId.toUpperCase() })
      .populate('created_by', 'name email');

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    res.json({ shipment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a shipment (Admin only)
router.put('/:cargoId', auth, authorizeRoles('admin', 'super_admin'), async (req, res) => {
  try {
    const schema = Joi.object({
      sender: Joi.object({
        name: Joi.string().optional(),
        address: Joi.string().optional(),
        phone: Joi.string().optional(),
        email: Joi.string().email().optional(),
      }),
      receiver: Joi.object({
        name: Joi.string().optional(),
        address: Joi.string().optional(),
        phone: Joi.string().optional(),
        email: Joi.string().email().optional(),
      }),
      origin: Joi.string().optional(),
      destination: Joi.string().optional(),
      weight: Joi.number().positive().optional(),
      shipment_type: Joi.string().valid('Air', 'Sea', 'Road').optional(),
      package_description: Joi.string().optional(),
      estimated_delivery: Joi.date().iso().optional(),
      current_location: Joi.string().optional(),
      status: Joi.string().valid('Pending', 'Processing', 'In Transit', 'On Hold', 'Out for Delivery', 'Delivered').optional(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const shipment = await Shipment.findOne({ cargo_id: req.params.cargoId.toUpperCase() });
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    // Prevent editing if status is 'Delivered' and user is not super admin
    if (shipment.status === 'Delivered' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Cannot edit delivered shipments' });
    }

    // Update shipment
    Object.assign(shipment, req.body);

    // Add tracking history if status or location changed
    const oldStatus = shipment._doc.status;
    const oldLocation = shipment._doc.current_location;
    
    if (req.body.status && req.body.status !== oldStatus) {
      shipment.tracking_history.push({
        location: req.body.current_location || shipment.current_location,
        status: req.body.status,
        description: `Status changed from ${oldStatus} to ${req.body.status}`,
        timestamp: new Date()
      });
    } else if (req.body.current_location && req.body.current_location !== oldLocation) {
      shipment.tracking_history.push({
        location: req.body.current_location,
        status: shipment.status,
        description: `Location updated to ${req.body.current_location}`,
        timestamp: new Date()
      });
    }

    await shipment.save();

    // Send notification if status changed
    if (req.body.status && req.body.status !== oldStatus) {
      try {
        if (req.body.status === 'Delivered') {
          await sendDeliveryNotification(shipment);
        } else {
          await sendStatusChangeNotification(shipment);
        }
      } catch (notificationError) {
        console.error('Error sending status change notification:', notificationError);
      }
    }

    res.json({
      message: 'Shipment updated successfully',
      shipment: shipment.toObject()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a shipment (Admin only)
router.delete('/:cargoId', auth, authorizeRoles('admin', 'super_admin'), async (req, res) => {
  try {
    const shipment = await Shipment.findOneAndDelete({ 
      cargo_id: req.params.cargoId.toUpperCase() 
    });

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    res.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark shipment as delivered (Admin only)
router.patch('/:cargoId/deliver', auth, authorizeRoles('admin', 'super_admin'), async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ cargo_id: req.params.cargoId.toUpperCase() });
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    shipment.status = 'Delivered';
    shipment.current_location = shipment.destination; // Set final destination as current location
    
    shipment.tracking_history.push({
      location: shipment.destination,
      status: 'Delivered',
      description: 'Package successfully delivered',
      timestamp: new Date()
    });

    await shipment.save();

    // Send delivery notification
    try {
      await sendDeliveryNotification(shipment);
    } catch (notificationError) {
      console.error('Error sending delivery notification:', notificationError);
    }

    res.json({
      message: 'Shipment marked as delivered',
      shipment: shipment.toObject()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard statistics (Admin only)
router.get('/stats/dashboard', auth, authorizeRoles('admin', 'super_admin'), async (req, res) => {
  try {
    const stats = await Shipment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalShipments = await Shipment.countDocuments();
    const recentShipments = await Shipment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('created_by', 'name');

    // Convert stats to object
    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      totalShipments,
      inTransit: statusCounts['In Transit'] || 0,
      delivered: statusCounts['Delivered'] || 0,
      onHold: statusCounts['On Hold'] || 0,
      pending: statusCounts['Pending'] || 0,
      processing: statusCounts['Processing'] || 0,
      outForDelivery: statusCounts['Out for Delivery'] || 0,
      recentShipments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;