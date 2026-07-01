CREATE TABLE IF NOT EXISTS callback_events (
    callback_event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    dis_application_id UUID NOT NULL,
    recommendation_id UUID NOT NULL,
    callback_url TEXT NOT NULL,
    attempt_number INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    http_status_code INTEGER,
    response_body TEXT,
    error_message TEXT,
    payload_hash VARCHAR(64),
    initiated_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    response_time_ms INTEGER,
    source_channel VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT callback_events_status_chk
        CHECK (status IN ('PENDING','SENT','DELIVERED','FAILED','RETRYING')),
    CONSTRAINT fk_callback_events_application
        FOREIGN KEY (dis_application_id)
        REFERENCES applications(dis_application_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_callback_events_recommendation
        FOREIGN KEY (recommendation_id)
        REFERENCES recommendations(recommendation_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);