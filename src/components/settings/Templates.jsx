import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Collapse,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Утилиты для работы с localStorage
const storage = {
  get: () => JSON.parse(localStorage.getItem('messageTemplates') || '[]'),
  set: (templates) => localStorage.setItem('messageTemplates', JSON.stringify(templates)),
};

const ExpandButton = styled((props) => {
  const { expand, ...other } = props;
  return <Button variant="text" size="small" {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
  minWidth: 'auto',
  padding: '4px',
  lineHeight: 1,
}));

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setTemplates(storage.get());
  }, []);

  const handleExpandClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleOpen = (template = null) => {
    setCurrentTemplate(template);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentTemplate(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const form = e.target;
    const title = form.title.value;
    const text = form.text.value;

    if (!title || !text) return;

    let updatedTemplates;
    if (currentTemplate) {
      // Редактирование
      updatedTemplates = templates.map((t) =>
        t.id === currentTemplate.id ? { ...t, title, text } : t
      );
    } else {
      // Добавление
      updatedTemplates = [...templates, { id: Date.now(), title, text }];
    }
    setTemplates(updatedTemplates);
    storage.set(updatedTemplates);
    handleClose();
  };

  const handleDelete = (id) => {
    const updatedTemplates = templates.filter((t) => t.id !== id);
    setTemplates(updatedTemplates);
    storage.set(updatedTemplates);
  };

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Шаблоны сообщений</Typography>
        <Button 
          variant="contained" 
          onClick={() => handleOpen()}
          sx={{
            borderRadius: '20px',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(0, 122, 255, 0.2)',
            }
          }}
        >
          Добавить шаблон
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Создавайте шаблоны для быстрых ответов. Они хранятся локально в вашем браузере.
      </Typography>
      
      {templates.length > 0 ? (
        <List>
          {templates.map((template) => (
            <Paper key={template.id} sx={{ mb: 1.5, p: 1, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }} variant="outlined">
              <ListItem
                secondaryAction={
                  <Box>
                    <Button 
                      size="small" 
                      onClick={() => handleOpen(template)}
                      sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 122, 255, 0.04)',
                        }
                      }}
                    >
                      Изм.
                    </Button>
                    <Button 
                      size="small" 
                      color="error" 
                      onClick={() => handleDelete(template.id)} 
                      sx={{ 
                        ml: 1,
                        borderRadius: '12px',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(244, 67, 54, 0.04)',
                        }
                      }}
                    >
                      Удал.
                    </Button>
                  </Box>
                }
                disablePadding
              >
                <ListItemText 
                  primary={template.title} 
                  onClick={() => handleExpandClick(template.id)}
                  sx={{ cursor: 'pointer', pl: 2, pr: 1, my: 1 }}
                />
                <ExpandButton 
                  expand={expandedId === template.id} 
                  onClick={() => handleExpandClick(template.id)}
                  aria-expanded={expandedId === template.id}
                >
                  ▼
                </ExpandButton>
              </ListItem>
              <Collapse in={expandedId === template.id} timeout="auto" unmountOnExit>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}>
                    {template.text}
                  </Typography>
                </Box>
              </Collapse>
            </Paper>
          ))}
        </List>
      ) : (
        <Typography sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
          У вас пока нет шаблонов.
        </Typography>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>{currentTemplate ? 'Редактировать шаблон' : 'Новый шаблон'}</DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="title"
              name="title"
              label="Название шаблона"
              type="text"
              fullWidth
              variant="outlined"
              defaultValue={currentTemplate?.title || ''}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="text"
              name="text"
              label="Текст сообщения"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              defaultValue={currentTemplate?.text || ''}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleClose}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
              }}
            >
              Отмена
            </Button>
            <Button 
              type="submit"
              variant="contained"
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0, 122, 255, 0.2)',
                }
              }}
            >
              Сохранить
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  );
}
