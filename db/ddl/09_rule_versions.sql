CREATE TABLE IF NOT EXISTS rule_versions (
    rule_version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_file VARCHAR(255) NOT NULL,
    version VARCHAR(30) NOT NULL,
    git_commit_sha VARCHAR(40),
    gcs_path VARCHAR(500) NOT NULL,
    deployed_by VARCHAR(255) NOT NULL,
    deployed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE','SUPERSEDED','ROLLBACK')),
    previous_version_id UUID,
    rule_count INTEGER NOT NULL DEFAULT 0,
    changelog TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    FOREIGN KEY (previous_version_id)
        REFERENCES rule_versions(rule_version_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);