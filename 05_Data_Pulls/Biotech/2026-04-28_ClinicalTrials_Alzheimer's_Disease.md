---
title: "Clinical Trials — Alzheimer's Disease"
source: "ClinicalTrials.gov v2 API"
topic: "Alzheimer's Disease"
date_pulled: "2026-04-28"
domain: "biotech"
data_type: "event_list"
frequency: "daily"
filter: "RECRUITING"
signal_status: "alert"
signals:
  -
    id: "PHASE3_TRIAL_CLUSTER"
    severity: "alert"
    message: "5 Phase 3 industry-sponsored trials recruiting in Alzheimer's Disease"
tags: ["biotech", "clinical-trials", "alzheimers", "neurology"]
signal_state: new
---

## Recruiting Alzheimer's Disease Trials (20)

| NCT ID | Title | Phase | Sponsor | Interventions | Est. Completion | Last Updated |
| --- | --- | --- | --- | --- | --- | --- |
| NCT07099053 | Amyloid PET Imaging in the Baltimore Longitudinal Study… | N/A | National Institute on Aging (N… | N/A | 2029-12-12 | 2026-04-28 |
| NCT03926520 | Electroconvulsive Therapy (ECT) for Agitation in Dement… | NA | Brent Forester | Electroconvulsive Therapy (ECT) | 2026-05-31 | 2026-04-28 |
| NCT07169630 | PET Imaging of Phosphodiesterase-4 (PDE4) in Volunteers… | PHASE1 | National Institute of Mental H… | 18F-PF974, 18F-florbetaben | 2029-04-11 | 2026-04-28 |
| NCT07214727 | A Study to Evaluate ALN-5288 in Patients With Alzheimer… | PHASE1 | Alnylam Pharmaceuticals | ALN-5288, Placebo | 2030-03-06 | 2026-04-24 |
| NCT04396873 | PET Imaging of Cyclooxygenases in Neurodegenerative Bra… | PHASE1 | National Institute of Mental H… | 11C-MC1, 11C-PS13 | 2029-04-11 | 2026-04-24 |
| NCT07158216 | Long Term Effect of Brain Stimulation in PPA | NA | Hospital San Carlos, Madrid | TMS, tDCS | 2028-12 | 2026-04-23 |
| NCT06088121 | Study to Evaluate the Efficacy and Safety of ATNC-MDD V… | NA | Advanced Technology & Communic… | ATNC MDD-V1 (Real TMS + Real Cog), ATNC  | 2027-01-15 | 2026-04-23 |
| NCT06709014 | A Double-blind Dual Study Assessing Safety and Efficacy… | PHASE3 | Annovis Bio Inc. | buntanetap/posiphen, Placebo | 2027-12 | 2026-04-23 |
| NCT05924425 | Daridorexant to Treat Insomnia in Patients With Mild Co… | PHASE4 | University Hospital, Montpelli… | Daridorexant 50 mg, Placebo | 2027-05-13 | 2026-04-23 |
| NCT07332260 | Alzheimer's Disease and Faecal Microbiota Transplantati… | PHASE1 | University Hospital of North N… | Biological: Preprocessed thawed donor FM | 2026-10 | 2026-04-22 |
| NCT07011745 | A Phase 3 Study to Evaluate the Safety and Efficacy of … | PHASE3 | Bristol-Myers Squibb | Xanomeline/Trospium Chloride Capsule, Xa | 2028-11-03 | 2026-04-22 |
| NCT07545473 | Retinal Hyperspectral Imaging in Neurodegenerative Dise… | NA | Center for Eye Research Austra… | Hyperspectral camera | 2028-12-31 | 2026-04-22 |
| NCT06668610 | A Multifocal tDCS-EEG Protocol for Improving Symptoms o… | NA | University of Campania Luigi V… | StarStim 32, Neuroelectrics, Spain - Rea | 2026-10-01 | 2026-04-22 |
| NCT07011732 | A Phase 3 Study to Evaluate the Safety and Efficacy of … | PHASE3 | Bristol-Myers Squibb | Xanomeline/Trospium Chloride Capsule, Xa | 2028-11-24 | 2026-04-22 |
| NCT05915000 | CSF Protein Markers as Prognostic Indicators of the Res… | N/A | University of Valencia | Lumbar CSF protein marker determination | 2029-03-17 | 2026-04-22 |
| NCT06937229 | A Study to Evaluate the Long-term Efficacy and Safety o… | PHASE3 | Bristol-Myers Squibb | KarXT, KarX-EC | 2029-06-22 | 2026-04-21 |
| NCT06810960 | A Postmarketing Study of LEQEMBI in South Korean Partic… | N/A | Eisai Korea Inc. | No Intervention | 2029-09-30 | 2026-04-21 |
| NCT07347431 | Large Language Model for Understanding and Monitoring E… | N/A | Northumbria Healthcare NHS Fou… | LUMEN prototype software interaction | 2026-12-31 | 2026-04-21 |
| NCT06947941 | A Study to Evaluate Safety and Efficacy of KarXT + KarX… | PHASE3 | Bristol-Myers Squibb | KarXT, KarX-EC | 2028-03-20 | 2026-04-21 |
| NCT04570085 | Effect of CAFfeine on Cognition in Alzheimer's Disease | PHASE3 | University Hospital, Lille | Caffeine, Placebo | 2027-12 | 2026-04-20 |

## Signals

### 🟠 Phase 3 Trial Cluster (ALERT)

5 Phase 3 industry-sponsored trials recruiting in Alzheimer's Disease

**Implications:**
- High commercial activity — review sponsor pipelines for near-term NDA/BLA risk
- Check for competing mechanisms that could compress trial outcomes
- Consider options activity around primary completion dates


## Source

- **API**: ClinicalTrials.gov v2 (/api/v2/studies)
- **Filter**: RECRUITING status, sorted by last update
- **Query**: alzheimer OR amyloid beta OR tau protein OR lecanemab OR donanemab OR mild cognitive impairment amyloid
- **No API key required**
- **Auto-pulled**: 2026-04-28
