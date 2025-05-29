import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  FormHelperText,
  Divider,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Delete as DeleteIcon, Preview as PreviewIcon } from '@mui/icons-material';
import { useAuthStore } from '../stores/authStore';
import { useEmailStore } from '../stores/emailStore';
import { useContactsStore } from '../stores/contactsStore';
import { Database } from '../types/supabase';

type EmailCampaign = Database['public']['Tables']['email_campaigns']['Row'];
type EmailTemplate = Database['public']['Tables']['email_templates']['Row'];
type Contact = Database['public']['Tables']['contacts']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];

interface CampaignFormProps {
  initialValues?: Partial<EmailCampaign>;
  onSubmit: (values: any, recipients: string[]) => void;
  onCancel: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Campaign name is required'),
  template_id: Yup.string().required('Email template is required'),
});

export default function CampaignForm({ initialValues, onSubmit, onCancel }: CampaignFormProps) {
  const { user } = useAuthStore();
  const { templates, fetchTemplates } = useEmailStore();
  const { contacts, tags, fetchContacts, fetchTags } = useContactsStore();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [scheduleLater, setScheduleLater] = useState(false);

  useEffect(() => {
    fetchTemplates();
    fetchContacts();
    fetchTags();
    
    // If we have initialValues, set the selected template
    if (initialValues?.template_id) {
      const template = templates.find(t => t.id === initialValues.template_id);
      if (template) {
        setSelectedTemplate(template);
      }
    }
  }, [fetchTemplates, fetchContacts, fetchTags, initialValues, templates]);

  const formik = useFormik({
    initialValues: {
      name: initialValues?.name || '',
      template_id: initialValues?.template_id || '',
      scheduled_for: initialValues?.scheduled_for
        ? new Date(initialValues.scheduled_for)
        : new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(
        {
          ...values,
          user_id: user?.id,
          status: scheduleLater ? 'scheduled' : 'draft',
          scheduled_for: scheduleLater ? values.scheduled_for.toISOString() : null,
        },
        selectedContacts
      );
    },
  });

  const handleTemplateChange = (event: any) => {
    const templateId = event.target.value;
    formik.setFieldValue('template_id', templateId);
    
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template || null);
  };

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const filteredContacts = selectedTags.length > 0
    ? contacts.filter(contact => {
        // This would typically check if the contact has any of the selected tags
        // For now, we'll just return all contacts
        return true;
      })
    : contacts;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={formik.handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Campaign Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl
              fullWidth
              error={formik.touched.template_id && Boolean(formik.errors.template_id)}
            >
              <InputLabel id="template-label">Email Template</InputLabel>
              <Select
                labelId="template-label"
                id="template_id"
                name="template_id"
                value={formik.values.template_id}
                label="Email Template"
                onChange={handleTemplateChange}
              >
                <MenuItem value="">
                  <em>Select a template</em>
                </MenuItem>
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.template_id && formik.errors.template_id && (
                <FormHelperText>{formik.errors.template_id}</FormHelperText>
              )}
            </FormControl>
          </Grid>
          
          {selectedTemplate && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Template Preview
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Subject:</strong> {selectedTemplate.subject}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    startIcon={<PreviewIcon />}
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      // Open a preview dialog or modal
                      alert('Preview functionality would be implemented here');
                    }}
                  >
                    Preview Email
                  </Button>
                </Box>
              </Paper>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Recipients
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              Filter by Tags
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  sx={{
                    backgroundColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
                    color: selectedTags.includes(tag.id) ? 'white' : 'inherit',
                    border: `1px solid ${tag.color}`,
                  }}
                  onClick={() => handleTagToggle(tag.id)}
                />
              ))}
              {tags.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No tags available
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Select Contacts ({selectedContacts.length} selected)
            </Typography>
            <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
              <List dense>
                {filteredContacts.map((contact) => (
                  <ListItem key={contact.id}>
                    <Checkbox
                      edge="start"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => handleContactToggle(contact.id)}
                    />
                    <ListItemText
                      primary={contact.name}
                      secondary={contact.email}
                    />
                  </ListItem>
                ))}
                {filteredContacts.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No contacts available"
                      secondary="Add contacts first or adjust your tag filters"
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
            
            {selectedContacts.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSelectedContacts([])}
                >
                  Clear Selection
                </Button>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <Typography variant="subtitle1" gutterBottom>
                Scheduling
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant={scheduleLater ? "outlined" : "contained"}
                    onClick={() => setScheduleLater(false)}
                  >
                    Save as Draft
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant={scheduleLater ? "contained" : "outlined"}
                    onClick={() => setScheduleLater(true)}
                  >
                    Schedule for Later
                  </Button>
                </Grid>
              </Grid>
              
              {scheduleLater && (
                <Box sx={{ mt: 2 }}>
                  <DateTimePicker
                    label="Schedule Date & Time"
                    value={formik.values.scheduled_for}
                    onChange={(value) => formik.setFieldValue('scheduled_for', value)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: "When should this campaign be sent?",
                      },
                    }}
                  />
                </Box>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={selectedContacts.length === 0}
            >
              {initialValues?.id
                ? 'Update Campaign'
                : scheduleLater
                ? 'Schedule Campaign'
                : 'Save Campaign'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}
