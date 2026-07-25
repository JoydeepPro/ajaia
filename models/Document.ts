import mongoose, { Schema, models } from "mongoose";

const ShareSchema = new Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  permission: { type: String, enum: ["view", "edit"], default: "edit" }
}, { _id: false });

const DocumentSchema = new Schema({
  title: { type: String, required: true, default: "Untitled document", trim: true, maxlength: 120 },
  content: { type: Schema.Types.Mixed, default: { type: "doc", content: [{ type: "paragraph" }] } },
  ownerId: { type: String, required: true, index: true },
  ownerEmail: { type: String, required: true, lowercase: true, index: true },
  shares: { type: [ShareSchema], default: [] }
}, { timestamps: true });

DocumentSchema.index({ "shares.email": 1 });

export default models.Document || mongoose.model("Document", DocumentSchema);
