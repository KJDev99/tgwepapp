import axios from 'axios'
import { LEGAL_ENDPOINTS, absoluteMediaUrl } from './endpoints'

// These endpoints live at the site root (not under /api) and are public —
// no auth header is required, so we use a bare axios call with the full URL.
const legalClient = axios.create({ timeout: 20000 })

function pickFileUrl(data) {
  // API shape: [{ id, files: "<url>" }]
  const list = Array.isArray(data) ? data : data?.results ?? []
  const first = list[0]
  const raw = first?.files || first?.file || ''
  return raw ? absoluteMediaUrl(raw) : ''
}

export async function fetchPrivacyPolicy() {
  const { data } = await legalClient.get(LEGAL_ENDPOINTS.privacyPolicy)
  return pickFileUrl(data)
}

export async function fetchTermsOfService() {
  const { data } = await legalClient.get(LEGAL_ENDPOINTS.termsOfService)
  return pickFileUrl(data)
}

// Returns a normalized list of legal documents shown to every user (both roles).
export async function fetchLegalDocs() {
  const [privacy, terms] = await Promise.all([
    fetchPrivacyPolicy().catch(() => ''),
    fetchTermsOfService().catch(() => ''),
  ])
  return [
    {
      key: 'privacy',
      title: 'Политика обработки персональных данных',
      url: privacy,
    },
    {
      key: 'terms',
      title: 'Пользовательское соглашение',
      url: terms,
    },
  ].filter((d) => d.url)
}
