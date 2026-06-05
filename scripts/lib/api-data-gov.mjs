import { fetchWithRetry } from './fetcher.mjs';

const DEFAULT_AUTH = 'header';
const DEFAULT_KEY_PARAM = 'api_key';

export function buildApiDataGovRequest({ url, apiKey, auth = DEFAULT_AUTH, params = {}, keyParamName = DEFAULT_KEY_PARAM }) {
  const requestUrl = new URL(url);

  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const item of value) requestUrl.searchParams.append(key, item);
    } else {
      requestUrl.searchParams.set(key, value);
    }
  }

  const headers = {};
  if (apiKey && auth === 'header') {
    headers['X-Api-Key'] = apiKey;
  } else if (apiKey && auth === 'query') {
    requestUrl.searchParams.set(keyParamName, apiKey);
  }

  return {
    url: requestUrl.toString(),
    options: { headers },
  };
}

export function redactApiDataGovSecrets(value, apiKey = '') {
  let text = String(value ?? '');
  text = text.replace(/([?&](?:api_key|apikey|apiKey|key|API_KEY)=)[^&\s"']+/gi, '$1REDACTED');
  if (apiKey) {
    text = text.split(apiKey).join('REDACTED');
  }
  return text;
}

export function explainApiDataGovError({ status, data, url, apiKey }) {
  const body = typeof data === 'string'
    ? data
    : data?.error?.message || data?.message || JSON.stringify(data ?? {});
  const cleanUrl = redactApiDataGovSecrets(url, apiKey);
  const cleanBody = redactApiDataGovSecrets(body, apiKey);

  if (status === 429) {
    return new Error(`api.data.gov rate limit response for ${cleanUrl}: ${cleanBody}`);
  }
  if (status === 403) {
    return new Error(`api.data.gov authorization failed for ${cleanUrl}. Check DATA_GOV_API_KEY and endpoint access: ${cleanBody}`);
  }
  if (status === 404) {
    return new Error(`api.data.gov endpoint not found for ${cleanUrl}: ${cleanBody}`);
  }
  return new Error(`api.data.gov request failed with HTTP ${status} for ${cleanUrl}: ${cleanBody}`);
}

export async function fetchApiDataGovJson(endpoint, apiKey, options = {}) {
  const request = buildApiDataGovRequest({
    url: endpoint.url,
    apiKey,
    auth: endpoint.auth || DEFAULT_AUTH,
    params: {
      ...(endpoint.default_params || {}),
      ...(options.params || {}),
    },
    keyParamName: endpoint.key_param_name || DEFAULT_KEY_PARAM,
  });

  const result = await fetchWithRetry(request.url, { headers: request.options.headers });
  if (!result.ok) {
    throw explainApiDataGovError({ status: result.status, data: result.data, url: request.url, apiKey });
  }
  return result.data;
}

export function getByPath(value, path) {
  if (!path) return value;
  return String(path).split('.').reduce((current, segment) => {
    if (current == null) return undefined;
    return current[segment];
  }, value);
}

export function normalizeRecords(data, endpoint) {
  const records = getByPath(data, endpoint.records_path);
  if (Array.isArray(records)) return records;
  if (records && typeof records === 'object') return [records];
  if (Array.isArray(data)) return data;
  return [];
}
