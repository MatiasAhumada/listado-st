export interface SessionCookieStore {
  get: (name: string) => { value: string } | undefined;
}
