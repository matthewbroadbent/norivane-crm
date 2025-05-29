/*
  # Initial Schema Setup for CRM and Email Marketing System

  1. New Tables
    - `contacts` - Store contact information (name, email, phone)
    - `tags` - Store tag categories for contacts
    - `contact_tags` - Junction table for contacts and tags
    - `funnels` - Sales funnel definitions
    - `funnel_stages` - Stages within sales funnels
    - `contact_stages` - Track contacts through funnel stages
    - `email_templates` - Email templates for campaigns
    - `email_campaigns` - Email marketing campaigns
    - `campaign_recipients` - Recipients for email campaigns
    - `calendar_events` - Calendar events and appointments
    - `user_settings` - User preferences and settings

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'lead',
  last_contacted timestamptz,
  notes text
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own contacts"
  ON contacts
  USING (auth.uid() = user_id);

-- Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own tags"
  ON tags
  USING (auth.uid() = user_id);

-- Contact Tags Junction Table
CREATE TABLE IF NOT EXISTS contact_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(contact_id, tag_id)
);

ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own contact tags"
  ON contact_tags
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = contact_id
      AND contacts.user_id = auth.uid()
    )
  );

-- Funnels Table
CREATE TABLE IF NOT EXISTS funnels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own funnels"
  ON funnels
  USING (auth.uid() = user_id);

-- Funnel Stages Table
CREATE TABLE IF NOT EXISTS funnel_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funnel_id uuid NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  name text NOT NULL,
  order integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE funnel_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own funnel stages"
  ON funnel_stages
  USING (
    EXISTS (
      SELECT 1 FROM funnels
      WHERE funnels.id = funnel_id
      AND funnels.user_id = auth.uid()
    )
  );

-- Contact Stages Junction Table
CREATE TABLE IF NOT EXISTS contact_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  stage_id uuid NOT NULL REFERENCES funnel_stages(id) ON DELETE CASCADE,
  entered_at timestamptz DEFAULT now()
);

ALTER TABLE contact_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own contact stages"
  ON contact_stages
  USING (
    EXISTS (
      SELECT 1 FROM contacts
      WHERE contacts.id = contact_id
      AND contacts.user_id = auth.uid()
    )
  );

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own email templates"
  ON email_templates
  USING (auth.uid() = user_id);

-- Email Campaigns Table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  template_id uuid NOT NULL REFERENCES email_templates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'draft',
  scheduled_for timestamptz,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own email campaigns"
  ON email_campaigns
  USING (auth.uid() = user_id);

-- Campaign Recipients Table
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  opened_at timestamptz,
  clicked_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own campaign recipients"
  ON campaign_recipients
  USING (
    EXISTS (
      SELECT 1 FROM email_campaigns
      WHERE email_campaigns.id = campaign_id
      AND email_campaigns.user_id = auth.uid()
    )
  );

-- Calendar Events Table
CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  google_event_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own calendar events"
  ON calendar_events
  USING (auth.uid() = user_id);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text,
  logo_url text,
  email_signature text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own settings"
  ON user_settings
  USING (auth.uid() = user_id);
