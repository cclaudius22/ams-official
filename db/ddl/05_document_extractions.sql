CREATE TABLE IF NOT EXISTS document_extractions (
    extraction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dis_document_id UUID NOT NULL,
    dis_application_id UUID NOT NULL,
    extraction_method VARCHAR(30) NOT NULL,
    extraction_model_version TEXT NOT NULL,
    processor_id TEXT NOT NULL,
    raw_extraction JSONB NOT NULL,
    normalised_fields JSONB NOT NULL,
    fraud_score NUMERIC,
    fraud_status VARCHAR(20),
    fraud_signals JSONB,
    confidence_score NUMERIC,
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_extractions_document
        FOREIGN KEY (dis_document_id)
        REFERENCES documents(dis_document_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_extractions_application
        FOREIGN KEY (dis_application_id)
        REFERENCES applications(dis_application_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);