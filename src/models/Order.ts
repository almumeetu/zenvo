import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productTitle: { type: String, required: true },
  productImage: { type: String, required: true },
  denomination: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    priceBDT: { type: Number, required: true }
  },
  quantity: { type: Number, default: 1 },
  playerId: { type: String, required: true },
  serverId: String
});

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: String, default: 'guest' },
  userEmail: { type: String, required: true },
  items: [OrderItemSchema],
  totalUSD: { type: Number, required: true },
  currency: { type: String, default: 'BDT' },
  paidAmountCurrency: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, default: 'Paid' },
  fulfillmentStatus: { type: String, enum: ['Processing', 'Delivered', 'Refunded'], default: 'Processing' },
  playerId: { type: String, required: true },
  serverId: String,
  transactionId: { type: String, unique: true, required: true }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
