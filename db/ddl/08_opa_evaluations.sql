-- CREATE TABLE IF NOT EXISTS opa_results (
--     opa_result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     dis_application_id UUID,
--     policy_id VARCHAR(50) NOT NULL,
--     policy_name VARCHAR(255) NOT NULL,
--     policy_type VARCHAR(10) NOT NULL,
--     outcome VARCHAR(10) NOT NULL,
--     denial_reasons TEXT[],
--     input_context JSONB NOT NULL,
--     policy_version_id UUID,
--     evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--     processing_time_ms INTEGER,
--     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

--     FOREIGN KEY (dis_application_id)
--         REFERENCES applications(dis_application_id),

--     FOREIGN KEY (policy_version_id)
--         REFERENCES policy_versions(policy_version_id)
--         ON DELETE SET NULL
-- );

CREATE TABLE IF NOT EXISTS opa_evaluations (
    opa_result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dis_application_id UUID,
    policy_id VARCHAR(50) NOT NULL,
    policy_name VARCHAR(255) NOT NULL,
    policy_type VARCHAR(10) NOT NULL,
    outcome VARCHAR(10) NOT NULL,
    denial_reasons TEXT[],
    input_context JSONB NOT NULL,
    policy_version_id UUID,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 
    FOREIGN KEY (dis_application_id)
        REFERENCES applications(dis_application_id),
 
    FOREIGN KEY (policy_version_id)
        REFERENCES policy_versions(policy_version_id)
        ON DELETE SET NULL
);