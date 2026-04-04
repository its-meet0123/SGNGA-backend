const mongoose = require('mongoose');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../config/constants');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  whatsappPhone: {
    type: String,
    required: [true, 'WhatsApp phone number is required'],
    trim: true
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  items: [{
    itemName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    description: String
  }],
  deliveryAddress: {
    village: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    landmark: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'upi', 'pending'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['new', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled'],
    default: 'new'
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING
  },
  whatsappMessageId: String,
  whatsappThreadId: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create geospatial index for location-based delivery
orderSchema.index({ 'deliveryAddress.location.coordinates': '2dsphere' });

module.exports = mongoose.model('Order', orderSchema);
