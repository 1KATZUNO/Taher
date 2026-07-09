import mongoose from "mongoose";

const jovenSchema = new mongoose.Schema(
  {
    nombreCompleto: {
      type: String,
      required: [true, "El nombre completo es obligatorio"],
      trim: true,
      minlength: [2, "El nombre es demasiado corto"],
    },
    direccion: {
      type: String,
      trim: true,
      default: "",
    },
    ciudad: {
      type: String,
      trim: true,
      default: "",
    },
    edad: {
      type: Number,
      required: [true, "La edad es obligatoria"],
      min: [1, "Edad inválida"],
      max: [120, "Edad inválida"],
    },
    telefono: {
      type: String,
      trim: true,
      default: "",
    },
    genero: {
      type: String,
      enum: ["masculino", "femenino"],
      required: [true, "El género es obligatorio"],
    },
    whatsappConsent: {
      type: Boolean,
      default: false,
    },
    salvo: {
      type: Boolean,
      default: false,
    },
    reconciliacion: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // crea createdAt y updatedAt
    collection: "jovenes",
  }
);

export default mongoose.model("Joven", jovenSchema);
