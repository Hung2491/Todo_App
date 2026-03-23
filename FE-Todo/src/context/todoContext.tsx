import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { AddTodo, Todo } from "../types";

interface TodoContextType {
  todos: Todo[];
  addTodo: (todo: Omit<Todo, "id">) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  updateTodo: (id: number, updatedFields: Partial<Todo>) => void;
  getTodosByDate: (date: string) => Todo[];
  countByTag: (tag: string) => number;
  loading: boolean;
  error: string | null;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

interface TodoProviderProps {
  children: ReactNode;
}

// Thay đổi URL này thành API endpoint của bạn
const API_BASE_URL = "http://localhost:3000/tasks";

export const TodoProvider = ({ children }: TodoProviderProps) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch todos from API on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_BASE_URL);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch todos");
      console.error("Error fetching todos:", err);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (todo: AddTodo) => {
    try {
      setError(null);
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(todo),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newTodo: Todo = await response.json();
      setTodos([...todos, newTodo]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add todo");
      console.error("Error adding todo:", err);
      // Optionally: rollback or show error to user
    }
  };

  const toggleTodo = async (id: number) => {
    const todo = todos.find((t) => t._id === id);
    if (!todo) return;

    const updatedTodo = { ...todo, completed: !todo.completed };

    // Optimistic update
    setTodos(todos.map((t) => (t._id === id ? updatedTodo : t)));

    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTodo),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Optionally update with response data
      const serverTodo = await response.json();
      setTodos(todos.map((t) => (t._id === id ? serverTodo : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle todo");
      console.error("Error toggling todo:", err);
      // Rollback optimistic update
      setTodos(todos.map((t) => (t._id === id ? todo : t)));
    }
  };

  const deleteTodo = async (id: number) => {
    // Optimistic delete
    const previousTodos = [...todos];
    setTodos(todos.filter((t) => t._id !== id));

    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete todo");
      console.error("Error deleting todo:", err);
      // Rollback
      setTodos(previousTodos);
    }
  };

  const updateTodo = async (id: number, updatedFields: Partial<Todo>) => {
    const todo = todos.find((t) => t._id === id);
    if (!todo) return;

    const updatedTodo = { ...todo, ...updatedFields };

    // Optimistic update
    setTodos(todos.map((t) => (t._id === id ? updatedTodo : t)));

    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTodo),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Optionally update with response data
      const serverTodo = await response.json();
      setTodos(todos.map((t) => (t._id === id ? serverTodo : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update todo");
      console.error("Error updating todo:", err);
      // Rollback
      setTodos(todos.map((t) => (t._id === id ? todo : t)));
    }
  };

  const getTodosByDate = (date: string) => {
    return todos.filter((todo) => {
      const parts = todo.date.split(" - ");
      const todoDate = parts.length > 1 ? parts[1] : todo.date;
      return todoDate === date;
    });
  };

  const countByTag = (tag: string) => {
    return todos.filter((t) => t.tag === tag).length;
  };

  const value: TodoContextType = {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    getTodosByDate,
    countByTag,
    loading,
    error,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

export const UseTodoContext = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error("useTodoContext must be used within a TodoProvider");
  }
  return context;
};
