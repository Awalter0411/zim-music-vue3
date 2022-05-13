/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FETCH_URL: string
  // 更多环境变量...
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}
