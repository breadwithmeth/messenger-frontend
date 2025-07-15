import React from 'react';
import { Box, Typography, Button, Container, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, description }) => (
  <Paper 
    elevation={3}
    sx={{ 
      p: 4, 
      textAlign: 'center', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: 4,
      border: '1px solid rgba(0, 0, 0, 0.1)'
    }}
  >
    <motion.div whileHover={{ scale: 1.2, rotate: 10 }}>
      <Typography variant="h4" component="div" sx={{ mb: 2 }}>{icon}</Typography>
    </motion.div>
    <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 'bold' }}>{title}</Typography>
    <Typography variant="body1" color="text.secondary">{description}</Typography>
  </Paper>
);

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      color: '#333',
      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    }}>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 12 }}>
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h1" component="h1" sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '3rem', md: '4.5rem' },
              letterSpacing: '-1.5px',
              mb: 2,
              background: 'linear-gradient(45deg, #007AFF, #5856D6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Здесь заголовок
            </Typography>
            <Typography variant="h5" component="p" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto', mb: 4 }}>
А здесь описание            </Typography>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="contained" 
                color="primary" 
                size="large" 
                onClick={() => navigate('/login')}
                sx={{ 
                  borderRadius: '20px', 
                  px: 5, 
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 15px rgba(0, 122, 255, 0.4)'
                }}
              >
                Начать работу
              </Button>
            </motion.div>
          </motion.div>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 12 }}>
          <Typography variant="h3" component="h2" sx={{ textAlign: 'center', mb: 6, fontWeight: 'bold' }}>
            Ключевые возможности
          </Typography>
          <Grid container spacing={4}>
            {/* <Grid item xs={12} md={4}>
              <FeatureCard 
                icon="🤖"
                title="AI-Ассистент"
                description="Улучшайте тексты, проверяйте орфографию и получайте умные подсказки для ответов с помощью Gemini API."
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard 
                icon="⚡️"
                title="Быстрые Шаблоны"
                description="Создавайте и используйте готовые шаблоны сообщений, чтобы отвечать на частые вопросы в один клик."
              />
            </Grid> */}
            <Grid item xs={12} md={4}>
              <FeatureCard 
                icon="📊"
                title="Мульти-аккаунт"
                description="Подключайте и управляйте несколькими WhatsApp-аккаунтами в одном удобном интерфейсе."
              />
            </Grid>
          </Grid>
        </Box>

        {/* Footer */}
        <Box component="footer" sx={{ textAlign: 'center', pt: 6, borderTop: '1px solid #D1D1D6' }}>
          {/* <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Messenger App. Сделано с ❤️ для эффективной работы.
          </Typography> */}
        </Box>
      </Container>
    </Box>
  );
}
