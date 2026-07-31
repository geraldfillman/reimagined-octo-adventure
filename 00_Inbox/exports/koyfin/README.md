# KoyFin Export Inbox

Drop KoyFin CSV exports here, then run:

```
node run.mjs pull koyfin-ingest
```

Expected format: wide CSV — first column is the date, each remaining column is one series (KoyFin's default multi-series export). Files are normalized into `05_Data_Pulls/Commodities/` pull notes and the raw CSV moves to `processed/`.

Files that fail validation stay here with an error printed — fix or delete them.
