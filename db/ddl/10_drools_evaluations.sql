-- CREATE TABLE IF NOT EXISTS rule_results (
--     rule_result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     dis_application_id UUID NOT NULL,
--     rule_id VARCHAR(50) NOT NULL,
--     rule_name TEXT NOT NULL,
--     rule_category VARCHAR(50) NOT NULL,
--     outcome VARCHAR(30) NOT NULL,
--     severity VARCHAR(20) NOT NULL,
--     reasoning TEXT,
--     evidence_refs TEXT[],
--     remediation TEXT,
--     rule_version_id UUID NOT NULL,
--     evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
--     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

--     FOREIGN KEY (dis_application_id)
--         REFERENCES applications(dis_application_id)
--         ON UPDATE CASCADE
--         ON DELETE CASCADE,

--     FOREIGN KEY (rule_version_id)
--         REFERENCES rule_versions(rule_version_id)
--         ON UPDATE CASCADE
--         ON DELETE SET NULL
-- );

CREATE TABLE IF NOT EXISTS drools_evaluations (
    rule_result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dis_application_id UUID NOT NULL,
    rule_id VARCHAR(50) NOT NULL,
    rule_name TEXT NOT NULL,
    rule_category VARCHAR(50) NOT NULL,
    outcome VARCHAR(30) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    reasoning TEXT,
    evidence_refs TEXT[],
    remediation TEXT,
    rule_version_id UUID NOT NULL,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 
    FOREIGN KEY (dis_application_id)
        REFERENCES applications(dis_application_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
 
    FOREIGN KEY (rule_version_id)
        REFERENCES rule_versions(rule_version_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);