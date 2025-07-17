import React, { useRef, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import ChatBubble from "./ChatBubble";

export default function ChatMessages({ messages, userId }) {
  const endRef = useRef(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    // Прокручиваем вниз только при первой загрузке сообщений
    if (endRef.current && isFirstLoad && messages.length > 0) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
      setIsFirstLoad(false);
    }
  }, [messages, isFirstLoad]);

  // Сбрасываем флаг при смене чата (когда messages становится пустым)
  useEffect(() => {
    if (messages.length === 0) {
      setIsFirstLoad(true);
    }
  }, [messages.length]);

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
            key={`date-header-${date}`}
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
          {grouped[date].map((msg, index) => {
            const prevMsg = index > 0 ? grouped[date][index - 1] : null;
            const nextMsg = index < grouped[date].length - 1 ? grouped[date][index + 1] : null;
            
            // Определяем, нужно ли показывать информацию об отправителе
            const showSenderInfo = msg.fromMe && msg.senderUser && (
              !prevMsg || 
              !prevMsg.fromMe || 
              prevMsg.senderUserId !== msg.senderUserId ||
              (new Date(msg.timestamp) - new Date(prevMsg.timestamp)) > 5 * 60 * 1000 // 5 минут
            );
            
            return (
              <React.Fragment key={`msg-${msg.id}`}>
                {/* Показываем имя отправителя для групп наших сообщений */}
                {showSenderInfo && (
                  <Typography
                    key={`sender-${msg.id}`}
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      alignSelf: 'flex-end',
                      mr: 1,
                      mb: 0.5,
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}
                  >
                    {msg.senderUser.name || msg.senderUser.email.split('@')[0]}
                  </Typography>
                )}
                <ChatBubble
                  key={`bubble-${msg.id}`}
                  message={msg}
                  isMe={msg.fromMe || msg.senderId === userId}
                  showTime={true}
                />
              </React.Fragment>
            );
          })}
        </React.Fragment>
      ))}
      <div ref={endRef} />
    </Box>
  );
}
