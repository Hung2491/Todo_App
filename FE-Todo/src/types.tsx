export interface Todo {
  _id?: number;
  title: string;
  comment: string;
  tag: string;
  date: string;
  completed: boolean;
}

export interface AddTodo {
  title: string;
  comment: string;
  tag: string;
  date: string;
  completed: boolean;
}
