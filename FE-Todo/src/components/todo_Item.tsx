import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  IconButton,
  Typography,
  TextField,
  MenuItem,
  Select,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router";
import React from "react";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Todo } from "../types";
interface Props {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate?: (id: number, updatedTodo: Partial<Todo>) => void;
}

const TAGS = ["Work", "Health", "Mental", "Others"];

// Màu tương ứng với từng tag (giống Home)
const TAG_COLORS: Record<string, { background: string; text: string }> = {
  Health: { background: "#f2f4fe", text: "#7990f8" },
  Work: { background: "#edfaf3", text: "#46cf8b" },
  Mental: { background: "#f8eff7", text: "#bf66b1" },
  Others: { background: "#f4f3f3", text: "#908986" },
};

// Extract date part from formatted date string
const extractDate = (dateStr: string) => {
  const parts = dateStr.split(" - ");
  return parts.length > 1 ? parts[1] : dateStr;
};
const parseDateTime = (dateStr: string) => {
  // Format: "14:30 - 1/10/2025"
  const parts = dateStr.split(" - ");
  if (parts.length !== 2) return dayjs();

  const time = parts[0]; // "14:30"
  const date = parts[1]; // "1/10/2025"

  const [hours, minutes] = time.split(":").map(Number);
  const [day, month, year] = date.split("/").map(Number);

  return dayjs()
    .year(year)
    .month(month - 1)
    .date(day)
    .hour(hours)
    .minute(minutes);
};

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onUpdate,
}: Props) {
  const theme = useTheme();

  const [open, setOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedComment, setEditedComment] = useState(todo.comment);
  const [editedTag, setEditedTag] = useState(todo.tag);
  const [editedDate, setEditedDate] = useState<Dayjs | null>(
    parseDateTime(todo.date)
  );
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const navigate = useNavigate();

  const handleClick = () => {
    const date = extractDate(todo.date);
    navigate(`/detail/${encodeURIComponent(date)}`);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(todo._id!);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(todo._id!);
  };

  const handleClickOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEditOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedTitle(todo.title);
    setEditedComment(todo.comment);
    setEditedTag(todo.tag);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleSaveEdit = () => {
    if (onUpdate && editedTitle.trim() && editedDate) {
      const formattedDate = `${editedDate.hour()}:${editedDate
        .minute()
        .toString()
        .padStart(2, "0")} - ${editedDate.date()}/${
        editedDate.month() + 1
      }/${editedDate.year()}`;

      onUpdate(todo._id!, {
        title: editedTitle,
        comment: editedComment,
        tag: editedTag,
        date: formattedDate,
      });
    }
    setEditOpen(false);
  };
  // Lấy màu cho tag
  const tagColor = TAG_COLORS[todo.tag] || TAG_COLORS.Others;

  return (
    <Box sx={styles.container}>
      <Box sx={styles.content}>
        <Checkbox
          sx={styles.checkbox}
          checked={todo.completed}
          onClick={handleCheckboxClick}
        />
        <Box sx={styles.boxMargin}>
          <Box onClick={handleClickOpen}>
            <Typography
              variant="subtitle1"
              sx={{
                ...styles.title,
                textDecoration: todo.completed ? "line-through" : "none",
              }}
            >
              {todo.title}
            </Typography>
            <Typography
              variant="subtitle2"
              noWrap={true}
              sx={{
                ...styles.title,
                fontWeight: 400,
                color: "gray",
                marginTop: "3px",
                fontSize: "16px",
                maxWidth: 200,
                textDecoration: todo.completed ? "line-through" : "none",
              }}
            >
              {todo.comment}
            </Typography>
          </Box>

          <Dialog
            open={open}
            onClose={handleClose}
            sx={{
              "& .MuiDialog-paper": {
                minWidth: isMobile ? "35vw" : "30vw",
                maxHeight: "80vh",
              },
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogContent>
              <DialogContentText
                id="alert-dialog-description"
                sx={{ fontWeight: 600, fontSize: "18px", color: "black" }}
              >
                {todo.title}
              </DialogContentText>
              <DialogContentText
                id="alert-dialog-description"
                sx={{ fontWeight: 400, fontSize: "18px", color: "gray" }}
              >
                {todo.comment}
              </DialogContentText>
              <DialogContentText
                id="alert-dialog-description"
                sx={{ fontWeight: 600, fontSize: "16px", color: "black" }}
              >
                {todo.date.toString()}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} sx={{ fontWeight: 600 }}>
                Close
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={editOpen}
            onClose={handleEditClose}
            sx={{
              "& .MuiDialog-paper": {
                minWidth: isMobile ? "35vw" : "30vw",
                maxHeight: "80vh",
              },
            }}
          >
            <DialogContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  fullWidth
                  variant="outlined"
                />
                <TextField
                  label="Comment"
                  value={editedComment}
                  onChange={(e) => setEditedComment(e.target.value)}
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                />
                <Select
                  value={editedTag}
                  onChange={(e) => setEditedTag(e.target.value)}
                  fullWidth
                >
                  {TAGS.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="Date & Time"
                    value={editedDate}
                    onChange={(newValue) => setEditedDate(newValue)}
                    minDate={dayjs()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditClose} sx={{ color: "#999" }}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                variant="contained"
                sx={{ backgroundColor: "#375078" }}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              onClick={() => navigate(`/tag/${todo.tag}`)}
              sx={{
                ...styles.tagBox,
                backgroundColor: tagColor.background,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  ...styles.tagText,
                  color: tagColor.text,
                }}
              >
                {todo.tag}
              </Typography>
            </Box>
            <Typography variant="body2" sx={styles.date} onClick={handleClick}>
              {todo.date.toString()}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={styles.actionButtons}>
        <IconButton onClick={handleEditOpen} size="small">
          <EditIcon sx={{ ...styles.icon, color: "#375078" }} />
        </IconButton>
        <IconButton color="error" onClick={handleDeleteClick} size="small">
          <DeleteIcon sx={styles.deleteIcon} />
        </IconButton>
      </Box>
    </Box>
  );
}

const styles = {
  container: {
    mt: { xs: 2, sm: 5 },
    p: { xs: 2, sm: 3 },
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    borderBottom: "2px solid #e7e7e7",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "#f9f9f9",
    },
  },
  content: {
    display: "flex",
    alignItems: "flex-start",
    flex: 1,
  },
  checkbox: {
    padding: "5px",
  },
  title: {
    color: "black",
    fontWeight: 600,
  },
  tagBox: {
    display: "flex",
    alignItems: "center",
    padding: "4px 12px",
    borderRadius: "6px",
    justifyContent: "center",
    mt: 1,
    mb: 1,
    minWidth: "60px",
  },
  tagText: {
    fontWeight: 600,
    fontSize: "0.875rem",
  },
  date: {
    whiteSpace: "nowrap",
    fontWeight: 600,
    color: "black",
    ml: 2,
  },
  deleteIcon: {
    fontSize: "20px",
    color: "black",
  },
  icon: {
    fontSize: "20px",
  },
  boxMargin: {
    ml: 3,
    flex: 1,
  },
  actionButtons: {
    display: "flex",
    gap: 1,
    alignItems: "center",
  },
};
