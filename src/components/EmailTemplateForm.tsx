import { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  Paper,
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { Database } from '../types/supabase';

type EmailTemplate = Database['public']['Tables']['email_templates']['Row'];

interface EmailTemplateFormProps {
  initialValues?: Partial<EmailTemplate>;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Template name is required'),
  subject: Yup.string().required('Email subject is required'),
  content: Yup.string().required('Email content is required'),
});

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['clean'],
  ],
};

export default function EmailTemplateForm({ initialValues, onSubmit, onCancel }: EmailTemplateFormProps) {
  const { user } = useAuthStore();
  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const formik = useFormik({
    initialValues: {
      name: initialValues?.name || '',
      subject: initialValues?.subject || '',
      content: initialValues?.content || getDefaultTemplate(),
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        user_id: user?.id,
      });
    },
  });

  function getDefaultTemplate() {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
          <img src="${settings?.logo_url || 'https://via.placeholder.com/200x50'}" alt="Company Logo" style="max-width: 200px; height: auto;" />
        </div>
        <div style="padding: 20px;">
          <p>Hello {{name}},</p>
          <p>Write your email content here...</p>
          <p>Best regards,</p>
          <p>Your Name</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; color: #666;">
          <p>${settings?.company_name || 'Your Company'}</p>
          <p>${settings?.email_signature || 'Your email signature'}</p>
        </div>
      </div>
    `;
  }

  const handleContentChange = (content: string) => {
    formik.setFieldValue('content', content);
  };

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Template Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="subject"
            name="subject"
            label="Email Subject"
            value={formik.values.subject}
            onChange={formik.handleChange}
            error={formik.touched.subject && Boolean(formik.errors.subject)}
            helperText={formik.touched.subject && formik.errors.subject}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Email Content
          </Typography>
          <Paper variant="outlined" sx={{ p: 1 }}>
            <ReactQuill
              theme="snow"
              value={formik.values.content}
              onChange={handleContentChange}
              modules={modules}
            />
          </Paper>
          {formik.touched.content && formik.errors.content && (
            <Typography color="error" variant="caption">
              {formik.errors.content as string}
            </Typography>
          )}
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Available Variables:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                const quill = document.querySelector('.ql-editor');
                if (quill) {
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const node = document.createTextNode('{{name}}');
                    range.insertNode(node);
                  }
                }
              }}
            >
              {{name}}
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                const quill = document.querySelector('.ql-editor');
                if (quill) {
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const node = document.createTextNode('{{email}}');
                    range.insertNode(node);
                  }
                }
              }}
            >
              {{email}}
            </Button>
          </Box>
        </Grid>
        
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="contained" type="submit">
            {initialValues?.id ? 'Update Template' : 'Save Template'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
