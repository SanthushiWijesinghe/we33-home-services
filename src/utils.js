export const money=n=>`LKR ${Number(n).toLocaleString()}`
export const formatShortDate=value=>new Date(`${value}T00:00:00`).toLocaleDateString('en',{weekday:'short',day:'numeric',month:'short'})
