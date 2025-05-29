import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { useContactsStore } from '../stores/contactsStore';
import { useAuthStore } from '../stores/authStore';
import ContactForm from '../components/ContactForm';
import { format } from 'date-fns';

export default function Contacts() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { contacts, tags, loading, error, fetchContacts, fetchTags, addContact, updateContact, deleteContact } = useContactsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuContactId, setMenuContactId] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
    fetchTags();
  }, [fetchContacts, fetchTags]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, contactId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuContactId(contactId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuContactId(null);
  };

  const handleAddContact = () => {
    setSelectedContact(null);
    setFormOpen(true);
  };

  const handleEditContact = (contact: any) => {
    setSelectedContact(contact);
    setFormOpen(true);
    handleCloseMenu();
  };

  const handleDeleteClick = (contactId: string) => {
    setContactToDelete(contactId);
    setDeleteConfirmOpen(true);
    handleCloseMenu();
  };

  const handleConfirmDelete = async () => {
    if (contactToDelete) {
      await deleteContact(contactToDelete);
      setDeleteConfirmOpen(false);
      setContactToDelete(null);
    }
  };

  const handleFormSubmit = async (values: any) => {
    if (selectedContact) {
      await updateContact(selectedContact.id, values);
    } else {
      await addContact(values);
    }
    setFormOpen(false);
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={() => navigate(`/contacts/${params.row.id}`)}
        >
          <Typography variant="body1">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === 'customer'
              ? 'success'
              : params.value === 'prospect'
              ? 'primary'
              : params.value === 'lead'
              ? 'info'
              : 'default'
          }
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Added',
      width: 120,
      valueFormatter: (params) => format(new Date(params.value), 'MMM d, yyyy'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="Contact Actions">
            <IconButton
              size="small"
              onClick={(e) => handleOpenMenu(e, params.row.id)}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Contacts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddContact}
        >
          Add Contact
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search contacts..."
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
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            sx={{ minWidth: 100 }}
          >
            Filter
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ height: 'calc(100vh - 280px)', width: '100%' }}>
        <DataGrid
          rows={filteredContacts}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
            sorting: {
              sortModel: [{ field: 'created_at', sort: 'desc' }],
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </Paper>

      {/* Contact Form Dialog */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedContact ? 'Edit Contact' : 'Add New Contact'}
        </DialogTitle>
        <DialogContent dividers>
          <ContactForm
            initialValues={selectedContact}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this contact? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            if (menuContactId) {
              const contact = contacts.find((c) => c.id === menuContactId);
              if (contact) {
                handleEditContact(contact);
              }
            }
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuContactId) {
              navigate(`/contacts/${menuContactId}`);
            }
            handleCloseMenu();
          }}
        >
          <EmailIcon fontSize="small" sx={{ mr: 1 }} />
          Send Email
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuContactId) {
              navigate('/calendar', { state: { contactId: menuContactId } });
            }
            handleCloseMenu();
          }}
        >
          <CalendarIcon fontSize="small" sx={{ mr: 1 }} />
          Schedule Meeting
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuContactId) {
              handleDeleteClick(menuContactId);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
