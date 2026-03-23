import { useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  useTheme,
  useMediaQuery,
  IconButton,
  FormHelperText,
} from "@mui/material";
import { useNavigate } from "react-router";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { UseTodoContext } from "../context/todoContext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const TAGS = ["Work", "Health", "Mental", "Others"];

interface ValidationErrors {
  title: string;
  comment: string;
  date: string;
}

export default function AddTodo() {
  const { addTodo } = UseTodoContext();
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [tag, setTag] = useState(TAGS[0]);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [errors, setErrors] = useState<ValidationErrors>({
    title: "",
    comment: "",
    date: "",
  });
  const [touched, setTouched] = useState({
    title: false,
    comment: false,
    date: false,
  });

  const navigate = useNavigate();

  // Validate individual fields
  const validateTitle = (value: string): string => {
    if (!value.trim()) {
      return "Title is required";
    }
    if (value.trim().length < 3) {
      return "Title must be at least 3 characters";
    }
    if (value.trim().length > 100) {
      return "Title must not exceed 100 characters";
    }
    return "";
  };

  const validateComment = (value: string): string => {
    if (!value.trim()) {
      return "Description is required";
    }
    if (value.trim().length < 5) {
      return "Description must be at least 5 characters";
    }
    if (value.trim().length > 500) {
      return "Description must not exceed 500 characters";
    }
    return "";
  };

  const validateDate = (value: Dayjs | null): string => {
    if (!value) {
      return "Date and time is required";
    }
    const now = dayjs().startOf("minute");
    const selectedDate = dayjs(value);
    if (selectedDate.isBefore(now)) {
      return "Date and time cannot be in the past";
    }
    return "";
  };

  // Validate all fields
  const validateAll = (): boolean => {
    const newErrors: ValidationErrors = {
      title: validateTitle(title),
      comment: validateComment(comment),
      date: validateDate(date),
    };

    setErrors(newErrors);
    setTouched({ title: true, comment: true, date: true });

    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (touched.title) {
      setErrors((prev) => ({ ...prev, title: validateTitle(value) }));
    }
  };

  const handleCommentChange = (value: string) => {
    setComment(value);
    if (touched.comment) {
      setErrors((prev) => ({
        ...prev,
        comment: validateComment(value),
      }));
    }
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    setDate(newValue);
    if (touched.date) {
      setErrors((prev) => ({ ...prev, date: validateDate(newValue) }));
    }
  };

  const handleBlur = (fieldName: keyof ValidationErrors) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    
    if (fieldName === "title") {
      setErrors((prev) => ({ ...prev, title: validateTitle(title) }));
    } else if (fieldName === "comment") {
      setErrors((prev) => ({ ...prev, comment: validateComment(comment) }));
    } else if (fieldName === "date") {
      setErrors((prev) => ({ ...prev, date: validateDate(date) }));
    }
  };

  const handleSave = () => {
    if (!validateAll()) {
      return;
    }

    const now = dayjs().startOf("day");
    const selectedDate = date ? dayjs(date) : dayjs();
    const validDate = selectedDate.isBefore(now) ? dayjs() : selectedDate;
    const formattedDate = `${validDate.hour()}:${validDate
      .minute()
      .toString()
      .padStart(2, "0")} - ${validDate.date()}/${validDate.month() + 1}/${validDate.year()}`;

    addTodo({
      title: title.trim(),
      comment: comment.trim(),
      tag,
      date: formattedDate,
      completed: false,
    });

    navigate("/");
  };

  // Responsive
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  return (
    <Box sx={styles.container}>
      <Box
        sx={{
          ...styles.formBox,
          width: isMobile ? "90%" : isTablet ? "70vw" : "30vw",
        }}
      >
        <Box sx={styles.header}>
          <IconButton sx={styles.backButton} onClick={() => navigate("/")}>
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <Box sx={styles.inputBox}>
          <Box>
            <TextField
              placeholder="Title"
              variant="outlined"
              fullWidth
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={() => handleBlur("title")}
              error={touched.title && !!errors.title}
              sx={styles.textField}
            />
            {touched.title && errors.title && (
              <FormHelperText error>{errors.title}</FormHelperText>
            )}
          </Box>

          <Box>
            <TextField
              placeholder="Add a new task"
              variant="outlined"
              multiline
              fullWidth
              value={comment}
              onChange={(e) => handleCommentChange(e.target.value)}
              onBlur={() => handleBlur("comment")}
              error={touched.comment && !!errors.comment}
              rows={isMobile ? 3 : 4}
              sx={styles.textField}
            />
            {touched.comment && errors.comment && (
              <FormHelperText error>{errors.comment}</FormHelperText>
            )}
          </Box>

          <Select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            size={isMobile ? "small" : "medium"}
          >
            {TAGS.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box sx={{ width: "100%" }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={["DateTimePicker"]}>
              <DateTimePicker
                value={date}
                onChange={handleDateChange}
                onClose={() => handleBlur("date")}
                minDate={dayjs()}
                slotProps={{
                  textField: {
                    error: touched.date && !!errors.date,
                  },
                }}
              />
            </DemoContainer>
          </LocalizationProvider>
          {touched.date && errors.date && (
            <FormHelperText error sx={{ ml: 1.75 }}>
              {errors.date}
            </FormHelperText>
          )}
        </Box>

        <Box
          sx={{
            ...styles.buttonBox,
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 2 : 0,
          }}
        >
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              ...styles.button,
              width: isMobile ? "100%" : "auto",
            }}
          >
            Add Todo
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    width: "100%",
    justifyContent: "center",
    display: "flex",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
  },
  backButton: {
    color: "#393433",
  },
  formBox: {
    mt: 5,
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  inputBox: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  textField: {
    "& .MuiOutlinedInput-root": {
      "&:hover fieldset": { borderColor: "black" },
      "&.Mui-focused fieldset": { borderColor: "gray", borderWidth: "1px" },
    },
  },
  buttonBox: {
    display: "flex",
    position: "absolute",
    width: "95%",
    flex: 1,
    bottom: 40,
  },
  icon: {
    color: "gray",
    height: "30px",
    width: "30px",
  },
  button: {
    backgroundColor: "#375078",
    fontWeight: 600,
    flex: 1,
  },
};