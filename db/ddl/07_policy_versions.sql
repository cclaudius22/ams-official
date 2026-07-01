CREATE TABLE IF NOT EXISTS policy_versions (
    policy_version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_file VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    git_commit_sha VARCHAR(40),
    gcs_path VARCHAR(500) NOT NULL,
    deployed_by VARCHAR(255) NOT NULL,
    deployed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE','SUPERSEDED','ROLLBACK')),
    previous_version_id UUID,
    policy_count INTEGER NOT NULL,
    changelog TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_policy_prev
        FOREIGN KEY (previous_version_id)
        REFERENCES policy_versions(policy_version_id)
        ON DELETE SET NULL
);