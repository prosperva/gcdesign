// TODO: replace with real Entra ID token verification once auth is wired up. The
// frontend will attach an `Authorization: Bearer <token>` header (acquired via MSAL);
// this function should validate it and return the verified `oid` claim instead of this
// hardcoded id. The frontend never supplies the user id itself, by design — this is the
// one place that needs to change when real auth lands, and everything downstream (the
// .NET API's own dev header scheme included) just keeps consuming whatever comes out of
// here.
const DEV_USER_ID = 'usr-00042';

export function resolveUserId(): string {
  return DEV_USER_ID;
}
