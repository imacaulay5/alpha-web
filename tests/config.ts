export const qaConfig = {
  baseUrl: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000',
  hasQaUser: Boolean(process.env.QA_EMAIL && process.env.QA_PASSWORD),
  qaEmail: process.env.QA_EMAIL || '',
  qaPassword: process.env.QA_PASSWORD || '',
}
