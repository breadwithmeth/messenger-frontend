import React, { useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import ChatBubble from "./ChatBubble";

export default function ChatMessages({ messages, userId }) {
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const groupByDate = (msgs) => {
    const groups = {};
    msgs.forEach((msg) => {
      const date = msg.timestamp ? new Date(msg.timestamp).toLocaleDateString() : "";
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const grouped = groupByDate(messages);
  const dates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));

  return (
    <Box
      sx={{
        flex: 1,
        width: '100%',
        maxWidth: '64rem',
        margin: '0 auto',
        p: 2,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
      {dates.map((date) => (
        <React.Fragment key={date}>
          <Typography
            variant="caption"
            align="center"
            sx={{
              color: 'text.secondary',
              my: 2,
              userSelect: 'none'
            }}
          >
            {date}
          </Typography>
          {grouped[date].map((msg) => (
            <ChatBubble
              key={msg.id}
              message={msg}
              isMe={msg.fromMe || msg.senderId === userId}
              showTime={true}
            />
          ))}
        </React.Fragment>
      ))}
      <div ref={endRef} />
    </Box>
  );
}
