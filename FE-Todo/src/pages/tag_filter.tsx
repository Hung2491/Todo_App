import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useParams, useNavigate } from "react-router";
import TodoItem from "../components/todo_Item";
import { UseTodoContext } from "../context/todoContext";
import FavoriteIcon from "@mui/icons-material/Favorite";
import WorkIcon from "@mui/icons-material/Work";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import FolderIcon from "@mui/icons-material/Folder";
import type { JSX } from "react";

const TAG_INFO: Record<
  string,
  { icon: JSX.Element; color: string; iconColor: string }
> = {
  Health: {
    icon: <FavoriteIcon sx={{ fontSize: 40 }} />,
    color: "#f2f4fe",
    iconColor: "#7990f8",
  },
  Work: {
    icon: <WorkIcon sx={{ fontSize: 40 }} />,
    color: "#edfaf3",
    iconColor: "#46cf8b",
  },

  Mental: {
    icon: <VolunteerActivismIcon sx={{ fontSize: 40 }} />,
    color: "#f8eff7",
    iconColor: "#bf66b1",
  },
  Others: {
    icon: <FolderIcon sx={{ fontSize: 40 }} />,
    color: "#f4f3f3",
    iconColor: "#908986",
  },
};

export default function TagFilter() {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const { todos, toggleTodo, deleteTodo, updateTodo } = UseTodoContext();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // Lọc todos theo tag
  const filteredTodos = todos.filter((todo) => todo.tag === tag);

  const activeTodos = filteredTodos.filter((todo) => !todo.completed);
  const completedTodos = filteredTodos.filter((todo) => todo.completed);

  const tagInfo = TAG_INFO[tag || "Others"];
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
        {/* Header with back button */}
        <Box sx={styles.header}>
          <IconButton sx={styles.backButton} onClick={() => navigate("/")}>
            <ArrowBackIcon />
          </IconButton>
        </Box>

        {/* Tag Info Card */}
        <Box
          sx={{
            ...styles.tagCard,
            backgroundColor: tagInfo.color,
          }}
        >
          <Box sx={{ ...styles.tagIcon, color: tagInfo.iconColor }}>
            {tagInfo.icon}
          </Box>
          <Box>
            <Typography variant={isMobile ? "h5" : "h4"} sx={styles.tagTitle}>
              {tag}
            </Typography>
            <Typography variant="body1" sx={styles.tagSubtitle}>
              {totalCount} {totalCount === 1 ? "task" : "tasks"}
            </Typography>
          </Box>
        </Box>

        {/* Progress Summary */}
        <Box sx={styles.summaryBox}>
          <Typography variant="body1" sx={styles.summaryText}>
            {completedCount} of {totalCount} tasks completed
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
              No tasks in {tag} category yet
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
  contentBox: {
    paddingTop: "30px",
    paddingBottom: "30px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
  },
  backButton: {
    color: "#393433",
  },
  tagCard: {
    padding: "30px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: 3,
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  tagIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tagTitle: {
    fontWeight: 600,
    color: "#393433",
    marginBottom: "5px",
  },
  tagSubtitle: {
    color: "#666",
    fontWeight: 500,
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
