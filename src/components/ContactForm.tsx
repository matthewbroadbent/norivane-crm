import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';
import { useContactsStore } from '../stores/contactsStore';
import { useAuthStore } from '../stores/authStore';
import { Database } from '../types/supabase';

type Contact = Database['public']['Tables']['contacts']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];

interface ContactFormProps {
  initialValues?: Partial<Contact>;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  status: Yup.string().required('Status is required'),
});

const statusOptions = [
  { value: 'lead', label: 'Lead' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'customer', label: 'Customer' },
  { value: 'churned', label: 'Churned' },
];

export default function ContactForm({ initialValues, onSubmit, onCancel }: ContactFormProps) {
  const { user } = useAuthStore();
  const { tags, fetchTags, addTag } = useContactsStore();
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#1976d2');

  useEffect(() => {
    fetchTags();
    
    // If we have initialValues with an id, we need to fetch the tags for this contact
    if (initialValues?.id) {
      // This would typically fetch the tags for this contact
      // For now, we'll just set an empty array
      setSelectedTags([]);
    }
  }, [fetchTags, initialValues]);

  const formik = useFormik({
    initialValues: {
      name: initialValues?.name || '',
      email: initialValues?.email || '',
      phone: initialValues?.phone || '',
      status: initialValues?.status || 'lead',
      notes: initialValues?.notes || '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        user_id: user?.id,
        tags: selectedTags,
      });
    },
  });

  const handleTagSelect = (tag: Tag) => {
    if (selectedTags.find((t) => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddTag = async () => {
    if (newTagName && user) {
      const newTag = await addTag({
        name: newTagName,
        color: newTagColor,
        user_id: user.id,
      });
      
      if (newTag) {
        setSelectedTags([...selectedTags, newTag]);
      }
      
      setTagDialogOpen(false);
      setNewTagName('');
      setNewTagColor('#1976d2');
    }
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="phone"
            name="phone"
            label="Phone"
            value={formik.values.phone}
            onChange={formik.handleChange}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              name="status"
              value={formik.values.status}
              label="Status"
              onChange={formik.handleChange}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.status && formik.errors.status && (
              <FormHelperText>{formik.errors.status}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="notes"
            name="notes"
            label="Notes"
            multiline
            rows={4}
            value={formik.values.notes}
            onChange={formik.handleChange}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  sx={{
                    backgroundColor: tag.color,
                    color: 'white',
                    opacity: selectedTags.find((t) => t.id === tag.id) ? 1 : 0.6,
                  }}
                  onClick={() => handleTagSelect(tag)}
                />
              ))}
              <Chip
                label="+ Add Tag"
                variant="outlined"
                onClick={() => setTagDialogOpen(true)}
              />
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="contained" type="submit">
            {initialValues?.id ? 'Update Contact' : 'Add Contact'}
          </Button>
        </Grid>
      </Grid>
      
      {/* Add Tag Dialog */}
      <Dialog open={tagDialogOpen} onClose={() => setTagDialogOpen(false)}>
        <DialogTitle>Add New Tag</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="tagName"
            label="Tag Name"
            fullWidth
            variant="outlined"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="tagColor"
            label="Tag Color"
            type="color"
            fullWidth
            variant="outlined"
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTagDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTag} variant="contained" disabled={!newTagName}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
