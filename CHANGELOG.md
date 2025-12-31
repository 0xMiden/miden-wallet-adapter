# Changelog

## 2025-12-31

## Features

* Add `waitForTransaction` which awaits the transaction generation process.

## 2025-11-26

### Changes

* [BREAKING] Refactor all components to reference `address` instead of `accountId`, to match the underlying address data

### New Versions

* `0.10.0` for all packages

## 2025-11-25

### Changes

* Update truncation of Miden address in `WalletMultiButton`

### New Versions

* `@demox-labs/miden-wallet-adapter`: `0.9.2`

  ---

* `@demox-labs/miden-wallet-adapter-reactui`: `0.9.2`

## 2025-11-20

### Changes

* Update React UI components and Miden Wallet logo to match Miden color theme

### New Versions

* `@demox-labs/miden-wallet-adapter`: `0.9.1`

  ---

* `@demox-labs/miden-wallet-adapter-reactui`: `0.9.1`
* `@demox-labs/miden-wallet-adapter-miden`: `0.9.1`

## 2025-11-18

### Changes

* Bump `@demox-labs/miden-sdk` dependency to `0.12.3`

### New Versions

* `0.9.0` for all packages

## 2025-10-31

### Changes

* Add `requestConsumableNotes` endpoint to retrieve all consumable notes for the connected account

### New Versions

* `0.8.2` for all packages

## 2025-10-22

### Changes

* Update `requestPrivateNotes` to accept a `noteFilterType` param and an optional `noteIds` param. See [NoteFilter](https://github.com/0xMiden/miden-client/blob/main/crates/web-client/src/models/note_filter.rs) in miden client for details about usage.

### New Versions

* `0.8.1` for all packages

## 2025-10-17

### Changes

* Change `signMessage` to `signBytes` and allow for signing of `SigningInputs`

### New Versions

* `0.8.0` for all packages

## 2025-10-06

### Changes

* Add `importPrivateNote` endpoint to import a private note file (.mno) into an account via Miden Wallet

### New Versions

* `0.7.0` for all packages

## 2025-09-30

### Changes

* Added `recipientAccountId` to `CustomTransaction` to surface recipient address in Miden Wallet

### New Versions

* `@demox-labs/miden-wallet-adapter`: `0.6.4`

  ---

* `@demox-labs/miden-wallet-adapter-base`: `0.6.4`
* `@demox-labs/miden-wallet-adapter-react`: `0.6.2`
* `@demox-labs/miden-wallet-adapter-reactui`: `0.6.2`
* `@demox-labs/miden-wallet-adapter-miden`: `0.6.3`

## 2025-09-26

### Changes

* Remove unnecessary webpack dependecy from `miden-wallet-adapter-miden` packages
* Update code examples in readmes
* Add repository links for package listings

### New Versions

* `@demox-labs/miden-wallet-adapter`: `0.6.3`

  ---

* `@demox-labs/miden-wallet-adapter-base`: `0.6.3`
* `@demox-labs/miden-wallet-adapter-react`: `0.6.1`
* `@demox-labs/miden-wallet-adapter-reactui`: `0.6.1`
* `@demox-labs/miden-wallet-adapter-miden`: `0.6.2`

## 2025-09-18

### Changes

* Add typings for private notes (see `InputNoteDetails`)

### New Versions

* `@demox-labs/miden-wallet-adapter`: `0.6.2`

  ---

* `@demox-labs/miden-wallet-adapter-base`: `0.6.2`
* `@demox-labs/miden-wallet-adapter-miden`: `0.6.1`

## 2025-09-17

### Changes

* Update `ConsumeTransaction` and `CustomTransaction` constructors to use built-in browser functions instead of `Buffer` (a node.js global)

### New Versions

* `@demox-labs/miden-wallet-adapter`: `0.6.1`

  ---

* `@demox-labs/miden-wallet-adapter-base`: `0.6.1`

## 2025-09-16

### Changes

* Add ability to request assets from Miden Wallet
* [BREAKING] Rename `AllowedPrivateData.Balance` to `AllowedPrivateData.Assets`

### New Versions

* `0.6.0` for all packages

## 2025-09-15

### Changes

* Expose account `publicKey` via `useWallet()` react hook

### New Versions

* `0.5.1` for all packages

## 2025-09-12

### Changes

* Add Ability to Sign a `Word` via the Wallet

### New Versions

* `0.5.0` for all packages

## 2025-09-10

### Changes

* Fix bug with `PrivateDataPermission`

### New Versions

* `0.4.1` for all packages

## 2025-09-09

### Changes

* [BREAKING] Introduce new permission scheme governing access to private accounts
* Bump `@demox-labs/miden-sdk` version `0.10.1 -> 0.11.1`

### New Versions

* `@demox-labs/miden-wallet-adapter`: `0.4.0`

  ---

* `@demox-labs/miden-wallet-adapter-base`: `0.4.0`
* `@demox-labs/miden-wallet-adapter-react`: `0.4.0`
* `@demox-labs/miden-wallet-adapter-reactui`: `0.4.0`
* `@demox-labs/miden-wallet-adapter-miden`: `0.4.0`

## 2025-08-22

### Changes

* Update adapter to use Yarn@4.9.3
* Fix bug in `CustomTransaction` constructor

### New Versions

* `@demox-labs/miden-wallet-adapter`: `0.3.3`

  ---

* `@demox-labs/miden-wallet-adapter-base`: `0.3.1`

## 2025-08-20

### Changes

* POC for fetching notes (only returns a list of note ids for the moment)

### New Versions

* `0.3.0` for all packages

## 2025-08-15

### Changes

* [BREAKING] `publicKey` renamed to `accountId` to better reflect internal logic

### New Versions

* `@demox-labs/miden-wallet-adapter`: `0.2.1`

  ---

* `@demox-labs/miden-wallet-adapter-base`: `0.2.0`
* `@demox-labs/miden-wallet-adapter-react`: `0.2.0`
* `@demox-labs/miden-wallet-adapter-reactui`: `0.2.0`
* `@demox-labs/miden-wallet-adapter-miden`: `0.2.0`

## 2025-08-12

### Changes

* Bumped React to 19.1.1

### New Versions

* `@demox-labs/miden-wallet-adapter`: `0.1.1`

  ---

* `@demox-labs/miden-wallet-adapter-react`: `0.1.2`
* `@demox-labs/miden-wallet-adapter-reactui`: `0.1.6`