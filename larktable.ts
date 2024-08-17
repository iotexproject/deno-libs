import process from 'https://deno.land/std@0.132.0/node/process.ts';
import { getDB } from './db.ts';
import { get, set } from './kv.ts';
import axios from 'npm:axios';
import dayjs from 'npm:dayjs';

const ASSESS_TOKEN_URL =
  'https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal';

// return lark table access token, if the token is expired, get a new one
export async function getAccessToken({ appId, appSecret }) {
  const tokenRes = await get('lark_access_token');

  // if the token is not expired, return it
  if (tokenRes) {
    const { token, expired_at } = tokenRes;
    if (dayjs(expired_at).isAfter(dayjs())) {
      return {
        accessToken: token,
      };
    }
  }

  console.log('The access token is expired, get a new one');

  // k -> string , v -> jsonb
  const accessToken = await _getAccessToken({ appId, appSecret });
  await set('lark_access_token', {
    token: accessToken,
    expired_at: dayjs().add(1, 'hour').toDate(),
  });

  return {
    accessToken,
  };
}

async function _getAccessToken({ appId, appSecret }) {
  const r = await axios.post(ASSESS_TOKEN_URL, {
    app_id: appId,
    app_secret: appSecret,
  });

  return r.data.tenant_access_token;
}

/**
 *
 * 获取 wiki table 信息
 * @param accessToken
 * @param token
 */
async function getNode(accessToken: string, token: string) {
  interface R {
    code: number;
    msg: string;
    data: Data;
  }

  interface Data {
    node: Node;
  }

  interface Node {
    space_id: string;
    node_token: string;
    obj_token: string;
    obj_type: string;
    parent_node_token: string;
    node_type: string;
    origin_node_token: string;
    origin_space_id: string;
    has_child: boolean;
    title: string;
    obj_create_time: string;
    obj_edit_time: string;
    node_create_time: string;
    creator: string;
    owner: string;
  }

  const r: AxiosResponse<R> = await axios.get(
    `https://open.larksuite.com/open-apis/wiki/v2/spaces/get_node?token=${token}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return r.data.data.node;
}

async function _records(query: {
  accessToken: string;
  appToken: string;
  tableId: string;
}) {
  const r = await axios.get(
    `https://open.larksuite.com/open-apis/bitable/v1/apps/${query.appToken}/tables/${query.tableId}/records?page_size=500`,
    {
      headers: {
        Authorization: `Bearer ${query.accessToken}`,
      },
    }
  );

  const data = r.data?.data?.items;
  if (data && data.length > 0) {
    return data.map((item) => item.fields);
  }
  return [];
}

export async function records(
  tableId: string,
  conf: {
    appId: string;
    appSecret: string;
    wikiToken: string;
  }
) {
  console.log(conf);

  const accessTokenRes: any = await getAccessToken({
    appId: conf.appId,
    appSecret: conf.appSecret,
  });
  const accessToken = accessTokenRes.accessToken;

  const node = await getNode(accessToken, conf.wikiToken);
  const APP_TOKEN = node.obj_token;

  const r = await _records({
    accessToken,
    appToken: APP_TOKEN,
    tableId: tableId,
  });
  console.log(r);

  return r;
}
