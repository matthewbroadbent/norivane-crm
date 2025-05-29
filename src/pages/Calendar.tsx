import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  Chip,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Add as AddIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  ViewDay as DayViewIcon,
  ViewWeek as WeekViewIcon,
  ViewModule as MonthViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useCalendarStore } from '../stores/calendarStore';
import { useContactsStore } from '../stores/contactsStore';
import CalendarEventForm from '../components/CalendarEventForm';
import { format, addDays, startOfWeek, endOfWeek, addWeeks, isToday, isSameDay, parseISO } from 'date-fns';

export default function Calendar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { events, loading, error, fetchEvents, addEvent, updateEvent, deleteEvent } = useCalendarStore();
  const { contacts, fetchContacts } = useContactsStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
    fetchContacts();
    
    // Check if we were passed a contactId from another page
    if (location.state && location.state.contactId) {
      handleAddEvent(location.state.contactId);
    }
  }, [fetchEvents, fetchContacts, location.state]);

  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newView: 'day' | 'week' | 'month' | null) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const handlePrevious = () => {
    if (view === 'day') {
      setCurrentDate(prev => addDays(prev, -1));
    } else if (view === 'week') {
      setCurrentDate(prev => addWeeks(prev, -1));
    } else {
      // Handle month view
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
  };

  const handleNext = () => {
    if (view === 'day') {
      setCurrentDate(prev => addDays(prev, 1));
    } else if (view === 'week') {
      setCurrentDate(prev => addWeeks(prev, 1));
    } else {
      // Handle month view
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddEvent = (contactId?: string) => {
    setSelectedEvent(contactId ? { contact_id: contactId } : null);
    setEventDialogOpen(true);
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  const handleDeleteClick = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (eventToDelete) {
      await deleteEvent(eventToDelete);
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  const handleEventSubmit = async (values: any) => {
    if (selectedEvent && selectedEvent.id) {
      await updateEvent(selectedEvent.id, values);
    } else {
      await addEvent(values);
    }
    setEventDialogOpen(false);
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      days.push(addDays(start, i));
    }
    
    return days;
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = parseISO(event.start_time);
      return isSameDay(eventDate, day);
    });
  };

  const getContactName = (contactId: string | null) => {
    if (!contactId) return null;
    const contact = contacts.find(c => c.id === contactId);
    return contact ? contact.name : 'Unknown Contact';
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDay(currentDate);
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
          {isToday(currentDate) && (
            <Chip label="Today" size="small" color="primary" sx={{ ml: 1 }} />
          )}
        </Typography>
        
        <Paper variant="outlined" sx={{ p: 0, mt: 2 }}>
          {dayEvents.length > 0 ? (
            dayEvents
              .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
              .map(event => (
                <Card key={event.id} variant="outlined" sx={{ mb: 2, mx: 2, mt: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6">{event.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
                        </Typography>
                        {event.contact_id && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            With: {getContactName(event.contact_id)}
                          </Typography>
                        )}
                        {event.description && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {event.description}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => handleEditEvent(event)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteClick(event.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No events scheduled for this day
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleAddEvent()}
                sx={{ mt: 2 }}
              >
                Add Event
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {format(weekDays[0], 'MMMM d')} - {format(weekDays[6], 'MMMM d, yyyy')}
        </Typography>
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {weekDays.map(day => {
            const dayEvents = getEventsForDay(day);
            const isCurrentDay = isToday(day);
            
            return (
              <Grid item xs={12} sm={6} md={3} lg={12/7} key={day.toString()}>
                <Paper
                  variant="outlined"
                  sx={{
                    height: '100%',
                    bgcolor: isCurrentDay ? 'primary.50' : 'background.paper',
                    borderColor: isCurrentDay ? 'primary.main' : 'divider',
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      bgcolor: isCurrentDay ? 'primary.100' : 'background.default',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="subtitle2">
                      {format(day, 'EEE')}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: isCurrentDay ? 'bold' : 'regular',
                        color: isCurrentDay ? 'primary.main' : 'text.primary',
                      }}
                    >
                      {format(day, 'd')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ p: 1, height: 'calc(100% - 70px)', overflow: 'auto' }}>
                    {dayEvents.length > 0 ? (
                      dayEvents
                        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                        .map(event => (
                          <Box
                            key={event.id}
                            sx={{
                              p: 1,
                              mb: 1,
                              borderRadius: 1,
                              bgcolor: 'primary.50',
                              borderLeft: '3px solid',
                              borderColor: 'primary.main',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleEditEvent(event)}
                          >
                            <Typography variant="body2" noWrap>
                              {format(new Date(event.start_time), 'h:mm a')}
                            </Typography>
                            <Typography variant="subtitle2" noWrap>
                              {event.title}
                            </Typography>
                            {event.contact_id && (
                              <Typography variant="caption" noWrap display="block">
                                {getContactName(event.contact_id)}
                              </Typography>
                            )}
                          </Box>
                        ))
                    ) : (
                      <Box
                        sx={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" align="center">
                          No events
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  const renderMonthView = () => {
    // This would be a more complex implementation with a full month calendar
    // For simplicity, we'll just show a message
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h6" gutterBottom>
          {format(currentDate, 'MMMM yyyy')}
        </Typography>
        <Typography variant="body1">
          Month view would display a full calendar here
        </Typography>
      </Box>
    );
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Calendar
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleAddEvent()}
        >
          Add Event
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <IconButton onClick={handlePrevious}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton onClick={handleToday}>
              <TodayIcon />
            </IconButton>
            <IconButton onClick={handleNext}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
          
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            aria-label="calendar view"
            size="small"
          >
            <ToggleButton value="day" aria-label="day view">
              <DayViewIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="week" aria-label="week view">
              <WeekViewIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="month" aria-label="month view">
              <MonthViewIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        {view === 'day' && renderDayView()}
        {view === 'week' && renderWeekView()}
        {view === 'month' && renderMonthView()}
      </Paper>

      {/* Event Form Dialog */}
      <Dialog
        open={eventDialogOpen}
        onClose={() => setEventDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedEvent && selectedEvent.id ? 'Edit Event' : 'Add New Event'}
        </DialogTitle>
        <DialogContent dividers>
          <CalendarEventForm
            initialValues={selectedEvent}
            contacts={contacts}
            onSubmit={handleEventSubmit}
            onCancel={() => setEventDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this event? This action cannot be undone.
          </Typography>
        </DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}
