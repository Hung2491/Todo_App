import { Request, Response } from 'express';
import Task, { ITask } from '../models/Task';
import logger from '../utils/logger';

const validateTaskInput = (title: any, comment: any, tag: any, date: any, completed: any) => {
  if (typeof title !== 'string' || title.trim().length === 0 || title.length > 255) return false;
  if (typeof comment !== 'string' || comment.length > 2000) return false;
  if (typeof tag !== 'string' || tag.length > 50) return false;
  if (typeof date !== 'string' || date.length > 50) return false;
  if (typeof completed !== 'boolean') return false;
  
  // Chặn HTML/Script tags cơ bản
  const htmlPattern = /<[^>]*>?/gm;
  if (htmlPattern.test(title) || htmlPattern.test(comment) || htmlPattern.test(tag)) return false;

  return true;
};

export const getAllTasks = async (req: Request, res: Response) => {
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
    
    if (!validateTaskInput(title, comment, tag, date, completed)) {
      logger.warn('Invalid task input data', { body: req.body });
      return res.status(400).json({ error: 'Invalid input data' });
    }

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

    if (!validateTaskInput(title, comment, tag, date, completed)) {
      logger.warn('Invalid task input data for update', { id, body: req.body });
      return res.status(400).json({ error: 'Invalid input data' });
    }

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