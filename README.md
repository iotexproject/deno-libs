# Windmill Deno SDK

The Windmill Deno SDK is a software development kit for the Windmill scheduled script execution platform. It provides convenient and quick ways to connect to databases, push webhooks, and store key-value (KV) pairs.

## Key Features

- **Database Connection**: It provides a simple and easy-to-use interface for quick database connection and interaction.
- **Webhook Push**: It provides a convenient interface for pushing messages to specified webhooks.
- **Key-Value Storage**: It provides a key-value storage system for convenient data storage and retrieval.

## Prerequisites
Before you start using this SDK, please make sure that the `DENO_AUTH_TOKENS` variable is configured in your local environment. You can set it in your shell or in a `.env` file at the root of your project. For detail config docs, pls use the [Windmill Docs](https://docs.windmill.dev/docs/advanced/imports#private-pypi-repository) or [Deno Docs](https://deno.land/manual@v1.35.1/basics/modules/private#github) 

## Quick Start

First, you need to import the Deno SDK into your project:

```typescript
import * as denoSDK from 'https://raw.githubusercontent.com/iotexproject/deno-libs/main/index.ts';
```

or

```typescript
import {kv, webhook, getDB} from 'https://raw.githubusercontent.com/iotexproject/deno-libs/main/index.ts';
```
Then, you can start using the functions provided by the SDK. Below are some basic examples:


## Database Connection
The getDB method currently support postgres mysql clickhouse

```typescript
import {getDB} from 'https://raw.githubusercontent.com/iotexproject/deno-libs/main/index.ts';

const db = await getDB('<DB Config Name>'); // DB Config -> https://wind.iotex.me/apps/get/u/chuangang/jobhub_app

// postgres
const rows = await db`select * from your_table`;

// mysql
const rows = await db.query("select * from your_table");

// clickhouse
const rows = await db.query('select * from your_table').toPromise();
```


## Webhook Push

```typescript
import {webhook} from 'https://raw.githubusercontent.com/iotexproject/deno-libs/main/index.ts';

await webhook.sendMsg({
  text: "",
  name: "", // Webhook name -> https://wind.iotex.me/apps/get/u/chuangang/jobhub_app -> click Webhook config tab
});
```

## Key-Value Storage
```typescript
import {kv} from 'https://raw.githubusercontent.com/iotexproject/deno-libs/main/index.ts';


await kv.set('key', 'value');


await kv.get('key');// key -> value
```
