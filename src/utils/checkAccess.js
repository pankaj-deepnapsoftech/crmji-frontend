export const checkAccess = (auth, route)=>{
    const {allowedroutes = [], isSubscribed, isSubscriptionEnded, isTrial, isTrialEnded, account, role} = auth;
    let isAllowed = false;
    let msg = '';

    // Super Admin: allow all routes if subscribed and subscription not ended
    if(role === 'Super Admin' && isSubscribed && !isSubscriptionEnded){
        isAllowed = true;
    }
    // Admin or other users: check if route is in allowedroutes and subscribed
    else if(isSubscribed && !isSubscriptionEnded && allowedroutes.includes(route)){
        isAllowed = true;
    }
    // Trial active: allow only trial routes that are in allowedroutes
    else if(isTrial && !isTrialEnded && allowedroutes.includes(route)){
        isAllowed = true;
    }
    
    // Set error messages
    if(isSubscriptionEnded){
        msg = 'Your subscription has expired.';
    }
    else if(isTrialEnded){
        msg = 'Your trial period is over';
    }
    else if(isSubscribed && !isSubscriptionEnded){
        // For subscribed users (non-Super Admin), check if route is allowed
        if(role !== 'Super Admin' && !allowedroutes.includes(route)){
            msg = 'You are not authorized to access this route.';
        }
    }
    else if(isTrial && !isTrialEnded){
        if(!allowedroutes.includes(route)){
            msg = 'You are not authorized to access this route.';
        }
    }
    else if(!isTrialEnded && !allowedroutes.includes(route)){
        msg = 'Subscribe to continue.';
    }
    else{
        msg = 'Activate trial account or Subscribe to continue';
    }

    return {isAllowed, msg};
}