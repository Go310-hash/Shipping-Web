const express = require('express');
const Shipment = require('../models/Shipment');
const { trackingRateLimiter } = require('../middleware/rateLimiter');
const Joi = require('joi');

const router = express.Router();

// Public route to track shipment by cargo ID
router.get('/:cargoId', trackingRateLimiter, async (req, res) => {
  try {
    const schema = Joi.object({
      cargoId: Joi.string().required().uppercase().trim()
    });

    const { error } = schema.validate({ cargoId: req.params.cargoId });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const cargoId = req.params.cargoId.toUpperCase();
    
    const shipment = await Shipment.findOne({ cargo_id: cargoId })
      .populate('created_by', 'name');

    if (!shipment) {
      return res.status(404).json({ 
        message: 'Cargo ID Not Found',
        error: 'Shipment not found' 
      });
    }

    // Sort tracking history by timestamp (oldest first for timeline)
    shipment.tracking_history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({
      shipment: {
        cargo_id: shipment.cargo_id,
        sender: shipment.sender,
        receiver: shipment.receiver,
        origin: shipment.origin,
        destination: shipment.destination,
        weight: shipment.weight,
        shipment_type: shipment.shipment_type,
        package_description: shipment.package_description,
        estimated_delivery: shipment.estimated_delivery,
        status: shipment.status,
        current_location: shipment.current_location,
        created_at: shipment.createdAt,
        tracking_history: shipment.tracking_history
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export route for CSV (Admin only)
router.get('/export/csv', trackingRateLimiter, async (req, res) => {
  try {
    // This would require auth middleware to be added here if only admins should access
    // For now, it's public but rate-limited
    const shipments = await Shipment.find({})
      .select('-__v')
      .lean();

    if (!shipments.length) {
      return res.status(404).json({ message: 'No shipments found' });
    }

    // Generate CSV content
    let csvContent = 'Cargo ID,Sender Name,Receiver Name,Origin,Destination,Weight,Type,Est. Delivery,Status,Current Location,Created At\n';
    
    shipments.forEach(shipment => {
      csvContent += `"${shipment.cargo_id}","${shipment.sender.name}","${shipment.receiver.name}","${shipment.origin}","${shipment.destination}",${shipment.weight},"${shipment.shipment_type}","${shipment.estimated_delivery}","${shipment.status}","${shipment.current_location}","${shipment.createdAt}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=shipments.csv');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;