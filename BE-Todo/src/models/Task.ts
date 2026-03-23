import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  comment: string;
  tag: string;
  date: string;
  completed: boolean;
}

const TaskSchema: Schema = new Schema({
  title: { type: String, required: true },
  comment: { type: String, required: true },
  tag: { type: String, required: true },
  date: { type: String, required: true },
  completed: { type: Boolean, required: true },
});

export default mongoose.model<ITask>('Task', TaskSchema);