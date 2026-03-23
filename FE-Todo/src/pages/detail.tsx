import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import { useNavigate, useParams } from "react-router";
import TodoItem from "../components/todo_Item";
import { UseTodoContext } from "../context/todoContext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function Detail() {
  const { date } = useParams<{ date: string }>();
  const { getTodosByDate, toggleTodo, deleteTodo, updateTodo } =
    UseTodoContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const navigate = useNavigate();
  const filteredTodos = getTodosByDate(date || "");
  const activeTodos = filteredTodos.filter((todo) => !todo.completed);
  const completedTodos = filteredTodos.filter((todo) => todo.completed);
  const completedCount = completedTodos.length;
  const totalCount = filteredTodos.length;

  return (
    <Box sx={styles.container}>
      <Box
        sx={{
          ...styles.contentBox,
          width: isMobile ? "90%" : isTablet ? "70%" : "50%",
        }}
      >
        {/* Header */}
        <Box sx={styles.header}>
          <IconButton sx={styles.backButton} onClick={() => navigate("/")}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant={isMobile ? "h5" : "h4"} sx={styles.title}>
            Tasks for {date}
          </Typography>
        </Box>

        {/* Summary */}
        <Box sx={styles.summaryBox}>
          <Typography variant="body1" sx={styles.summaryText}>
            {completedCount} of {totalCount} Tasks complete
          </Typography>
          <Box sx={styles.progressBar}>
            <Box
              sx={{
                ...styles.progressFill,
                width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
              }}
            />
          </Box>
        </Box>

        {/* Empty state */}
        {filteredTodos.length === 0 && (
          <Box sx={styles.emptyState}>
            <Typography variant="body1" sx={styles.emptyText}>
              No task for this date
            </Typography>
          </Box>
        )}

        {/* Active Tasks Section */}
        {activeTodos.length > 0 && (
          <Box>
            <Typography variant="h6" sx={styles.sectionTitle}>
              Pending ({activeTodos.length})
            </Typography>
            {activeTodos.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onUpdate={updateTodo}
              />
            ))}
          </Box>
        )}

        {/* Completed Tasks Section */}
        {completedTodos.length > 0 && (
          <Box sx={{ mt: activeTodos.length > 0 ? 4 : 0 }}>
            <Typography variant="h6" sx={styles.sectionTitle}>
              Completed ({completedTodos.length})
            </Typography>
            {completedTodos.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onUpdate={updateTodo}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    backgroundColor: "#fafafa",
  },
  backButton: {
    color: "#393433",
  },
  contentBox: {
    paddingTop: "30px",
    paddingBottom: "30px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "30px",
    gap: 2,
  },
  title: {
    fontWeight: 600,
    color: "#393433",
  },
  summaryBox: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  summaryText: {
    fontWeight: 500,
    color: "#666",
    marginBottom: "12px",
  },
  progressBar: {
    width: "100%",
    height: "8px",
    backgroundColor: "#e7e7e7",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#46cf8b",
    transition: "width 0.3s ease",
  },
  sectionTitle: {
    fontWeight: 600,
    color: "#393433",
    marginTop: "30px",
    marginBottom: "10px",
    marginLeft: "10px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    marginTop: "40px",
    backgroundColor: "#fff",
    borderRadius: "12px",
  },
  emptyText: {
    color: "#999",
    fontWeight: 500,
  },
};
