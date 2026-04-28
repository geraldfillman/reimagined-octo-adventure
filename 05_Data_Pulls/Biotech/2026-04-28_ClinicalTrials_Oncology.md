---
title: "Clinical Trials — Oncology"
source: "ClinicalTrials.gov v2 API"
topic: "Oncology"
date_pulled: "2026-04-28"
domain: "biotech"
data_type: "event_list"
frequency: "daily"
filter: "RECRUITING"
signal_status: "watch"
signals:
  -
    id: "PHASE3_TRIAL_CLUSTER"
    severity: "watch"
    message: "4 Phase 3 industry-sponsored trials recruiting in Oncology"
tags: ["biotech", "clinical-trials", "oncology"]
---

## Recruiting Oncology Trials (20)

| NCT ID | Title | Phase | Sponsor | Interventions | Est. Completion | Last Updated |
| --- | --- | --- | --- | --- | --- | --- |
| NCT07302347 | A Study of Pembrolizumab in Japanese Pediatric Particip… | PHASE1/PHASE2 | Merck Sharp & Dohme LLC | Pembrolizumab | 2029-03-30 | 2026-04-28 |
| NCT06997497 | A Clinical Study of Calderasib (MK-1084) With Targeted … | PHASE3 | Merck Sharp & Dohme LLC | Calderasib, Oxaliplatin | 2029-03-28 | 2026-04-28 |
| NCT05389423 | Pomalidomide and Dose-Adjusted EPOCH +/- Rituximab for … | PHASE1 | National Cancer Institute (NCI… | Vincristine, Prednisone | 2028-06-01 | 2026-04-28 |
| NCT04116502 | MITHRIDATE: Ruxolitinib Versus Hydroxycarbamide or Inte… | PHASE3 | University of Birmingham | Ruxolitinib, Hydroxycarbamide | 2028-10-31 | 2026-04-28 |
| NCT06136650 | A Study of Opevesostat (MK-5684) Versus Alternative Nex… | PHASE3 | Merck Sharp & Dohme LLC | Opevesostat, Dexamethasone | 2028-05-10 | 2026-04-28 |
| NCT04902443 | Pomalidomide and Nivolumab in People With Virus-Associa… | PHASE1 | National Cancer Institute (NCI… | Pomalidomide, Nivolumab | 2026-12-01 | 2026-04-28 |
| NCT06413680 | A First-In Human (FIH) Study to Find Out How Well REGN1… | PHASE1/PHASE2 | Regeneron Pharmaceuticals | REGN10597, Cemiplimab | 2030-02-03 | 2026-04-28 |
| NCT06385691 | Study Evaluating the Efficacy of the myDIET Software To… | PHASE2 | Centre Leon Berard | myDIET software tool | 2028-06-30 | 2026-04-28 |
| NCT06010342 | A Study to Evaluate the Efficacy and Safety of TL118 in… | PHASE2 | Teligene US | TL118 Capsule | 2027-12 | 2026-04-28 |
| NCT06925737 | A Clinical Study of Ifinatamab Deruxtecan (I-DXd) in Pe… | PHASE3 | Merck Sharp & Dohme LLC | Ifinatamab deruxtecan, Docetaxel | 2028-06-26 | 2026-04-28 |
| NCT06923527 | Circulating Tumor DNA | PHASE2 | Yale University | Elacestrant | 2027-09 | 2026-04-28 |
| NCT05183035 | Venetoclax in Children With Relapsed Acute Myeloid Leuk… | PHASE3 | PedAL BCU, LLC | Fludarabine, Cytarabine | 2027-02 | 2026-04-28 |
| NCT06844422 | Adapted Guided Stereotactic Body Radiotherapy Combined … | PHASE1/PHASE2 | Shandong Cancer Hospital and I… | Ivonescimab | 2028-02-18 | 2026-04-28 |
| NCT06420219 | An Integrative Multi-Omic Characterization of Head and … | N/A | University of Southern Califor… | Non-Interventional Study | 2028-03-25 | 2026-04-28 |
| NCT00001529 | Improved Methods of Cell Selection for Bone Marrow Tran… | N/A | National Heart, Lung, and Bloo… | G-CSF | N/A | 2026-04-28 |
| NCT06707493 | Ivosidenib as Post-HSCT Maintenance for AML | PHASE2 | Massachusetts General Hospital | Ivosidenib, Placebo | 2028-01-01 | 2026-04-28 |
| NCT06124508 | PromotinG Lung Cancer screenIng Awareness and Implement… | NA | University of Miami | Lung Cancer Screening Education, Semi-St | 2029-04-30 | 2026-04-28 |
| NCT07011719 | Study of Casdatifan and Cabozantinib Versus Placebo and… | PHASE3 | Arcus Biosciences, Inc. | Casdatifan, Cabozantinib | 2028-04 | 2026-04-28 |
| NCT05588128 | Prospective Monitoring of Subjects With Biochemically R… | N/A | National Cancer Institute (NCI… | 18F-DCFpyL | 2026-12-31 | 2026-04-28 |
| NCT04696029 | DFMO as Maintenance Therapy for Molecular High/Very Hig… | PHASE2 | Giselle Sholler | Difluoromethylornithine | 2028-03 | 2026-04-28 |

## Signals

### 🟡 Phase 3 Trial Cluster (WATCH)

4 Phase 3 industry-sponsored trials recruiting in Oncology

**Implications:**
- Monitor sponsor companies for readout catalysts
- Review therapy area for M&A activity


## Source

- **API**: ClinicalTrials.gov v2 (/api/v2/studies)
- **Filter**: RECRUITING status, sorted by last update
- **Query**: cancer OR oncology OR tumor OR carcinoma OR leukemia OR lymphoma
- **No API key required**
- **Auto-pulled**: 2026-04-28
