export const checkAccess = (auth, route)=>{
    const {allowedroutes = [], isSubscribed, isSubscriptionEnded, isTrial, isTrialEnded, account, role} = auth;
    let isAllowed = false;
    let msg = '';

    const alwaysFreeRoutes = ["dashboard", "people", "company", "lead"]; // accessible without subscription

    // 1) If subscription is active
    if (isSubscribed && !isSubscriptionEnded) {
        // Super Admin: allow all
        if (role === 'Super Admin') {
            isAllowed = true;
        } else {
            // Other users: allow only assigned routes
            isAllowed = allowedroutes.includes(route);
        }
    }
    // 2) If no active subscription (including trial ended or no trial)
    else {
        // Only the free routes are accessible without subscription
        isAllowed = alwaysFreeRoutes.includes(route);
    }

    // Build message when not allowed
    if (!isAllowed) {
        if (!isSubscribed || isSubscriptionEnded) {
            // Not subscribed: suggest upgrade except if already a free route
            if (!alwaysFreeRoutes.includes(route)) {
                msg = 'Subscribe to access this feature.';
            } else if (isSubscriptionEnded) {
                msg = 'Your subscription has expired.';
            } else if (isTrialEnded) {
                msg = 'Your trial period is over';
            } else {
                msg = 'Subscribe to continue.';
            }
        } else {
            // Subscribed but not authorized
            msg = 'You are not authorized to access this route.';
        }
    }

    return {isAllowed, msg};
}