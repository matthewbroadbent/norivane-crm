import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Grid,
  Divider,
  Avatar,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useSettingsStore } from '../stores/settingsStore';
import { useAuthStore } from '../stores/authStore';
import { useCalendarStore } from '../stores/calendarStore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Settings() {
  const { settings, loading, error, fetchSettings, updateSettings, uploadLogo } = useSettingsStore();
  const { user, signOut } = useAuthStore();
  const { googleConnected, connectGoogle, disconnectGoogle } = useCalendarStore();
  const [tabValue, setTabValue] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [emailSignature, setEmailSignature] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setCompanyName(settings.company_name || '');
      setEmailSignature(settings.email_signature || '');
      setLogoPreview(settings.logo_url);
    }
  }, [settings]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveProfile = async () => {
    const updates = {
      company_name: companyName,
      email_signature: emailSignature,
    };
    
    await updateSettings(updates);
    setSaveSuccess(true);
    
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadLogo = async () => {
    if (logoFile) {
      await uploadLogo(logoFile);
      setLogoFile(null);
    }
  };

  const handleConnectGoogle = async () => {
    await connectGoogle();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading && !settings) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="settings tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Profile" />
          <Tab label="Email" />
          <Tab label="Integrations" />
          <Tab label="Account" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Company Profile
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                value={user?.email || ''}
                disabled
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Company Logo
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {logoPreview ? (
                  <Box
                    component="img"
                    src={logoPreview}
                    alt="Company Logo"
                    sx={{
                      maxWidth: 200,
                      maxHeight: 100,
                      mr: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      p: 1,
                    }}
                  />
                ) : (
                  <Avatar
                    variant="rounded"
                    sx={{ width: 100, height: 100, mr: 2, bgcolor: 'primary.main' }}
                  >
                    {companyName.charAt(0).toUpperCase() || 'C'}
                  </Avatar>
                )}
                <Box>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleLogoChange}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ mr: 1 }}
                  >
                    Choose File
                  </Button>
                  {logoFile && (
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleUploadLogo}
                    >
                      Upload
                    </Button>
                  )}
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Recommended size: 200x50 pixels. Max file size: 2MB.
              </Typography>
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveProfile}
              >
                Save Changes
              </Button>
            </Grid>
            
            {saveSuccess && (
              <Grid item xs={12}>
                <Alert severity="success">Settings saved successfully!</Alert>
              </Grid>
            )}
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Email Settings
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Email Signature
              </Typography>
              <Paper variant="outlined" sx={{ p: 1 }}>
                <ReactQuill
                  theme="snow"
                  value={emailSignature}
                  onChange={setEmailSignature}
                />
              </Paper>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                This signature will be added to all emails sent from the system.
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Email Notifications
              </Typography>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Send me email notifications when contacts open my emails"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Send me daily summary of campaign performance"
              />
              <FormControlLabel
                control={<Switch />}
                label="Send me notifications about new features and updates"
              />
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveProfile}
              >
                Save Changes
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Integrations
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Google Calendar
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Connect your Google Calendar to sync events and meetings.
                    </Typography>
                  </Box>
                  <Button
                    variant={googleConnected ? "outlined" : "contained"}
                    color={googleConnected ? "error" : "primary"}
                    onClick={googleConnected ? disconnectGoogle : handleConnectGoogle}
                  >
                    {googleConnected ? "Disconnect" : "Connect"}
                  </Button>
                </Box>
              </Paper>
              
              <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Zapier
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Connect with Zapier to automate workflows with 3000+ apps.
                    </Typography>
                  </Box>
                  <Button variant="contained">
                    Connect
                  </Button>
                </Box>
              </Paper>
              
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Slack
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Get notifications in Slack when important events happen.
                    </Typography>
                  </Box>
                  <Button variant="contained">
                    Connect
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Account Settings
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                value={user?.email || ''}
                disabled
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                fullWidth
              >
                Change Password
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom color="error">
                Danger Zone
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body1">
                    Sign Out
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sign out of your account on this device.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                <Box>
                  <Typography variant="body1">
                    Delete Account
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Permanently delete your account and all associated data.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="error"
                >
                  Delete Account
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
}
