import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import { useEmailStore } from '../stores/emailStore';
import { format } from 'date-fns';

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
      id={`campaign-tabpanel-${index}`}
      aria-labelledby={`campaign-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export default function EmailCampaigns() {
  const navigate = useNavigate();
  const { campaigns, templates, loading, error, fetchCampaigns, fetchTemplates, deleteCampaign, updateCampaign } = useEmailStore();
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuCampaignId, setMenuCampaignId] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
  }, [fetchCampaigns, fetchTemplates]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, campaignId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuCampaignId(campaignId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuCampaignId(null);
  };

  const handleDeleteClick = (campaignId: string) => {
    setCampaignToDelete(campaignId);
    setDeleteDialogOpen(true);
    handleCloseMenu();
  };

  const handleConfirmDelete = async () => {
    if (campaignToDelete) {
      await deleteCampaign(campaignToDelete);
      setDeleteDialogOpen(false);
      setCampaignToDelete(null);
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    await updateCampaign(campaignId, { status: 'sent', sent_at: new Date().toISOString() });
    handleCloseMenu();
  };

  const handlePauseCampaign = async (campaignId: string) => {
    await updateCampaign(campaignId, { status: 'paused' });
    handleCloseMenu();
  };

  const filteredCampaigns = campaigns.filter(
    (campaign) => campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const draftCampaigns = filteredCampaigns.filter(c => c.status === 'draft');
  const scheduledCampaigns = filteredCampaigns.filter(c => c.status === 'scheduled');
  const sentCampaigns = filteredCampaigns.filter(c => c.status === 'sent');

  const getTemplateNameById = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    return template ? template.name : 'Unknown Template';
  };

  const getCampaignStatusChip = (status: string, scheduledFor?: string | null) => {
    switch (status) {
      case 'draft':
        return <Chip label="Draft" size="small" color="default" />;
      case 'scheduled':
        return (
          <Chip
            label={`Scheduled: ${scheduledFor ? format(new Date(scheduledFor), 'MMM d, h:mm a') : 'TBD'}`}
            size="small"
            color="primary"
          />
        );
      case 'sending':
        return <Chip label="Sending" size="small" color="warning" />;
      case 'sent':
        return <Chip label="Sent" size="small" color="success" />;
      case 'paused':
        return <Chip label="Paused" size="small" color="error" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const renderCampaignList = (campaigns: any[]) => {
    if (campaigns.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          No campaigns found.
        </Typography>
      );
    }

    return (
      <List sx={{ width: '100%' }}>
        {campaigns.map((campaign) => (
          <Paper
            key={campaign.id}
            variant="outlined"
            sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}
          >
            <ListItem
              sx={{
                borderLeft: '4px solid',
                borderLeftColor:
                  campaign.status === 'sent'
                    ? 'success.main'
                    : campaign.status === 'scheduled'
                    ? 'primary.main'
                    : campaign.status === 'paused'
                    ? 'error.main'
                    : 'grey.400',
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="subtitle1" component="div">
                    {campaign.name}
                  </Typography>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" component="div">
                      Template: {getTemplateNameById(campaign.template_id)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      {getCampaignStatusChip(campaign.status, campaign.scheduled_for)}
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                        Created: {format(new Date(campaign.created_at), 'MMM d, yyyy')}
                      </Typography>
                      {campaign.sent_at && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                          Sent: {format(new Date(campaign.sent_at), 'MMM d, yyyy')}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="more"
                  onClick={(e) => handleOpenMenu(e, campaign.id)}
                >
                  <MoreVertIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </Paper>
        ))}
      </List>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Email Campaigns
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/email-campaigns/create')}
        >
          Create Campaign
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          placeholder="Search campaigns..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="campaign tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`Drafts (${draftCampaigns.length})`} />
          <Tab label={`Scheduled (${scheduledCampaigns.length})`} />
          <Tab label={`Sent (${sentCampaigns.length})`} />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TabPanel value={tabValue} index={0}>
              {renderCampaignList(draftCampaigns)}
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              {renderCampaignList(scheduledCampaigns)}
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              {renderCampaignList(sentCampaigns)}
            </TabPanel>
          </>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this campaign? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Campaign Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        {menuCampaignId && (
          <>
            <MenuItem
              onClick={() => {
                navigate(`/email-campaigns/edit/${menuCampaignId}`);
                handleCloseMenu();
              }}
            >
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit
            </MenuItem>
            
            <MenuItem
              onClick={() => {
                // Duplicate functionality would be implemented here
                handleCloseMenu();
              }}
            >
              <DuplicateIcon fontSize="small" sx={{ mr: 1 }} />
              Duplicate
            </MenuItem>
            
            <Divider />
            
            {campaigns.find(c => c.id === menuCampaignId)?.status === 'draft' && (
              <MenuItem
                onClick={() => {
                  if (menuCampaignId) {
                    handleSendCampaign(menuCampaignId);
                  }
                }}
              >
                <SendIcon fontSize="small" sx={{ mr: 1 }} />
                Send Now
              </MenuItem>
            )}
            
            {campaigns.find(c => c.id === menuCampaignId)?.status === 'draft' && (
              <MenuItem
                onClick={() => {
                  navigate(`/email-campaigns/schedule/${menuCampaignId}`);
                  handleCloseMenu();
                }}
              >
                <ScheduleIcon fontSize="small" sx={{ mr: 1 }} />
                Schedule
              </MenuItem>
            )}
            
            {campaigns.find(c => c.id === menuCampaignId)?.status === 'scheduled' && (
              <MenuItem
                onClick={() => {
                  if (menuCampaignId) {
                    handlePauseCampaign(menuCampaignId);
                  }
                }}
              >
                <PauseIcon fontSize="small" sx={{ mr: 1 }} />
                Pause
              </MenuItem>
            )}
            
            <Divider />
            
            <MenuItem
              onClick={() => {
                if (menuCampaignId) {
                  handleDeleteClick(menuCampaignId);
                }
              }}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
}
