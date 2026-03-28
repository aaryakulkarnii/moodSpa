import mongoose, { Schema, Document } from "mongoose";

// ─── Message ───────────────────────────────────────────────
export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

// ─── Conversation ───────────────────────────────────────────
export interface IConversation extends Document {
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    sessionId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
export const Conversation = mongoose.model<IConversation>("Conversation", ConversationSchema);
