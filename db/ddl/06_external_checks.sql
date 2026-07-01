CREATE TABLE IF NOT EXISTS external_checks (
    check_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dis_application_id UUID NOT NULL,
    dis_document_id UUID,
    check_type VARCHAR(50) NOT NULL,
    api_version VARCHAR(20) NOT NULL,
    request_payload JSONB NOT NULL,
    response_payload JSONB NOT NULL,
    check_status VARCHAR(20) NOT NULL,
    risk_level VARCHAR(20),
    confidence_score DECIMAL(5,4),
    flags JSONB,
    drools_consumed BOOLEAN NOT NULL DEFAULT FALSE,
    opa_consumed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    response_time_ms INTEGER NULL,

    CONSTRAINT external_checks_check_type_chk
        CHECK (check_type IN (
            'WORLDCHECK','INTERPOL','PASSPORT_VERIFY',
            'BORDER_CONTROL','DEVICE_IP_RISK',
            'EMAIL_PHONE_REPUTATION','COS_CHECK'
        )),

    CONSTRAINT external_checks_status_chk
        CHECK (check_status IN ('CLEAR', 'FLAGGED', 'BLOCKED', 'ERROR', 'TIMEOUT')),

    CONSTRAINT external_checks_risk_level_chk
        CHECK (risk_level IS NULL OR risk_level IN ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),

    CONSTRAINT external_checks_confidence_chk
        CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)),

    CONSTRAINT external_checks_dis_application_fk
        FOREIGN KEY (dis_application_id) REFERENCES applications(dis_application_id),

    CONSTRAINT external_checks_document_fk
        FOREIGN KEY (dis_document_id) REFERENCES documents(dis_document_id)
);