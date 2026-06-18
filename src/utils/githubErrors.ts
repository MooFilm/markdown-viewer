import { getLocale, translate, type TranslationKey } from '../i18n/translations';

export function formatGithubError(err: unknown): string {
  const error = err as { status?: number; message?: string };
  const status = error.status;
  const locale = getLocale();

  const t = (key: TranslationKey) => translate(locale, key);

  if (status === 404) return t('error404');
  if (status === 401) return t('error401');
  if (status === 403) {
    if (error.message?.toLowerCase().includes('rate limit')) {
      return t('errorRateLimit');
    }
    return t('error403');
  }
  if (status === 422) return t('error422');

  return error.message || t('errorGeneric');
}
