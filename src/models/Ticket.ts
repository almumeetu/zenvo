import mongoose from 'mongoose';

const TicketMessageSchema = new mongoose.Schema({
  id: { type: String, required: true },
  sender: { type: String, enum: ['user', 'support', 'ai'], required: true },
  senderName: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: String, required: true }
});

const TicketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  subject: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  messages: [TicketMessageSchema]
}, { timestamps: true });

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
