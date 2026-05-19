export interface Todo {
  _id?: string;
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
