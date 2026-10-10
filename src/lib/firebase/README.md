# Firebase

Thin, tree-shakeable wrappers around the Firebase modular (v9+) web SDK. Nothing
in this folder runs during SSR — every entry point that touches Firebase checks
`isBrowser` and is only called from client-side effects.

## Files

| File           | Responsibility                                                                 |
| -------------- | ------------------------------------------------------------------------------ |
| `config.ts`    | Reads and validates `VITE_FIREBASE_*` variables. Throws on missing values.     |
| `app.ts`       | Lazily creates the singleton `FirebaseApp` (browser only).                     |
| `auth.ts`      | Lazily exposes `Auth` and the Google provider (`prompt: select_account`).      |
| `analytics.ts` | Initialises Analytics only when `isSupported()`; exposes a safe `logEvent`.    |
| `index.ts`     | Barrel re-export.                                                              |

## Env setup

Copy `.env.example` to `.env` and fill in the values from
Firebase console → Project settings → General → Your apps → Web app.
`.env` is gitignored; `.env.example` is committed with empty placeholders.

## Auth persistence

`authService.ts` calls `setPersistence` before sign-in:
`browserLocalPersistence` by default, or `browserSessionPersistence` when the
user clears "Remember me" on the login form.

## Next phase: Firestore

Firestore will be added by creating `src/lib/firebase/firestore.ts` that lazily
returns `getFirestore(getFirebaseApp())`, plus a repository implementation in
`src/services` that fulfils the existing `Repository<T>` contract. No component
changes should be required because domain code reads through the repository
hooks, not the SDK directly. Identity (UID) will become the foreign key that
replaces the mock owner names.
