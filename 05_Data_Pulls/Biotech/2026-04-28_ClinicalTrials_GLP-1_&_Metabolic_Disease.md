---
title: "Clinical Trials — GLP-1 & Metabolic Disease"
source: "ClinicalTrials.gov v2 API"
topic: "GLP-1 & Metabolic Disease"
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
    message: "5 Phase 3 industry-sponsored trials recruiting in GLP-1 & Metabolic Disease"
tags: ["biotech", "clinical-trials", "glp1", "metabolic", "obesity"]
signal_state: new
---

## Recruiting GLP-1 & Metabolic Disease Trials (20)

| NCT ID | Title | Phase | Sponsor | Interventions | Est. Completion | Last Updated |
| --- | --- | --- | --- | --- | --- | --- |
| NCT06776081 | Adipocyte-Derived Extracellular Vesicles, Weight Loss, … | NA | University of Colorado, Boulde… | Weight loss without pharmacotherapy | 2027-06-30 | 2026-04-28 |
| NCT05842850 | Non-alcoholic Fatty Liver Disease in Low Birth Weight I… | NA | Steno Diabetes Center Copenhag… | Caloric restriction intervention, No int | 2026-12 | 2026-04-28 |
| NCT06744283 | Experience and Management of Cancer Screening-Related A… | N/A | National Cancer Institute (NCI… | N/A | 2026-07-01 | 2026-04-28 |
| NCT07284901 | Efficacy and Safety of KAI-9531 Administered Once Weekl… | PHASE3 | Kailera | KAI-9531, Placebo | 2028-03-27 | 2026-04-28 |
| NCT00428987 | Physical and Behavioral Traits of Overweight and Obese … | N/A | National Institute of Diabetes… | N/A | N/A | 2026-04-28 |
| NCT07284979 | Efficacy and Safety of KAI-9531 Administered Once Weekl… | PHASE3 | Kailera | KAI-9531, Semaglutide | 2028-03-20 | 2026-04-28 |
| NCT07229170 | Changes in Taste and Eating Habits Associated With GLP-… | N/A | San Raffaele Telematic Univers… | N/A | 2027-01-01 | 2026-04-28 |
| NCT07142707 | A Study to Evaluate the Safety, Tolerability, Pharmacok… | PHASE1 | MBX Biosciences | MBX 4291, Placebo | 2026-10-30 | 2026-04-28 |
| NCT06749366 | Uncovering Genes Behind Cartilage Tumors and Vascular A… | N/A | Eunice Kennedy Shriver Nationa… | N/A | 2030-12-31 | 2026-04-28 |
| NCT07465341 | Michigan Weight Navigation Program (MiWeigh) Study | NA | University of Michigan | MiWeigh, Enhanced Usual Care (EUC) | 2031-04 | 2026-04-28 |
| NCT07065552 | Tirzepatide in Obesity-Driven Endometrial Cancer | EARLY_PHASE1 | UNC Lineberger Comprehensive C… | Tirzepatide | 2028-07 | 2026-04-28 |
| NCT07446595 | BfedBwell INSPIRE Pilot | NA | University of Colorado, Denver | BfedBwell - Core Curriculum, BfedBwell - | 2026-12 | 2026-04-28 |
| NCT07423065 | The Impact of Continuous Glucose Monitoring on Glucose … | NA | University of Primorska | Continuous Glucose Monitoring (CGM) | 2027-04-01 | 2026-04-28 |
| NCT07221214 | GLP-1 Receptor Agonists to Decrease Ethanol and CVD Ris… | PHASE2 | Vanderbilt University Medical … | Semaglutide (Rybelsus®), Placebo | 2029-07-31 | 2026-04-28 |
| NCT04036331 | Dyad Plus Effectiveness/Feasibility | NA | Wake Forest University Health … | Brenner FIT Standard, By Design Essentia | 2026-07 | 2026-04-28 |
| NCT05752799 | Evaluation of the Stress Response in Bariatric Surgery … | NA | G.Gennimatas General Hospital | Opioid Free Anaesthesia, Opioid based an | 2026-05-28 | 2026-04-28 |
| NCT07284875 | Efficacy and Safety of KAI-9531 in Participants Living … | PHASE3 | Kailera | KAI-9531, Placebo | 2028-02-28 | 2026-04-28 |
| NCT07102251 | A Study to Evaluate the Safety, Tolerability, PK/PD of … | PHASE1 | Sunshine Lake Pharma Co., Ltd. | HEC-007 injection, Placebo | 2026-12-31 | 2026-04-27 |
| NCT07533175 | AMAZE 2: A Research Study Investigating How Well the Me… | PHASE3 | Novo Nordisk A/S | NNC0487-0111, Placebo (matched to NNC048 | 2028-05-15 | 2026-04-27 |
| NCT07102628 | Evaluation of Efficacy and Safety of Early in Hospital … | PHASE3 | Novartis Pharmaceuticals | Placebo, Inclisiran | 2027-02-11 | 2026-04-27 |

## Signals

### 🟠 Phase 3 Trial Cluster (ALERT)

5 Phase 3 industry-sponsored trials recruiting in GLP-1 & Metabolic Disease

**Implications:**
- High commercial activity — review sponsor pipelines for near-term NDA/BLA risk
- Check for competing mechanisms that could compress trial outcomes
- Consider options activity around primary completion dates


## Source

- **API**: ClinicalTrials.gov v2 (/api/v2/studies)
- **Filter**: RECRUITING status, sorted by last update
- **Query**: GLP-1 OR semaglutide OR tirzepatide OR liraglutide OR obesity OR NASH OR metabolic syndrome OR type 2 diabetes weight
- **No API key required**
- **Auto-pulled**: 2026-04-28
