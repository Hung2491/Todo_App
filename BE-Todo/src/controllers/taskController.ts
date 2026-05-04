import { Request, Response } from 'express';
import Task, { ITask } from '../models/Task';
import logger from '../utils/logger';
import mongoose from 'mongoose';

// Kiểm tra MongoDB đang có kết nối không (dùng khi bufferCommands: false)
const isMongoConnected = () => mongoose.connection.readyState === 1;

export const getAllTasks = async (req: Request, res: Response) => {
  if (!isMongoConnected()) {
    logger.warn('MongoDB not ready - replica failover in progress');
    res.setHeader('Retry-After', '10');
    return res.status(503).json({ error: 'Database temporarily unavailable, please retry' });
  }
  try {
    const tasks = await Task.find();
    logger.info('Fetched all tasks', { count: tasks.length });
    res.json(tasks);
  } catch (error) {
    logger.error('Failed to fetch tasks', { error: (error as Error).message });
    res.status(500).json({ error: 'Server error' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, comment, tag, date, completed } = req.body;
    const newTask = new Task({ title, comment, tag, date, completed });
    await newTask.save();
    logger.info('Task created', { id: String(newTask._id), title: newTask.title });
    res.status(201).json(newTask);
  } catch (error) {
    logger.error('Failed to create task', {
      error: (error as Error).message,
      body: req.body,
    });
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, comment, tag, date, completed } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { title, comment, tag, date, completed },
      { new: true, runValidators: true }
    );
    if (!updatedTask) {
      logger.warn('Task not found for update', { id });
      return res.status(404).json({ error: 'Task not found' });
    }
    logger.info('Task updated', { id, title: updatedTask.title });
    res.json(updatedTask);
  } catch (error) {
    logger.error('Failed to update task', { id: req.params.id, error: (error as Error).message });
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      logger.warn('Task not found for deletion', { id });
      return res.status(404).json({ error: 'Task not found' });
    }
    logger.info('Task deleted', { id, title: deletedTask.title });
    res.status(204).send();
  } catch (error) {
    logger.error('Failed to delete task', { id: req.params.id, error: (error as Error).message });
    res.status(500).json({ error: 'Server error' });
  }
};