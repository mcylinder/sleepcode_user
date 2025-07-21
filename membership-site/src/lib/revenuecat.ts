// RevenueCat API service for subscription management
export interface SubscriptionStatus {
  subscriber: {
    original_app_user_id: string;
    entitlements: {
      [key: string]: {
        expires_date: string | null;
        product_identifier: string;
        purchase_date: string;
      };
    };
  };
}

export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
  try {
    const response = await fetch(`/api/subscription/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subscription status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return null;
  }
}

export function getSubscriptionStatusText(status: SubscriptionStatus | null): string {
  if (!status) return 'Unknown';
  
  const entitlements = Object.values(status.subscriber.entitlements);
  if (entitlements.length === 0) return 'No Active Subscription';
  
  const latestEntitlement = entitlements.reduce((latest, current) => {
    return new Date(current.purchase_date) > new Date(latest.purchase_date) ? current : latest;
  });
  
  if (latestEntitlement.expires_date) {
    const expiryDate = new Date(latestEntitlement.expires_date);
    const now = new Date();
    
    if (expiryDate > now) {
      return 'Active';
    } else {
      return 'Expired';
    }
  }
  
  return 'Active';
} 