// models/AuctionTerms.js
import mongoose from 'mongoose';

const auctionTermsSchema = new mongoose.Schema({
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'auction', // Reference to the Auction model
    required: true,
  
  },
  title: {
    type: String,
    required: true,
    default: "Auction Terms & Conditions"
  },
  content: {
    type: String,
    required: true
  },
  version: {
    current: {
      type: String,
      default: "1.0.0"
    },
    history: [{
      version: String,
      content: String,
      updatedAt: Date,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      },
      reason: String
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'draft'
  },
  language: {
    code: {
      type: String,
      default: 'en'
    },
    name: {
      type: String,
      default: 'English'
    }
  },
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  expirationDate: Date
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
auctionTermsSchema.index({ auction: 1 });
auctionTermsSchema.index({ status: 1 });
auctionTermsSchema.index({ 'language.code': 1 });

// Middleware to save version history before update
auctionTermsSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.version.history.push({
      version: this.version.current,
      content: this.content,
      updatedAt: new Date(),
      updatedBy: this._updatedBy, // Set this before saving
      reason: this._updateReason // Set this before saving
    });
  }
  next();
});

const AuctionTerms = mongoose.model('AuctionTerms', auctionTermsSchema);

export default AuctionTerms;