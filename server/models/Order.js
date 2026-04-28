const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  // Snapshot fields — stored at order time so they persist even if product is edited/deleted
  productName: { type: String },
  productImage: { type: String },
});

const orderSchema = new mongoose.Schema({
  products: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
  },
  placedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customerName: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
