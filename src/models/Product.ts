import mongoose from 'mongoose';

const ProductDenominationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true }, // price in USD
  priceBDT: { type: Number, required: true }, // price in BDT
  originalAmount: Number,
  bonus: String,
  bonusLabel: String,
  bonusAmount: Number,
  popular: { type: Boolean, default: false }
});

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  bannerImage: String,
  publisher: String,
  region: { type: String, default: 'Global' },
  deliveryType: { type: String, enum: ['Instant', 'Manual (5-10 min)', 'Pre-Order'], default: 'Instant' },
  inStock: { type: Boolean, default: true },
  isHot: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  discountPercent: Number,
  rating: { type: Number, default: 5.0 },
  reviewCount: { type: Number, default: 0 },
  description: { type: String, required: true },
  instructions: String,
  playerIdLabel: { type: String, default: 'Email Address' },
  playerIdPlaceholder: String,
  howToFindPlayerId: [String],
  hasServerId: { type: Boolean, default: false },
  requiresServerId: { type: Boolean, default: false },
  serverIdLabel: String,
  denominations: [ProductDenominationSchema],
  tags: [String]
}, { timestamps: true });

// Check if model already exists before compilation (Next.js HMR support)
export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
