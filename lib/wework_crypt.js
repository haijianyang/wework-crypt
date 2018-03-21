const crypto = require('crypto');
const { Buffer } = require('buffer');

const SHA1 = require('./sha1');
const PKCS7Encoder = require('./pkcs7_encoder');
const XMLParse = require('./xml_parse');

/**
 * 提供接收和推送给企业微信消息的加解密接口(UTF8编码的字符串)
 */
module.exports = class WeworkCrypt {
  constructor(token, encodingAESKey, corpid) {
    if (encodingAESKey.length !== 43) {
      throw new Error('SymmetricKey非法');
    }

    this.token = token;
    this.aesKey = Buffer.from(`${encodingAESKey}=`, 'base64');
    this.corpid = corpid;
  }

  /**
   * 验证URL
   *
   * @param msgSignature 签名串，对应URL参数的msg_signature
   * @param timestamp 时间戳，对应URL参数的timestamp
   * @param nonce 随机串，对应URL参数的nonce
   * @param echostr 随机串，对应URL参数的echostr
   *
   * @return 解密之后的echostr
   */
  verifyUrl(msgSignature, timestamp, nonce, echostr) {
    const signature = SHA1.getSHA1(this.token, timestamp, nonce, echostr);
    if (signature !== msgSignature) {
      throw new Error('签名验证错误');
    }

    return this.decrypt(echostr);
  }

  /**
   * 对密文进行解密
   *
   * @param text 需要解密的密文
   *
   * @return 解密得到的明文
   */
  decrypt(text) {
    // 设置解密模式为AES的CBC模式
    const iv = this.aesKey.slice(0, 16);
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.aesKey, iv);

    // 使用BASE64对密文进行解码
    const encrypted = Buffer.from(text, 'base64');

    // 解密
    decipher.setAutoPadding(false);
    const original = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    // 去除补位字符
    const bytes = PKCS7Encoder.decode(original);

    // 分离16位随机字符串,网络字节序和corpid
    const networkOrder = bytes.slice(16, 20);
    const xmlLength = WeworkCrypt.recoverNetworkBytesOrder(networkOrder);

    const xmlContent = String(bytes.slice(20, 20 + xmlLength));
    // const fromCorpid = String(bytes.slice(20 + xmlLength, bytes.length));

    // if (fromCorpid !== this.corpid) {
    //   throw new Error('corpid校验失败');
    // }

    return xmlContent;
  }

  /**
   * 对明文进行加密
   *
   * @param text 需要加密的明文
   * @param randomStr 16个随机字符(可选)
   *
   * @return 加密后base64编码的字符串
   */
  encrypt(text, randomStr) {
    const randomStrBytes = Buffer.from(randomStr || WeworkCrypt.getRandomStr());
    const textBytes = Buffer.from(text);
    const networkBytesOrder = WeworkCrypt.getNetworkBytesOrder(textBytes.length);
    const corpidBytes = Buffer.from(this.corpid);
    // randomStr + networkBytesOrder + text + corpid
    const byteCollector =
      Buffer.concat([randomStrBytes, networkBytesOrder, textBytes, corpidBytes]);

    // ... + pad: 使用自定义的填充方式对明文进行补位填充
    const padBytes = PKCS7Encoder.encode(byteCollector.length);
    const unencrypted = Buffer.concat([byteCollector, padBytes]);

    // 设置加密模式为AES的CBC模式
    const iv = this.aesKey.slice(0, 16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.aesKey, iv);

    // 加密
    cipher.setAutoPadding(false);
    const encrypted = Buffer.concat([
      cipher.update(unencrypted),
      cipher.final()
    ]);

    // 使用BASE64对加密后的字符串进行编码
    const base64Encrypted = encrypted.toString('base64');

    return base64Encrypted;
  }

  /**
   * 将企业微信回复用户的消息加密打包
   * 对要发送的消息进行AES-CBC加密
   * 生成安全签名
   * 将消息密文和安全签名打包成xml格式
   *
   * @param replyMsg 企业微信待回复用户的消息，xml格式的字符串
   * @param timestamp 时间戳，可以自己生成，也可以用URL参数的timestamp
   * @param nonce 随机串，可以自己生成，也可以用URL参数的nonce
   *
   * @return 加密后的可以直接回复用户的密文，包括msg_signature, timestamp, nonce, encrypt的xml格式的字符串
   */
  encryptMsg(replyMsg, timestamp = String(Number(new Date())), nonce) {
    // 加密
    const encrypt = this.encrypt(replyMsg);

    // 生成安全签名
    const signature = SHA1.getSHA1(this.token, timestamp, nonce, encrypt);

    // 生成发送的xml
    return XMLParse.generate(encrypt, signature, timestamp, nonce);
  }

  /**
   * 检验消息的真实性，并且获取解密后的明文
   * 利用收到的密文生成安全签名，进行签名验证
   * 若验证通过，则提取xml中的加密消息
   * 对消息进行解密
   *
   * @param msgSignature 签名串，对应URL参数的msg_signature
   * @param timestamp 时间戳，对应URL参数的timestamp
   * @param nonce 随机串，对应URL参数的nonce
   * @param data 密文，对应POST请求的数据
   *
   * @return 解密后的原文
   */
  async decryptMsg(msgSignature, timestamp, nonce, data) {
    // 提取密文 密钥，公众账号的app secret
    const encrypt = typeof data === 'string' ? await XMLParse.extract(data) : data;

    // 验证安全签名
    const signature = SHA1.getSHA1(this.token, timestamp, nonce, encrypt.Encrypt[0]);
    // 和URL中的签名比较是否相等
    if (signature !== msgSignature) {
      throw new Error('签名验证错误');
    }

    // 解密
    return this.decrypt(encrypt.Encrypt[0]);
  }

  // 还原4个字节的网络字节序
  static recoverNetworkBytesOrder(orderBytes) {
    let sourceNumber = 0;
    for (let i = 0; i < 4; i += 1) {
      sourceNumber <<= 8;
      sourceNumber |= orderBytes[i] & 0xff;
    }

    return sourceNumber;
  }

  // 生成4个字节的网络字节序
  static getNetworkBytesOrder(sourceNumber) {
    const orderBytes = Buffer.alloc(4);

    orderBytes[3] = (sourceNumber & 0xFF);
    orderBytes[2] = ((sourceNumber >> 8) & 0xFF);
    orderBytes[1] = ((sourceNumber >> 16) & 0xFF);
    orderBytes[0] = ((sourceNumber >> 24) & 0xFF);

    return orderBytes;
  }

  // 随机生成16位字符串
  static getRandomStr() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let str = '';
    for (let i = 0; i < 16; i += 1) {
      str += chars[Math.floor(Math.random() * chars.length)];
    }

    return str;
  }
};
