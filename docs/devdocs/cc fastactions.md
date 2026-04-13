# 1. List all Assured Workloads in the org
gcloud assured workloads list --organization=YOUR_ORG_ID --location=europe-west2

# 2. If that doesn't work, try listing at the folder level
gcloud assured workloads list --organization=YOUR_ORG_ID --location=europe-west2 --folder=FOLDER_ID_FOR_PUBLIC_SECTOR_UK

# 3. Describe the specific workload (once you have the workload ID from step 1)
gcloud assured workloads describe WORKLOAD_ID --organization=YOUR_ORG_ID --location=europe-west2

# 4. Check org policies enforced on the folder
gcloud org-policies list --folder=FOLDER_ID_FOR_PUBLIC_SECTOR_UK

# 5. Specifically check the resource location constraint
gcloud org-policies describe constraints/gcp.resourceLocations --folder=FOLDER_ID_FOR_PUBLIC_SECTOR_UK

# 6. List the folder structure to confirm the hierarchy
gcloud resource-manager folders list --organization=YOUR_ORG_ID
gcloud resource-manager folders list --folder=FOLDER_ID_FOR_OPENVISA