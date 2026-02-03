[**@demox-labs/miden-wallet-adapter-react**](../README.md)

***

[@demox-labs/miden-wallet-adapter-react](../README.md) / WalletContextState

# Interface: WalletContextState

## Properties

### address

> **address**: `string`

***

### autoConnect

> **autoConnect**: `boolean`

***

### connected

> **connected**: `boolean`

***

### connecting

> **connecting**: `boolean`

***

### disconnecting

> **disconnecting**: `boolean`

***

### importPrivateNote()

> **importPrivateNote**: (`note`) => `Promise`\<`string`\>

#### Parameters

##### note

`Uint8Array`

#### Returns

`Promise`\<`string`\>

***

### privateDataPermission?

> `optional` **privateDataPermission**: `PrivateDataPermission`

***

### publicKey

> **publicKey**: `Uint8Array`\<`ArrayBufferLike`\>

***

### requestAssets()

> **requestAssets**: () => `Promise`\<`Asset`[]\>

#### Returns

`Promise`\<`Asset`[]\>

***

### requestConsumableNotes()

> **requestConsumableNotes**: () => `Promise`\<`InputNoteDetails`[]\>

#### Returns

`Promise`\<`InputNoteDetails`[]\>

***

### requestConsume()

> **requestConsume**: (`transaction`) => `Promise`\<`string`\>

#### Parameters

##### transaction

`MidenConsumeTransaction`

#### Returns

`Promise`\<`string`\>

***

### requestPrivateNotes()

> **requestPrivateNotes**: (`noteFilterType`, `noteIds?`) => `Promise`\<`InputNoteDetails`[]\>

#### Parameters

##### noteFilterType

`NoteFilterTypes`

##### noteIds?

`string`[]

#### Returns

`Promise`\<`InputNoteDetails`[]\>

***

### requestSend()

> **requestSend**: (`transaction`) => `Promise`\<`string`\>

#### Parameters

##### transaction

`MidenSendTransaction`

#### Returns

`Promise`\<`string`\>

***

### requestTransaction()

> **requestTransaction**: (`transaction`) => `Promise`\<`string`\>

#### Parameters

##### transaction

`MidenTransaction`

#### Returns

`Promise`\<`string`\>

***

### signBytes()

> **signBytes**: (`data`, `kind`) => `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

#### Parameters

##### data

`Uint8Array`

##### kind

`SignKind`

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

***

### waitForTransaction()

> **waitForTransaction**: (`txId`, `timeout?`) => `Promise`\<`TransactionOutput`\>

#### Parameters

##### txId

`string`

##### timeout?

`number`

#### Returns

`Promise`\<`TransactionOutput`\>

***

### wallet

> **wallet**: [`Wallet`](Wallet.md)

***

### wallets

> **wallets**: [`Wallet`](Wallet.md)[]

## Methods

### connect()

> **connect**(`privateDataPermission`, `network`, `allowedPrivateData?`): `Promise`\<`void`\>

#### Parameters

##### privateDataPermission

`PrivateDataPermission`

##### network

`WalletAdapterNetwork`

##### allowedPrivateData?

`AllowedPrivateData`

#### Returns

`Promise`\<`void`\>

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### select()

> **select**(`walletName`): `void`

#### Parameters

##### walletName

`WalletName`

#### Returns

`void`
