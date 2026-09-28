import { getHomeContent } from '@/lib/cms/store';
import HomeEditor from './HomeEditor';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const initial = await getHomeContent();
  return <HomeEditor initial={initial} />;
}
