[**@miden-sdk/miden-wallet-adapter-react**](../README.md)

***

[@miden-sdk/miden-wallet-adapter-react](../README.md) / MidenFiSignerProviderProps

# Interface: MidenFiSignerProviderProps

## Properties

### accountType?

> `optional` **accountType**: [`SignerAccountType`](../type-aliases/SignerAccountType.md)

Account type for the signer account. Defaults to 'RegularAccountImmutableCode'

***

### allowedPrivateData?

> `optional` **allowedPrivateData**: `AllowedPrivateData`

Allowed private data types

***

### appName?

> `optional` **appName**: `string`

App name passed to the default MidenWalletAdapter

***

### autoConnect?

> `optional` **autoConnect**: `boolean`

Auto-connect to previously selected wallet on mount. Defaults to false

***

### children

> **children**: `ReactNode`

***

### customComponents?

> `optional` **customComponents**: `AccountComponent`[]

Custom account components to include in the account (e.g. from a compiled .masp package)

***

### importAccountId?

> `optional` **importAccountId**: `string`

Existing account ID to import instead of creating a new account

***

### localStorageKey?

> `optional` **localStorageKey**: `string`

LocalStorage key for persisting wallet selection

***

### network?

> `optional` **network**: `WalletAdapterNetwork`

Network to connect to

***

### onError()?

> `optional` **onError**: (`error`) => `void`

Error handler

#### Parameters

##### error

`WalletError`

#### Returns

`void`

***

### privateDataPermission?

> `optional` **privateDataPermission**: `PrivateDataPermission`

Private data permission level

***

### storageMode?

> `optional` **storageMode**: `"private"` \| `"public"` \| `"network"`

Storage mode for the signer account ('private' | 'public' | 'network'). Defaults to 'public'

***

### wallets?

> `optional` **wallets**: `Adapter`[]

Wallet adapters to use. Defaults to [MidenWalletAdapter]
