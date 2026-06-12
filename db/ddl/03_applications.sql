CREATE TABLE IF NOT EXISTS applications (
    dis_application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID UNIQUE,
    source_application_id VARCHAR(50) NOT NULL UNIQUE,
    source_channel VARCHAR(20) NOT NULL,
    caseworker_id VARCHAR(20),
    applicant_id UUID NOT NULL,
    request_id UUID NOT NULL,
    visa_type VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL,
    callback_url VARCHAR(255),
    submission_ip INET,
    device_fingerprint VARCHAR(128),
    user_agent TEXT,
    auth_context JSONB,
    payload_doc_count INTEGER NOT NULL DEFAULT 0,
    expected_doc_count INTEGER NOT NULL DEFAULT 0,
    processed_doc_count INTEGER NOT NULL DEFAULT 0,
    cross_doc_fraud JSONB,
    completeness_score INTEGER,
    completeness_trace JSONB NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_applications_applicant
        FOREIGN KEY (applicant_id)
        REFERENCES applicants(applicant_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_applications_payload
        FOREIGN KEY (submission_id)
        REFERENCES application_payload(submission_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);