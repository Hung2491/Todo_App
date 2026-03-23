import { Request, Response } from 'express';
import Task, { ITask } from '../models/Task';

export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, comment, tag, date, completed } = req.body;
    // if (!title || !comment || !tag || !date || completed === undefined) {
    //   return res.status(400).json({ error: 'All fields are required' });
    // }
    const newTask = new Task({ title, comment, tag, date, completed });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.log(error)
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
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};