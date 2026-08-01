# JWT verification: the four ways it actually breaks

`alg=none` gets all the attention. It's the one everyone learns, it's in every slide deck, and in
2026 it's almost never the bug you actually find — most libraries hard-refuse it now.

The interesting failures are quieter. Here are the four I keep running into.

## 0. The setup

A JWT is three base64url segments joined by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXIifQ.<signature>
```

Header, payload, signature. The header is **attacker-controlled data that tells the server how to
verify the token**. Sit with that sentence for a second — that's where all four bugs live.

## 1. Algorithm confusion (HS256 vs RS256)

The classic. The server issues RS256 tokens signed with a private key and verifies with the public
key. The attacker re-signs a modified token with **HS256, using the public key as the HMAC secret**.

If the verification code does this:

```python
# vulnerable
claims = jwt.decode(token, public_key)
```

…then the library picks the algorithm from the token's own header. Header says HS256, so it treats
`public_key` as an HMAC secret — and the public key is, by definition, public. The attacker knows
it. The signature checks out.

The fix is one argument:

```python
claims = jwt.decode(token, public_key, algorithms=["RS256"])
```

**Always pin the algorithm at the verification site.** Not in config that might drift; at the call.

## 2. Verifying, but not checking who it's for

This one passes every signature test and still hands over the account.

A signed token proves *someone with the key issued this*. It does not prove the token was issued
**for your service**, **for this user**, or **recently**. If you have several services behind one
identity provider, a token minted for the low-value one is cryptographically perfect at the
high-value one — unless you check `aud`.

The claims that need checking, every time:

- `exp` — expiry, with a small clock skew allowance at most
- `nbf` / `iat` — not-before and issued-at, if present
- `iss` — the issuer you actually expect
- `aud` — **your** service identifier
- `sub` — and then authorise the subject, don't just authenticate it

Signature verification is step one of six. Most of the broken APIs I've looked at do step one and
call it done.

## 3. `kid` as a file path or a SQL value

The `kid` (key ID) header tells the server which key to use. It's attacker-controlled. If it gets
used as a lookup key without validation, it inherits every injection class the lookup has.

```javascript
// vulnerable: kid becomes a path
const key = fs.readFileSync(`/etc/keys/${header.kid}`);
```

Set `kid` to `../../../dev/null` and the key becomes an empty string. Sign with an empty HMAC secret
and the token verifies. The same trick lands in SQL (`kid` in a `WHERE` clause) and in remote key
fetches (`jku`/`x5u` headers pointing at a server you control).

> Treat `kid` exactly like a URL parameter: allowlist it against known key IDs. Never interpolate it
> into a path, a query, or a URL.

## 4. Trusting the token after you've stopped trusting the user

JWTs are stateless. That's the selling point and it's also the whole problem: **a valid token stays
valid until it expires**, no matter what happened in between.

Password changed. Session revoked. Account disabled. Admin role removed. The token in the
attacker's hand doesn't know about any of it.

You have three real options, and "we'll just use short expiry" is only one of them:

1. **Short-lived access tokens** (minutes) plus a refresh token you *can* revoke. The window shrinks
   to the access token's lifetime.
2. **A revocation list** checked on each request — which reintroduces the state you were avoiding,
   but only for the tokens you've actually killed.
3. **A token version** claim compared against a counter on the user record. Bump the counter on
   password change or privilege change and every outstanding token dies at once.

Pick one deliberately. Picking none is the default, and the default is a bug.

## A correct verifier, roughly

```python
claims = jwt.decode(
    token,
    key=key_for(header_kid_from_allowlist(token)),
    algorithms=["RS256"],          # pinned, not read from the token
    audience="api.example.com",    # this service
    issuer="https://idp.example.com",
    leeway=30,                     # seconds of clock skew, not minutes
)

if claims["ver"] != user_token_version(claims["sub"]):
    raise Unauthorized()

authorise(claims["sub"], requested_resource)   # authn != authz
```

Six lines of caution against four bug classes. Cheap trade.

---

There are hands-on labs for the first three of these — forge the tokens yourself in the browser — in
the [KashSec API Security path](https://kashsec.vercel.app/#/labs).
