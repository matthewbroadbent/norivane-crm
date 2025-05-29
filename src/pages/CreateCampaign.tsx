import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useEmailStore } from '../stores/emailStore';
import { useContactsStore } from '../stores/contactsStore';
import { useAuthStore } from '../stores/authStore';
import CampaignForm from '../components/CampaignForm';
import EmailTemplateForm from '../components/EmailTemplateForm';

const steps = ['Select Template', 'Choose Recipients', 'Review & Send'];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { templates, campaigns, loading, fetchTemplates, addTemplate, addCampaign } = useEmailStore();
  const { contacts, fetchContacts } = useContactsStore();
  const [activeStep, setActiveStep] = useState(0);
  const [createTemplateMode, setCreateTemplateMode] = useState(false);
  const [campaignData, setCampaignData] = useState<any>({
    name: '',
    template_id: '',
    recipients: [],
  });

  useEffect(() => {
    fetchTemplates();
    fetchContacts();
  }, [fetchTemplates, fetchContacts]);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCreateTemplate = async (templateData: any) => {
    if (user) {
      const newTemplate = await addTemplate({
        ...templateData,
        user_id: user.id,
      });
      
      if (newTemplate) {
        setCampaignData({
          ...campaignData,
          template_id: newTemplate.id,
        });
        setCreateTemplateMode(false);
      }
    }
  };

  const handleCampaignSubmit = async (values: any, recipients: string[]) => {
    if (user) {
      const newCampaign = await addCampaign({
        ...values,
        user_id: user.id,
      });
      
      if (newCampaign) {
        // Add recipients to the campaign
        // This would typically be done in a separate API call
        
        navigate('/email-campaigns');
      }
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return createTemplateMode ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              Create New Email Template
            </Typography>
            <EmailTemplateForm
              onSubmit={handleCreateTemplate}
              onCancel={() => setCreateTemplateMode(false)}
            />
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Campaign Details & Template
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setCreateTemplateMode(true)}
              >
                Create New Template
              </Button>
            </Box>
            <CampaignForm
              onSubmit={(values, recipients) => {
                setCampaignData({
                  ...campaignData,
                  ...values,
                  recipients,
                });
                handleNext();
              }}
              onCancel={() => navigate('/email-campaigns')}
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Confirm
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Campaign Name: {campaignData.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Template: {templates.find(t => t.id === campaignData.template_id)?.name || 'Unknown'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Recipients: {campaignData.recipients?.length || 0} contacts
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Status: {campaignData.status === 'scheduled' ? 'Scheduled' : 'Draft'}
              </Typography>
              {campaignData.scheduled_for && (
                <Typography variant="subtitle1" gutterBottom>
                  Scheduled For: {new Date(campaignData.scheduled_for).toLocaleString()}
                </Typography>
              )}
            </Paper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                onClick={() => handleCampaignSubmit(campaignData, campaignData.recipients)}
              >
                {campaignData.status === 'scheduled' ? 'Schedule Campaign' : 'Save Campaign'}
              </Button>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/email-campaigns')}
        sx={{ mb: 3 }}
      >
        Back to Campaigns
      </Button>
      
      <Typography variant="h4" component="h1" gutterBottom>
        Create Email Campaign
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Paper sx={{ p: 3 }}>
        {renderStepContent()}
      </Paper>
    </Box>
  );
}
