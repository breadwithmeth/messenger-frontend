import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';

// Error Boundary компонент
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AiSettings Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box>
          <Alert severity="error" sx={{ mb: 2 }}>
            Произошла ошибка при загрузке настроек AI. Попробуйте обновить страницу.
          </Alert>
          <Button 
            variant="outlined" 
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Попробовать снова
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

function AiSettingsContent() {
  const [context, setContext] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const savedContext = localStorage.getItem('aiContext');
      if (savedContext) {
        setContext(savedContext);
      }
    } catch (error) {
      console.error('Ошибка при загрузке контекста AI:', error);
    }
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      localStorage.setItem('aiContext', context);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Ошибка при сохранении контекста AI:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Настройки AI-помощника
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Этот контекст будет использоваться AI для генерации ответов, чтобы они лучше соответствовали вашей манере общения. Вы можете указать здесь информацию о себе, вашей компании или специфике общения.
      </Typography>
      
      {saved && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Контекст AI успешно сохранен!
        </Alert>
      )}
      
      <TextField
        label="Контекст для AI"
        multiline
        rows={6}
        fullWidth
        value={context}
        onChange={(e) => setContext(e.target.value)}
        variant="outlined"
        placeholder="Например: Я менеджер по продажам в IT-компании. Общаюсь с клиентами в деловом, но дружелюбном тоне..."
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={saving}
        sx={{ mt: 2 }}
      >
        {saving ? 'Сохранение...' : 'Сохранить контекст'}
      </Button>
    </Box>
  );
}

export default function AiSettings() {
  return (
    <ErrorBoundary>
      <AiSettingsContent />
    </ErrorBoundary>
  );
}
