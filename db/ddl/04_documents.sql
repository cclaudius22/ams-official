CREATE TABLE IF NOT EXISTS documents (
    dis_document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_document_id TEXT,
    dis_application_id UUID NOT NULL,
    document_type VARCHAR(30),
    requirement_tier VARCHAR(20),
    processing_tier VARCHAR(10),
    criticality VARCHAR(20),
    gcs_path VARCHAR(512),
    processing_status VARCHAR(20) NOT NULL,
    quality_score NUMERIC(3,2),
    dlp_classification JSONB,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT fk_documents_application
        FOREIGN KEY (dis_application_id)
        REFERENCES applications(dis_application_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);