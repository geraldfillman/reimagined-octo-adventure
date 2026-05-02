---
name: "OTX AlienVault"
category: "OSINT"
type: "API"
provider: "AT&T Cybersecurity / AlienVault"
pricing: "Free"
status: "Active"
priority: "Medium"
url: "https://otx.alienvault.com"
provides:
  - "Threat intelligence indicators (IPs, domains, hashes)"
  - "Malware campaign attribution"
  - "Indicator of Compromise (IoC) feeds"
  - "Real-time threat pulse subscriptions"
  - "Company domain reputation scoring"
best_use_cases:
  - "Cybersecurity thesis signal generation"
  - "Portfolio company breach/compromise monitoring"
  - "Defense sector threat landscape mapping"
  - "Attack surface reputation check for covered entities"
tags:
  - osint
  - threat-intelligence
  - cybersecurity
  - company-risk
  - api
related_sources:
  - "[[SpiderFoot]]"
  - "[[Shodan]]"
key_location: "OTX_API_KEY"
integrated: false
notes: "Free API. 100+ req/min. OTX Python SDK available (pip install OTXv2). Subscribe to threat pulses by industry (finance, healthcare, defense). Feeds SpiderFoot modules automatically if key is configured."
---

## Summary

OTX (Open Threat Exchange) is AlienVault's community threat intelligence platform — the largest open threat intel sharing network globally. For investment research, it provides **real-time threat signals** on covered company domains and sectors, directly feeding the cybersecurity thesis and the Company Risk layer.

## What It Provides

- Threat intelligence indicators (IPs, domains, hashes)
- Malware campaign attribution by threat actor
- Indicator of Compromise (IoC) feeds by industry
- Real-time threat pulse subscriptions
- Company domain reputation scoring

## Use Cases

- Cybersecurity thesis signal generation (active breach campaigns)
- Portfolio company breach/compromise monitoring → P2/P3 signals
- Defense sector threat landscape mapping
- Attack surface reputation check for covered entities

## Integration Notes

**Status**: Not yet integrated  
**API Key Required**: Yes (OTX_API_KEY) — free, sign up at otx.alienvault.com  
**Rate Limits**: 100 req/min (free tier)  
**Update Frequency**: Real-time pulse feed; poll daily for domain-specific indicators  
**Data Format**: JSON REST API  

### Setup

```bash
pip install OTXv2
```

### Key endpoints

```python
from OTXv2 import OTXv2
otx = OTXv2(api_key)

# Domain reputation
otx.get_indicator_details_full(IndicatorTypes.DOMAIN, 'example.com')

# Subscribe to financial sector pulses
otx.getall(modified_since=datetime.now() - timedelta(days=1), subscribed=True)
```

### Recommended pulse subscriptions (by investment thesis)

| Subscription tag | Relevant thesis |
|-----------------|----------------|
| `finance` | Cybersecurity, Banking |
| `defense` | Defense / Government |
| `healthcare` | Biotech / AMR |
| `energy` | Climate / Energy Infrastructure |

## Related Sources

- [[SpiderFoot]]
- [[Shodan]]
