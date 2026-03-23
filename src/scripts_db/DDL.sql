CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile_e164 varchar(20) UNIQUE NOT NULL,
  email varchar(150),
  role varchar(20) NOT NULL DEFAULT 'CLIENT',
  mobile_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz not NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
  );

CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile_e164);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount_inr int NOT NULL,
  currency varchar(5) NOT NULL DEFAULT 'INR',
  status varchar(20) NOT NULL DEFAULT 'PENDING',
  consultation_id bigint NULL,
  join_lawyer_application_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);


CREATE INDEX IF NOT EXISTS idx_payments_consultation_id ON payments(consultation_id);
CREATE INDEX IF NOT EXISTS idx_payments_joinlawyer_id ON payments(join_lawyer_application_id);


ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS chk_payments_one_ref;

ALTER TABLE payments
  ADD CONSTRAINT chk_payments_one_ref
  CHECK (
    (consultation_id IS NOT NULL AND join_lawyer_application_id IS NULL)
    OR
    (consultation_id IS NULL AND join_lawyer_application_id IS NOT NULL)
  );



CREATE TABLE IF NOT EXISTS payment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  provider varchar(20) NOT NULL DEFAULT 'PHONEPE',
  merchant_transaction_id varchar(60) UNIQUE NOT NULL,
  provider_transaction_id varchar(80),
  status varchar(20) NOT NULL DEFAULT 'INITIATED',
  raw_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
  );

CREATE INDEX IF NOT EXISTS idx_attempts_payment_id ON payment_attempts(payment_id);

ALTER TABLE consultations ADD COLUMN IF NOT EXISTS user_id uuid NULL;
ALTER TABLE join_lawyer_applications ADD COLUMN IF NOT EXISTS user_id uuid NULL;

ALTER TABLE consultations
  DROP CONSTRAINT IF EXISTS fk_consultations_user;
ALTER TABLE consultations
  ADD CONSTRAINT fk_consultations_user FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE join_lawyer_applications
  DROP CONSTRAINT IF EXISTS fk_joinlawyer_user;
ALTER TABLE join_lawyer_applications
  ADD CONSTRAINT fk_joinlawyer_user FOREIGN KEY (user_id) REFERENCES users(id);


CREATE TABLE IF NOT EXISTS lawyer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name varchar(160) NOT NULL,
  bio text,
  photo bytea,
  photo_mime varchar(60),
  legal_category_ids int[] NOT NULL DEFAULT '{}'::int[],
  languages text[] NOT NULL DEFAULT '{}'::text[],
  city varchar(80),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_join_lawyer_active_user
    ON join_lawyer_applications(user_id)
    WHERE application_status IN ('DRAFT', 'SUBMITTED', 'IN_REVIEW');

ALTER TABLE consultations
    ALTER COLUMN email DROP NOT NULL;

ALTER TABLE join_lawyer_applications
    ADD COLUMN IF NOT EXISTS state varchar(120);

ALTER TABLE join_lawyer_applications
    ADD COLUMN IF NOT EXISTS code varchar(6) DEFAULT '+91';

ALTER TABLE join_lawyer_applications DROP COLUMN IF EXISTS photo;
ALTER TABLE join_lawyer_applications ADD COLUMN IF NOT EXISTS photo_path text;
ALTER TABLE join_lawyer_applications ADD COLUMN IF NOT EXISTS photo_file_name varchar(255);


ALTER TABLE users
ADD COLUMN roles text[] NOT NULL DEFAULT ARRAY['CLIENT']::text[];

UPDATE users
SET roles = ARRAY[role]::text[]
WHERE role IS NOT NULL;

ALTER TABLE users
DROP COLUMN role;

ALTER TABLE users
ADD CONSTRAINT users_roles_check
CHECK (
  roles <@ ARRAY['CLIENT', 'LAWYER', 'ADMIN']::text[]
);

ALTER TABLE users
ADD COLUMN password_hash varchar(255);

ALTER TABLE users
ADD COLUMN first_name varchar(100),
ADD COLUMN last_name varchar(100);

