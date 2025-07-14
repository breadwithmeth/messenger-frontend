import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Collapse,
} from '@mui/material';
import { Edit, Delete, Add, ExpandMore } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Утилиты для работы с localStorage
const storage = {
  get: () => JSON.parse(localStorage.getItem('messageTemplates') || '[]'),
  set: (templates) => localStorage.setItem('messageTemplates', JSON.stringify(templates)),
};

const ExpandMoreIcon = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
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
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
          Добавить шаблон
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Создавайте шаблоны для быстрых ответов. Они хранятся локально в вашем браузере.
      </Typography>
      
      {templates.length > 0 ? (
        <List>
          {templates.map((template) => (
            <Paper key={template.id} sx={{ mb: 1.5, p: 1, borderRadius: 2 }} variant="outlined">
              <ListItem
                secondaryAction={
                  <>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpen(template)}>
                      <Edit />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(template.id)} sx={{ ml: 1 }}>
                      <Delete />
                    </IconButton>
                  </>
                }
                onClick={() => handleExpandClick(template.id)}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemText primary={template.title} />
                <ExpandMoreIcon expand={expandedId === template.id} aria-expanded={expandedId === template.id}>
                  <ExpandMore />
                </ExpandMoreIcon>
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

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{currentTemplate ? 'Редактировать шаблон' : 'Новый шаблон'}</DialogTitle>
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
            <Button onClick={handleClose}>Отмена</Button>
            <Button type="submit">Сохранить</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  );
}
