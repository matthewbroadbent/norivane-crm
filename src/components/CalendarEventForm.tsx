import { useState } from 'react';
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
  FormHelperText,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuthStore } from '../stores/authStore';
import { useContactsStore } from '../stores/contactsStore';
import { Database } from '../types/supabase';

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];
type Contact = Database['public']['Tables']['contacts']['Row'];

interface CalendarEventFormProps {
  initialValues?: Partial<CalendarEvent>;
  contacts: Contact[];
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  start_time: Yup.date().required('Start time is required'),
  end_time: Yup.date()
    .required('End time is required')
    .min(
      Yup.ref('start_time'),
      'End time must be after start time'
    ),
});

export default function CalendarEventForm({
  initialValues,
  contacts,
  onSubmit,
  onCancel,
}: CalendarEventFormProps) {
  const { user } = useAuthStore();
  const [syncWithGoogle, setSyncWithGoogle] = useState(true);

  const formik = useFormik({
    initialValues: {
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      start_time: initialValues?.start_time
        ? new Date(initialValues.start_time)
        : new Date(),
      end_time: initialValues?.end_time
        ? new Date(initialValues.end_time)
        : new Date(Date.now() + 60 * 60 * 1000), // Default to 1 hour later
      contact_id: initialValues?.contact_id || '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        user_id: user?.id,
        start_time: values.start_time.toISOString(),
        end_time: values.end_time.toISOString(),
        sync_with_google: syncWithGoogle,
      });
    },
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={formik.handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="title"
              name="title"
              label="Event Title"
              value={formik.values.title}
              onChange={formik.handleChange}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="Start Time"
              value={formik.values.start_time}
              onChange={(value) => formik.setFieldValue('start_time', value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: formik.touched.start_time && Boolean(formik.errors.start_time),
                  helperText: formik.touched.start_time && formik.errors.start_time as string,
                },
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="End Time"
              value={formik.values.end_time}
              onChange={(value) => formik.setFieldValue('end_time', value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: formik.touched.end_time && Boolean(formik.errors.end_time),
                  helperText: formik.touched.end_time && formik.errors.end_time as string,
                },
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="contact-label">Associated Contact</InputLabel>
              <Select
                labelId="contact-label"
                id="contact_id"
                name="contact_id"
                value={formik.values.contact_id}
                label="Associated Contact"
                onChange={formik.handleChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {contacts.map((contact) => (
                  <MenuItem key={contact.id} value={contact.id}>
                    {contact.name} ({contact.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              multiline
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={syncWithGoogle}
                  onChange={(e) => setSyncWithGoogle(e.target.checked)}
                  color="primary"
                />
              }
              label="Sync with Google Calendar"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              This will add the event to your connected Google Calendar
            </Typography>
          </Grid>
          
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="contained" type="submit">
              {initialValues?.id ? 'Update Event' : 'Create Event'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}
