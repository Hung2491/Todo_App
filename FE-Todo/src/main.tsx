import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/home";
import AddTodo from "./pages/add_todo";
import Detail from "./pages/detail";
import { TodoProvider } from "./context/todoContext";
import TagFilter from "./pages/tag_filter";

const root = document.getElementById("root");

if (root) {
  ReactDOM.createRoot(root).render(
    <TodoProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/addTodo" element={<AddTodo />} />
          <Route path="/detail/:date" element={<Detail />} />
          <Route path="/tag/:tag" element={<TagFilter />} />
        </Routes>
      </BrowserRouter>
    </TodoProvider>
  );
}
