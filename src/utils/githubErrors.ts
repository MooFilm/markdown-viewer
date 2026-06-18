export function formatGithubError(err: unknown): string {
  const error = err as { status?: number; message?: string };
  const status = error.status;

  if (status === 404) {
    return 'Repository or file not found. Check owner and repository name.';
  }
  if (status === 401) {
    return 'Invalid or expired token. Please check your GitHub PAT.';
  }
  if (status === 403) {
    if (error.message?.toLowerCase().includes('rate limit')) {
      return 'GitHub API rate limit exceeded. Try again later or add a token.';
    }
    return 'Access denied. Check repository permissions or token scope.';
  }
  if (status === 422) {
    return 'Invalid repository configuration.';
  }

  return error.message || 'Connection failed. Please try again.';
}
