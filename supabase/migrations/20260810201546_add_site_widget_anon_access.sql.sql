/*
# Allow site widget anonymous access for conversations and messages

1. Purpose
   The site chat widget runs on the dealer's website as an anonymous visitor (no Supabase auth session).
   It needs to create conversations and insert messages so the dealer sees them in the Atendimento inbox.
   This migration adds:
   - A SECURITY DEFINER function `create_site_conversation` that safely creates a conversation for a given dealer_id (validated against the dealers table)
   - An anon INSERT policy on `messages` restricted to channel='site' conversations
   - An anon UPDATE policy on `conversations` restricted to channel='site' (for updating last_message_preview)

2. Security
   - The SECURITY DEFINER function only creates conversations with channel='site', preventing abuse for other channels
   - The anon INSERT on messages checks that the parent conversation is channel='site'
   - The anon UPDATE on conversations checks channel='site'
   - No anon SELECT or DELETE is granted — the dealer still reads through their authenticated session
*/

-- === SECURITY DEFINER: create_site_conversation ===
-- Called by the site widget (anon key) to safely create a conversation
CREATE OR REPLACE FUNCTION create_site_conversation(
  p_dealer_id uuid,
  p_contact_name text DEFAULT NULL,
  p_contact_phone text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conv_id uuid;
  v_dealer_exists boolean;
BEGIN
  -- Validate dealer exists
  SELECT EXISTS(SELECT 1 FROM dealers WHERE id = p_dealer_id) INTO v_dealer_exists;
  IF NOT v_dealer_exists THEN
    RAISE EXCEPTION 'Dealer not found';
  END IF;

  -- Check if there's an existing open site conversation for this phone
  SELECT id INTO v_conv_id
  FROM conversations
  WHERE dealer_id = p_dealer_id
    AND channel = 'site'
    AND contact_phone = p_contact_phone
    AND status = 'open'
  LIMIT 1;

  IF v_conv_id IS NOT NULL THEN
    RETURN v_conv_id;
  END IF;

  -- Create new conversation
  INSERT INTO conversations (
    dealer_id, channel, contact_name, contact_phone,
    status, last_message_at, last_message_preview,
    unread_count, ai_qualified
  ) VALUES (
    p_dealer_id, 'site', p_contact_name, p_contact_phone,
    'open', now(), 'Nova conversa pelo site',
    1, false
  )
  RETURNING id INTO v_conv_id;

  RETURN v_conv_id;
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION create_site_conversation TO anon, authenticated;

-- === Anon INSERT on messages (only for site channel conversations) ===
DROP POLICY IF EXISTS "anon_insert_site_messages" ON messages;
CREATE POLICY "anon_insert_site_messages"
ON messages FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
      AND conversations.channel = 'site'
  )
);

-- === Anon UPDATE on conversations (only site channel) ===
DROP POLICY IF EXISTS "anon_update_site_conversations" ON conversations;
CREATE POLICY "anon_update_site_conversations"
ON conversations FOR UPDATE
TO anon, authenticated
USING (channel = 'site')
WITH CHECK (channel = 'site');

-- === Anon INSERT on conversations (only site channel) ===
DROP POLICY IF EXISTS "anon_insert_site_conversations" ON conversations;
CREATE POLICY "anon_insert_site_conversations"
ON conversations FOR INSERT
TO anon, authenticated
WITH CHECK (channel = 'site');
