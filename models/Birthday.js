const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema(
  {
    dataUrl: { type: String, default: null },
    caption: { type: String, default: '' }
  },
  { _id: false }
);

const BirthdaySchema = new mongoose.Schema(
  {
    configId: { type: String, default: 'default', index: true },
    name: { type: String, default: '' },
    age: { type: Number, default: 0 },
    photos: {
      type: [PhotoSchema],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length === 6;
        },
        message: 'photos must be an array of 6 photos'
      },
      default: () => Array.from({ length: 6 }, () => ({ dataUrl: null, caption: '' }))
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Birthday', BirthdaySchema);

