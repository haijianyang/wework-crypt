import test from 'ava';

import WeworkCrypt from '../';

test.before(async (t) => {
  const token = 'QDG6eK';
  const corpid = 'wx5823bf96d3bd56c7';
  const encodingAESKey = 'jWmYm7qr5nMoAUwZRjGtBxmz3KA1tkAj3ykkR6q2B2C';

  t.context.weworkCrypt = new WeworkCrypt(token, encodingAESKey, corpid);
});

test('WeworkCrypt verifyURL', async (t) => {
  const msgSignature = '5c45ff5e21c57e6ad56bac8758b79b1d9ac89fd3';
  const timestamp = '1409659589';
  const nonce = '263014780';
  const echostr = 'P9nAzCzyDtyTWESHep1vC5X9xho/qYX3Zpb4yKa9SKld1DsH3Iyt3tP3zNdtp+4RPcs8TgAE7OaBO+FZXvnaqQ==';

  t.context.weworkCrypt.verifyUrl(msgSignature, timestamp, nonce, echostr);

  t.pass();
});

test('WeworkCrypt decryptMsg', async (t) => {
  const msgSignature = '477715d11cdb4164915debcba66cb864d751f3e6';
  const timestamp = '1409659813';
  const nonce = '1372623149';
  const data = '<xml><ToUserName><![CDATA[wx5823bf96d3bd56c7]]></ToUserName><Encrypt><![CDATA[RypEvHKD8QQKFhvQ6QleEB4J58tiPdvo+rtK1I9qca6aM/wvqnLSV5zEPeusUiX5L5X/0lWfrf0QADHHhGd3QczcdCUpj911L3vg3W/sYYvuJTs3TUUkSUXxaccAS0qhxchrRYt66wiSpGLYL42aM6A8dTT+6k4aSknmPj48kzJs8qLjvd4Xgpue06DOdnLxAUHzM6+kDZ+HMZfJYuR+LtwGc2hgf5gsijff0ekUNXZiqATP7PF5mZxZ3Izoun1s4zG4LUMnvw2r+KqCKIw+3IQH03v+BCA9nMELNqbSf6tiWSrXJB3LAVGUcallcrw8V2t9EL4EhzJWrQUax5wLVMNS0+rUPA3k22Ncx4XXZS9o0MBH27Bo6BpNelZpS+/uh9KsNlY6bHCmJU9p8g7m3fVKn28H3KDYA5Pl/T8Z1ptDAVe0lXdQ2YoyyH2uyPIGHBZZIs2pDBS8R07+qN+E7Q==]]></Encrypt><AgentID><![CDATA[218]]></AgentID></xml>';

  await t.context.weworkCrypt.decryptMsg(msgSignature, timestamp, nonce, data);

  t.pass();
});

test('WeworkCrypt encryptMsg', async (t) => {
  const msgSignature = '477715d11cdb4164915debcba66cb864d751f3e6';
  const timestamp = '1409659813';
  const nonce = '1372623149';
  const data = '<xml><ToUserName><![CDATA[mycreate]]></ToUserName><FromUserName><![CDATA[wx5823bf96d3bd56c7]]></FromUserName><CreateTime>1348831860</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[this is a test]]></Content><MsgId>1234567890123456</MsgId><AgentID>128</AgentID></xml>';

  await t.context.weworkCrypt.encryptMsg(msgSignature, timestamp, nonce, data);

  t.pass();
});
