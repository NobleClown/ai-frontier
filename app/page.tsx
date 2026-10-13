import { readEdition, listEditions } from '@/lib/news-store';
import Newsroom from './newsroom';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const [edition, dates] = await Promise.all([readEdition(), listEditions()]);
  return <Newsroom initial={edition} dates={dates} />;
}
