-- CREATE TABLE IF NOT EXISTS applicants (
--     applicant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     passport_number_hashed BYTEA NOT NULL UNIQUE,
--     passport_number_raw VARCHAR(20) NOT NULL,
--     full_name TEXT NOT NULL,
--     date_of_birth DATE NOT NULL,
--     nationality CHAR(3) NOT NULL,
--     marital_status TEXT NOT NULL,
--     email VARCHAR(254),
--     phone VARCHAR(30),
--     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
-- );

CREATE TABLE IF NOT EXISTS applicants (
    applicant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passport_number_hashed BYTEA NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    nationality CHAR(3) NOT NULL,
    marital_status TEXT NOT NULL,
    email VARCHAR(254),
    phone VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
 