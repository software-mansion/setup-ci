import { CycliToolbox } from '../types'

const SUPABASE_BASE_URL = 'https://pjkofjupiymnmxtwqcnx.supabase.co/rest/v1'
const SUPABASE_PUBLIC_API_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqa29manVwaXltbm14dHdxY254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc0MjgyNTYsImV4cCI6MjA0MzAwNDI1Nn0.f_YWrcYUQYqrwyT6nIv0w16uKxnOjlp5a93X6eeRv4Q'

interface Log {
  version: string
  firstUse?: boolean
  options?: { [key: string]: boolean }
  error: boolean
}

module.exports = (toolbox: CycliToolbox) => {
  const sendLog = async (log: Log) => {
    const { version, firstUse, options, error } = log

    const client = toolbox.http.create({
      baseURL: SUPABASE_BASE_URL,
      headers: {
        apiKey: SUPABASE_PUBLIC_API_KEY,
      },
    })

    await client.post('/usage', {
      version,
      first_use: firstUse,
      options,
      error,
    })
  }

  toolbox.telemetry = {
    sendLog,
  }
}

export interface TelemetryExtension {
  telemetry: {
    sendLog: (log: Log) => Promise<void>
  }
}
