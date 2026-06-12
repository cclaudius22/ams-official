#!/usr/bin/env bash
# Stage vendored DDL into .initdb/ for docker-entrypoint-initdb.d,
# applying the one documented patch (see README: upstream FK defect —
# 03_applications.sql references application_payload, but 02 creates
# submission_payload).
set -euo pipefail
cd "$(dirname "$0")"

rm -rf .initdb
mkdir -p .initdb
cp ddl/*.sql .initdb/

# Patch the upstream defect (documented in README.md; reported to Deloitte)
sed -i '' 's/REFERENCES application_payload(/REFERENCES submission_payload(/' .initdb/03_applications.sql 2>/dev/null \
  || sed -i 's/REFERENCES application_payload(/REFERENCES submission_payload(/' .initdb/03_applications.sql

echo "Staged $(ls .initdb | wc -l | tr -d ' ') files into db/.initdb/ (FK patch applied to 03_applications.sql)"
