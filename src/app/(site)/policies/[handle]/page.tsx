import { notFound } from 'next/navigation';
import { getShopPolicies, getShopPolicy } from '@/lib/shopify/policies';
import { withReturnWarehouse } from '@/lib/policies/returnWarehouse';

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const policies = await getShopPolicies();
    return policies.map((policy) => ({ handle: policy.handle }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  try {
    const policy = await getShopPolicy(handle);
    if (!policy) return { title: 'Policy — 3DThinkPro' };
    return {
      title: `${policy.title} — 3DThinkPro`,
      description: `${policy.title} for 3DThinkPro.`,
    };
  } catch {
    return { title: 'Policy — 3DThinkPro' };
  }
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  let policy = null;
  let loadError = false;
  try {
    policy = await getShopPolicy(handle);
  } catch {
    loadError = true;
  }
  if (!loadError && !policy) notFound();

  return (
    <div className="policy-page">
      {loadError || !policy ? (
        <p className="error-box">This policy couldn’t be loaded from Shopify. Please try again shortly.</p>
      ) : (
        <>
          <div className="policy-intro">
            <h1 className="fs-32 fw-regular policy-title">{policy.title}</h1>
          </div>
          <div
            className="policy-body"
            dangerouslySetInnerHTML={{ __html: withReturnWarehouse(policy.handle, policy.title, policy.body) }}
          />
        </>
      )}
    </div>
  );
}
