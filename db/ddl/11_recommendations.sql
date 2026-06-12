-- CREATE TABLE IF NOT EXISTS decisions (
--     decision_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     dis_application_id UUID NOT NULL UNIQUE,
--     outcome VARCHAR(20) NOT NULL CHECK (outcome IN ('APPROVED', 'REJECTED', 'MANUAL_REVIEW')),
--     confidence NUMERIC(5,2) NULL,
--     component_scores JSONB NULL,
--     hard_fail_rules TEXT[] NULL,
--     soft_flag_rules TEXT[] NULL,
--     decision_made_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--     total_processing_time_ms INTEGER NULL,
--     drools_version JSONB NULL,
--     opa_version JSONB NULL,
--     callback_sent_at TIMESTAMPTZ NULL,
--     callback_status VARCHAR(30) NULL,
--     submission_payload JSONB NULL,

--     CONSTRAINT fk_decisions_applications
--         FOREIGN KEY (dis_application_id)
--         REFERENCES applications(dis_application_id)
-- );

CREATE TABLE IF NOT EXISTS recommendations (
    recommendation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dis_application_id UUID NOT NULL UNIQUE,
    outcome VARCHAR(20) NOT NULL CHECK (outcome IN ('APPROVE','REJECT','MANUAL_REVIEW')),
    caseworker_summary TEXT NULL,
    confidence NUMERIC(5,2) NULL,
    component_scores JSONB NULL,
    hard_fail_rules TEXT[] NULL,
    soft_flag_rules TEXT[] NULL,
    recommendation_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_processing_time_ms INTEGER NULL,
    drools_version JSONB NULL,
    opa_version JSONB NULL,
    callback_sent_at TIMESTAMPTZ NULL,
    callback_status VARCHAR(30) NULL,
    submission_payload JSONB NULL,
 
    CONSTRAINT fk_recommendations_applications
        FOREIGN KEY (dis_application_id)
        REFERENCES applications(dis_application_id)
);