import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  CircularProgress,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

// Simple unique ID generator
const generateUniqueKey = (meeting) => {
  return `${meeting.meetingCode || "meeting"}-${meeting.date}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
};

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history);
      } catch (error) {
        console.error("Failed to fetch meeting history:", error);
        // TODO: Add Snackbar or alert for error
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [getHistoryOfUser]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Home Button */}
      <IconButton onClick={() => routeTo("/home")}>
        <HomeIcon />
      </IconButton>

      {/* Loading Spinner */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : meetings.length > 0 ? (
        // Meeting List
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          {meetings.map((meeting) => (
            <Card key={generateUniqueKey(meeting)} variant="outlined" sx={{ p: 1 }}>
              <CardContent>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                  Code: {meeting.meetingCode}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Date: {formatDate(meeting.date)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        // Empty Fallback
        <Typography sx={{ mt: 3, textAlign: "center", color: "text.secondary" }}>
          No meetings available.
        </Typography>
      )}
    </Box>
  );
}
