# wework-crypt
## wework-crypt是企业微信加解密库的Node.js版本，借鉴了企业微信官方提供的Java版本库。

# Installation
```js
npm install wework-crypt
```

# Documentation
* class XMLParse 提供提取消息格式中的密文及生成回复消息格式的接口
  * static generate 生成xml消息
  * static extract 提取出xml数据包中的加密消息
* class PKCS7Encoder 提供基于PKCS7算法的加解密接口
  * static encode 获得对明文进行补位填充的字节
  * static decode 删除解密后明文的补位字符
  * tatic chr 将数字转化成ASCII码对应的字符，用于对明文进行补码
* class SHA1 计算消息签名接口
  * static getSHA1 用SHA1算法生成安全签名
* class WeworkCrypt 提供接收和推送给企业微信消息的加解密接口(UTF8编码的字符串)
  * verifyUrl 验证URL
  * decrypt 对密文进行解密
  * encrypt 对明文进行加密
  * encryptMsg 将企业微信回复用户的消息加密打包
  * decryptMsg 检验消息的真实性，并且获取解密后的明文

# Getting started

```js
  const WeworkCrypt = require('wework-crypt');

  const token = 'QDG6eK';
  const corpid = 'wx5823bf96d3bd56c7';
  const encodingAESKey = 'jWmYm7qr5nMoAUwZRjGtBxmz3KA1tkAj3ykkR6q2B2C';

  const weworkCrypt = new WeworkCrypt(token, encodingAESKey, corpid);

  // 校验URL
  const msgSignature = '5c45ff5e21c57e6ad56bac8758b79b1d9ac89fd3';
  const timestamp = '1409659589';
  const nonce = '263014780';
  const echostr = 'P9nAzCzyDtyTWESHep1vC5X9xho/qYX3Zpb4yKa9SKld1DsH3Iyt3tP3zNdtp+4RPcs8TgAE7OaBO+FZXvnaqQ==';

  weworkCrypt.verifyUrl(msgSignature, timestamp, nonce, echostr);

  // 解密消息
  const msgSignature = '477715d11cdb4164915debcba66cb864d751f3e6';
  const timestamp = '1409659813';
  const nonce = '1372623149';
  const data = '<xml><ToUserName><![CDATA[wx5823bf96d3bd56c7]]></ToUserName><Encrypt><![CDATA[RypEvHKD8QQKFhvQ6QleEB4J58tiPdvo+rtK1I9qca6aM/wvqnLSV5zEPeusUiX5L5X/0lWfrf0QADHHhGd3QczcdCUpj911L3vg3W/sYYvuJTs3TUUkSUXxaccAS0qhxchrRYt66wiSpGLYL42aM6A8dTT+6k4aSknmPj48kzJs8qLjvd4Xgpue06DOdnLxAUHzM6+kDZ+HMZfJYuR+LtwGc2hgf5gsijff0ekUNXZiqATP7PF5mZxZ3Izoun1s4zG4LUMnvw2r+KqCKIw+3IQH03v+BCA9nMELNqbSf6tiWSrXJB3LAVGUcallcrw8V2t9EL4EhzJWrQUax5wLVMNS0+rUPA3k22Ncx4XXZS9o0MBH27Bo6BpNelZpS+/uh9KsNlY6bHCmJU9p8g7m3fVKn28H3KDYA5Pl/T8Z1ptDAVe0lXdQ2YoyyH2uyPIGHBZZIs2pDBS8R07+qN+E7Q==]]></Encrypt><AgentID><![CDATA[218]]></AgentID></xml>';

  await weworkCrypt.decryptMsg(msgSignature, timestamp, nonce, data);

  // 加密消息
  const msgSignature = '477715d11cdb4164915debcba66cb864d751f3e6';
  const timestamp = '1409659813';
  const nonce = '1372623149';
  const data = '<xml><ToUserName><![CDATA[mycreate]]></ToUserName><FromUserName><![CDATA[wx5823bf96d3bd56c7]]></FromUserName><CreateTime>1348831860</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[this is a test]]></Content><MsgId>1234567890123456</MsgId><AgentID>128</AgentID></xml>';

  await weworkCrypt.encryptMsg(msgSignature, timestamp, nonce, data);
```
