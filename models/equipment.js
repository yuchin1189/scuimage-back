import { Schema, model } from 'mongoose'
import equipmentStatus from '../enums/EquipmentStatus.js'

const schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'equipmentNameRequired'],
    },
    image: {
      type: String,
      required: [true, 'equipmentImageRequired'],
    },
    description: {
      type: String,
      required: [true, 'equipmentDescriptionRequired'],
    },
    category: {
      type: String,
      required: [true, 'equipmentCategoryRequired'],
      enum: {
        values: ['filmCamera', 'digitalCamera', 'lens', 'tripod', 'book', 'accessories'],
        message: 'equipmentCategoryInvalid',
      },
    },
    status: {
      type: Number,
      required: [true, 'equipmentStatusRequired'],
      default: equipmentStatus.AVAILABLE,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
)

export default model('equipments', schema)
